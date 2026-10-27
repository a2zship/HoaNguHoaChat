/* Hoa Ngữ Hóa Chất — ứng dụng học tiếng Trung ngành hóa chất & XNK. Chạy offline, lưu tiến độ trong localStorage. */
(function () {
  "use strict";
  var C = window.HC_CORE, I = window.HC_ICON;
  var TOPICS = window.HC_VOCAB.TOPICS, WORDS = window.HC_VOCAB.WORDS, DIALOGUES = window.HC_DIALOGUES.DIALOGUES;
  var BY_ID = {}; WORDS.forEach(function (w) { BY_ID[w.id] = w; });
  var TOPIC_BY_ID = {}; TOPICS.forEach(function (t) { TOPIC_BY_ID[t.id] = t; });
  var KEY = "hoangu-hoachat-v1";
  var main = document.getElementById("main");

  // ---------- Lưu trữ ----------
  function defaults() {
    return { cards: {}, days: [], newLog: {}, quiz: { done: 0, correct: 0 }, settings: { rate: 0.85, newPerDay: 10, pinyinFront: false, theme: "auto" } };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      var d = JSON.parse(raw), base = defaults();
      return Object.assign(base, d, { settings: Object.assign(base.settings, d.settings || {}), quiz: Object.assign(base.quiz, d.quiz || {}) });
    } catch (e) { return defaults(); }
  }
  var S = load();
  var storageOk = true;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); storageOk = true; } catch (e) { storageOk = false; }
  }
  function markStudied() {
    var k = C.dayKey();
    if (S.days.indexOf(k) < 0) { S.days.push(k); if (S.days.length > 400) S.days = S.days.slice(-400); }
  }
  function newToday() { return S.newLog[C.dayKey()] || 0; }
  function applyTheme() {
    if (S.settings.theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", S.settings.theme);
  }
  applyTheme();

  // ---------- Tiện ích ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function wordsOf(topicId) { return WORDS.filter(function (w) { return w.t === topicId; }); }
  function dueIds(now) {
    now = now || Date.now();
    return Object.keys(S.cards).filter(function (id) { return BY_ID[id] && C.isDue(S.cards[id], now); })
      .sort(function (a, b) { return S.cards[a].due - S.cards[b].due; });
  }
  function masteredCount(list) { return (list || WORDS).filter(function (w) { return C.isMastered(S.cards[w.id]); }).length; }
  function statusBadge(id) {
    var c = S.cards[id];
    if (!c) return '<span class="badge new">Chưa học</span>';
    if (C.isDue(c)) return '<span class="badge warn">' + I("clock", 14) + "Đến hạn ôn</span>";
    if (C.isMastered(c)) return '<span class="badge ok">' + I("check", 14) + "Đã thuộc</span>";
    return '<span class="badge new">Đang học</span>';
  }
  function speakBtn(text, label) {
    return '<button class="btn speak" type="button" data-act="speak" data-text="' + esc(text) + '" aria-label="' + esc(label || "Nghe phát âm") + '">' + I("volume", 20) + "</button>";
  }
  function note(kind, icon, html, role) {
    return '<div class="note ' + kind + '" role="' + (role || (kind === "bad" ? "alert" : "status")) + '">' + I(icon, 20) + "<div>" + html + "</div></div>";
  }
  function empty(icon, title, text) {
    return '<div class="empty">' + I(icon, 32) + "<strong>" + esc(title) + "</strong>" + esc(text) + "</div>";
  }
  function pageHead(title, sub, back) {
    return '<header class="page-head">' + (back ? '<a class="back" href="' + back[0] + '">' + I("left", 18) + esc(back[1]) + "</a>" : "") +
      '<h1 tabindex="-1">' + esc(title) + "</h1>" + (sub ? "<p>" + sub + "</p>" : "") + "</header>";
  }

  // ---------- Phát âm (Web Speech API) ----------
  var voice = null, voicesChecked = false;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    var vs = speechSynthesis.getVoices();
    if (!vs.length) return;
    voicesChecked = true;
    var zh = vs.filter(function (v) { return /^zh[-_](CN|Hans)/i.test(v.lang) || v.lang === "zh"; });
    if (!zh.length) zh = vs.filter(function (v) { return /^zh|^cmn/i.test(v.lang); });
    voice = zh.sort(function (a, b) { return score(b) - score(a); })[0] || null;
    function score(v) { return (/natural|online|xiaoxiao|yunxi/i.test(v.name) ? 2 : 0) + (/zh-CN/i.test(v.lang) ? 1 : 0); }
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = function () { pickVoice(); if (route().name === "settings" || route().name === "home") render(); };
  }
  var speakToken = 0;
  function speak(text) {
    return new Promise(function (resolve) {
      if (!("speechSynthesis" in window)) return resolve(false);
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN";
      if (voice) u.voice = voice;
      u.rate = Number(S.settings.rate) || 0.85;
      u.onend = function () { resolve(true); };
      u.onerror = function () { resolve(false); };
      speechSynthesis.speak(u);
    });
  }
  function stopSpeaking() { speakToken++; if ("speechSynthesis" in window) speechSynthesis.cancel(); }

  // ---------- Nhận dạng giọng nói ----------
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  function listen() {
    return new Promise(function (resolve, reject) {
      if (!Rec) return reject(new Error("unsupported"));
      var r = new Rec();
      r.lang = "zh-CN"; r.interimResults = false; r.maxAlternatives = 3;
      var done = false;
      r.onresult = function (e) {
        done = true;
        var alts = [];
        for (var i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
        resolve(alts);
      };
      r.onerror = function (e) { done = true; reject(new Error(e.error || "error")); };
      r.onend = function () { if (!done) reject(new Error("no-speech")); };
      r.start();
    });
  }
  function listenErrorText(err) {
    var m = err && err.message;
    if (m === "unsupported") return "Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome hoặc Edge trên máy tính/Android.";
    if (m === "not-allowed" || m === "service-not-allowed") return "Chưa được phép dùng micro. Bấm biểu tượng ổ khoá trên thanh địa chỉ, cho phép Micro rồi thử lại.";
    if (m === "network") return "Nhận dạng giọng nói cần có mạng Internet. Kiểm tra kết nối rồi thử lại.";
    if (m === "no-speech") return "Không nghe thấy tiếng. Bấm Nói thử rồi đọc to, rõ ngay sau tiếng bíp.";
    return "Không nhận dạng được (" + esc(m) + "). Thử lại sau ít giây.";
  }

  // ---------- Router ----------
  var NAV = [
    { href: "#/", name: "home", label: "Hôm nay", icon: "home" },
    { href: "#/tu-vung", name: "vocab", label: "Từ vựng", icon: "book" },
    { href: "#/on-the", name: "review", label: "Ôn thẻ", icon: "layers" },
    { href: "#/luyen-tap", name: "quiz", label: "Luyện tập", icon: "target" },
    { href: "#/hoi-thoai", name: "dialogue", label: "Hội thoại", icon: "chat" },
    { href: "#/cai-dat", name: "settings", label: "Cài đặt", icon: "settings" }
  ];
  var ROUTES = { "": "home", "tu-vung": "vocab", "on-the": "review", "luyen-tap": "quiz", "hoi-thoai": "dialogue", "cai-dat": "settings" };
  function route() {
    var parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
    return { name: ROUTES[parts[0]] || "home", arg: parts[1] || "" };
  }
  function renderNav(active) {
    var side = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (n.name === active ? ' aria-current="page"' : "") + ">" + I(n.icon, 20) + "<span>" + n.label + "</span></a>";
    }).join("");
    var bottom = NAV.slice(0, 5).map(function (n) {
      return '<a href="' + n.href + '"' + (n.name === active ? ' aria-current="page"' : "") + ">" + I(n.icon, 22) + "<span>" + n.label + "</span></a>";
    }).join("");
    document.getElementById("side-nav").innerHTML = side;
    document.getElementById("bottom-nav").innerHTML = bottom;
    var sb = document.getElementById("settings-btn");
    if (active === "settings") sb.setAttribute("aria-current", "page"); else sb.removeAttribute("aria-current");
  }

  var lastRouteKey = null;
  function render() {
    var r = route();
    renderNav(r.name);
    var html = (PAGES[r.name] || PAGES.home)(r.arg);
    main.innerHTML = '<div class="fade-in">' + html + "</div>";
    var key = r.name + "/" + r.arg;
    if (key !== lastRouteKey) {
      if (lastRouteKey !== null) { var h = main.querySelector("h1"); if (h) h.focus({ preventScroll: true }); window.scrollTo(0, 0); }
      lastRouteKey = key;
    }
    var after = AFTER[r.name]; if (after) after(r.arg);
  }
  window.addEventListener("hashchange", function () { stopSpeaking(); render(); });

  // ---------- Trang: Hôm nay ----------
  var PAGES = {}, AFTER = {};
  PAGES.home = function () {
    var due = dueIds().length, mastered = masteredCount(), learned = Object.keys(S.cards).length;
    var st = C.streak(S.days), newLeft = Math.max(0, S.settings.newPerDay - newToday());
    var h = pageHead("Hôm nay học gì?", "Tiếng Trung cho người làm hóa chất & xuất nhập khẩu: " + WORDS.length + " từ chuyên ngành, " + DIALOGUES.length + " hội thoại tình huống.");
    if (voicesChecked && !voice) h += note("warn", "alert", "Máy này chưa có giọng đọc tiếng Trung nên nút loa sẽ không phát âm. Xem cách cài ở <a href=\"#/cai-dat\">Cài đặt</a>.");
    if (!storageOk) h += note("bad", "alert", "Không lưu được tiến độ (trình duyệt chặn bộ nhớ hoặc đang ở chế độ ẩn danh).");
    h += '<div class="grid grid-3">' +
      '<div class="card stat"><div class="stat-ic warn">' + I("clock", 22) + "</div><div><b>" + due + "</b><span>thẻ đến hạn ôn</span></div></div>" +
      '<div class="card stat"><div class="stat-ic ok">' + I("check", 22) + "</div><div><b>" + mastered + "/" + WORDS.length + "</b><span>từ đã thuộc</span></div></div>" +
      '<div class="card stat"><div class="stat-ic">' + I("flame", 22) + "</div><div><b>" + st + " ngày</b><span>học liên tiếp</span></div></div></div>";
    h += '<div class="card section stack"><h2>Việc hôm nay</h2>';
    if (due + newLeft > 0) {
      h += "<p class=\"muted\">" + (due ? due + " thẻ cần ôn lại" : "Không có thẻ cần ôn") + " · " + newLeft + " từ mới còn lại trong ngày (đã đặt " + S.settings.newPerDay + " từ/ngày).</p>";
      h += '<div class="btn-row"><a class="btn btn-primary" href="#/on-the">' + I("layers", 20) + (due ? "Ôn ngay " + (due + newLeft) + " thẻ" : "Học " + newLeft + " từ mới") + "</a>" +
        '<a class="btn" href="#/luyen-tap">' + I("target", 20) + "Làm bài luyện 10 câu</a></div>";
    } else {
      h += note("ok", "check", "Đã xong phần hôm nay. Muốn học thêm thì chọn một chủ đề ở mục Từ vựng hoặc luyện một hội thoại.");
    }
    h += "</div>";
    h += '<section class="section"><div class="row-between"><h2>Tiến độ theo chủ đề</h2><span class="muted num">' + learned + " từ đã bắt đầu học</span></div>" + topicGrid() + "</section>";
    return h;
  };

  function topicGrid() {
    return '<div class="grid grid-2">' + TOPICS.map(function (t) {
      var ws = wordsOf(t.id), m = masteredCount(ws), started = ws.filter(function (w) { return S.cards[w.id]; }).length;
      var pct = ws.length ? Math.round((m / ws.length) * 100) : 0;
      return '<a class="card topic" href="#/tu-vung/' + t.id + '"><div class="stat-ic">' + I(t.icon, 22) + '</div><div class="topic-body"><strong>' + esc(t.ten) + "</strong><small>" + esc(t.mota) + '</small><div class="progress" role="progressbar" aria-label="Đã thuộc ' + esc(t.ten) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div></div><span class="topic-count">' + m + "/" + ws.length + (started > m ? "<br>" + started + " đang học" : "") + "</span></a>";
    }).join("") + "</div>";
  }

  // ---------- Trang: Từ vựng ----------
  var vocabQuery = "";
  function wordRow(w, showTopic) {
    var ex = w.ex ? '<div class="word-ex"><div><span class="han">' + esc(w.ex.h) + "</span> " + speakBtnSmall(w.ex.h) + '</div><div class="py">' + esc(w.ex.p) + '</div><div class="muted">' + esc(w.ex.v) + "</div></div>" : "";
    return '<div class="word"><div class="word-main"><div><span class="han">' + esc(w.h) + '</span><span class="py">' + esc(w.p) + '</span></div><p class="vi">' + esc(w.v) + "</p>" +
      '<div class="btn-row" style="margin-top:6px">' + statusBadge(w.id) + (showTopic ? '<span class="badge new">' + esc(TOPIC_BY_ID[w.t].ten) + "</span>" : "") + "</div>" + ex + "</div>" + speakBtn(w.h, "Nghe " + w.v) + "</div>";
  }
  function speakBtnSmall(text) {
    return '<button class="btn btn-ghost" style="min-height:44px;min-width:44px;padding:0 8px;vertical-align:middle" type="button" data-act="speak" data-text="' + esc(text) + '" aria-label="Nghe câu ví dụ">' + I("volume", 18) + "</button>";
  }
  function searchWords(q) {
    var n = q.trim().toLowerCase(); if (!n) return [];
    var plain = C.plainPinyin(n);
    return WORDS.filter(function (w) {
      return w.h.indexOf(q.trim()) >= 0 || w.v.toLowerCase().indexOf(n) >= 0 || (plain && C.plainPinyin(w.p).indexOf(plain) >= 0);
    });
  }
  PAGES.vocab = function (arg) {
    if (arg && TOPIC_BY_ID[arg]) {
      var t = TOPIC_BY_ID[arg], ws = wordsOf(arg), fresh = ws.filter(function (w) { return !S.cards[w.id]; }).length;
      var h = pageHead(t.ten, ws.length + " từ · " + masteredCount(ws) + " đã thuộc", ["#/tu-vung", "Tất cả chủ đề"]);
      h += '<div class="toolbar"><a class="btn btn-primary" href="#/on-the/' + t.id + '">' + I("layers", 20) + (fresh ? "Học thẻ chủ đề này (" + fresh + " từ mới)" : "Ôn thẻ chủ đề này") + "</a>" +
        '<a class="btn" href="#/luyen-tap/' + t.id + '">' + I("target", 20) + "Luyện tập chủ đề</a></div>";
      h += '<div class="card list">' + ws.map(function (w) { return wordRow(w, false); }).join("") + "</div>";
      return h;
    }
    var h2 = pageHead("Từ vựng chuyên ngành", "Chọn chủ đề hoặc tra nhanh bằng chữ Hán, pinyin (gõ không dấu cũng được) hay nghĩa tiếng Việt.");
    h2 += '<div class="field" style="margin-bottom:16px"><label for="q">Tra từ</label><div class="search">' + I("search", 18) + '<input id="q" class="input" type="search" autocomplete="off" placeholder="Ví dụ: baojia, 报价, báo giá" value="' + esc(vocabQuery) + '"></div></div>';
    h2 += '<div id="search-results"></div><div id="topic-list">' + topicGrid() + "</div>";
    return h2;
  };
  AFTER.vocab = function (arg) {
    var q = document.getElementById("q"); if (!q) return;
    function update() {
      vocabQuery = q.value;
      var box = document.getElementById("search-results"), list = document.getElementById("topic-list");
      if (!vocabQuery.trim()) { box.innerHTML = ""; list.hidden = false; return; }
      var res = searchWords(vocabQuery);
      list.hidden = true;
      box.innerHTML = '<p class="muted" role="status">' + res.length + " kết quả</p>" + (res.length ? '<div class="card list">' + res.slice(0, 60).map(function (w) { return wordRow(w, true); }).join("") + "</div>" : '<div class="card">' + empty("search", "Không tìm thấy từ nào", "Thử gõ ngắn hơn, ví dụ \"bao\" thay vì \"bao gia\".") + "</div>");
    }
    q.addEventListener("input", update);
    if (vocabQuery) update();
  };

  // ---------- Trang: Ôn thẻ (SRS) ----------
  var session = null;
  function buildQueue(topicId) {
    var pool = topicId ? wordsOf(topicId) : WORDS;
    var poolIds = {}; pool.forEach(function (w) { poolIds[w.id] = true; });
    var due = dueIds().filter(function (id) { return poolIds[id]; });
    var limit = topicId ? pool.length : Math.max(0, S.settings.newPerDay - newToday());
    var fresh = pool.filter(function (w) { return !S.cards[w.id]; }).slice(0, limit).map(function (w) { return w.id; });
    return { ids: due.concat(fresh), newIds: fresh, topic: topicId || "", i: 0, revealed: false, done: 0, again: 0 };
  }
  PAGES.review = function (arg) {
    var topicId = TOPIC_BY_ID[arg] ? arg : "";
    if (!session || session.topic !== topicId) session = buildQueue(topicId);
    var back = topicId ? ["#/tu-vung/" + topicId, TOPIC_BY_ID[topicId].ten] : null;
    var title = topicId ? "Thẻ: " + TOPIC_BY_ID[topicId].ten : "Ôn thẻ ghi nhớ";
    if (session.i >= session.ids.length) {
      var h = pageHead(title, null, back);
      if (session.done) {
        h += '<div class="card stack" style="text-align:center"><div class="result-big">' + session.done + "</div><p>thẻ đã ôn trong lượt này" + (session.again ? ", " + session.again + " thẻ chọn Quên sẽ quay lại sau 10 phút" : "") + ".</p>" +
          note("ok", "check", "Xong lượt ôn. Ứng dụng tự xếp lịch: từ dễ sẽ hẹn vài ngày sau, từ khó hẹn sớm hơn.") +
          '<div class="btn-row" style="justify-content:center"><button class="btn btn-primary" type="button" data-act="new-session">' + I("rotate", 20) + "Kiểm tra thẻ mới đến hạn</button><a class=\"btn\" href=\"#/luyen-tap\">" + I("target", 20) + "Làm bài luyện</a></div></div>";
      } else {
        h += '<div class="card">' + empty("check", "Chưa có thẻ nào cần ôn", topicId ? "Bạn đã học hết từ mới của chủ đề này. Thẻ sẽ hiện lại khi đến hạn ôn." : "Đã ôn hết thẻ đến hạn và đủ số từ mới hôm nay. Muốn học thêm, vào Từ vựng → chọn chủ đề → Học thẻ chủ đề này.") +
          '<div class="btn-row" style="justify-content:center"><a class="btn" href="#/tu-vung">' + I("book", 20) + "Chọn chủ đề</a></div></div>";
      }
      return h;
    }
    var id = session.ids[session.i], w = BY_ID[id], isNew = session.newIds.indexOf(id) >= 0 && !S.cards[id];
    var hh = pageHead(title, null, back);
    hh += '<div class="flash-meta"><span class="num">Thẻ ' + (session.i + 1) + "/" + session.ids.length + "</span>" + (isNew ? '<span class="badge new">Từ mới</span>' : '<span class="badge warn">' + I("clock", 14) + "Ôn lại</span>") + "</div>";
    hh += '<div class="card flash" aria-live="polite"><div class="han" lang="zh-CN">' + esc(w.h) + "</div>";
    if (session.revealed || S.settings.pinyinFront) hh += '<div class="py">' + esc(w.p) + "</div>";
    if (session.revealed) {
      hh += '<div class="vi">' + esc(w.v) + "</div>";
      if (w.ex) hh += '<div class="word-ex" style="text-align:left;max-width:520px;margin-top:12px"><div class="han" lang="zh-CN">' + esc(w.ex.h) + " " + speakBtnSmall(w.ex.h) + '</div><div class="py">' + esc(w.ex.p) + '</div><div class="muted">' + esc(w.ex.v) + "</div></div>";
    }
    hh += '<div style="margin-top:12px">' + speakBtn(w.h) + "</div></div>";
    if (!session.revealed) {
      hh += '<button class="btn btn-primary btn-block" style="margin-top:16px;min-height:52px" type="button" data-act="reveal">' + I("eye", 20) + "Hiện đáp án</button>";
      hh += '<p class="kbd-hint">Tự nhớ nghĩa trước rồi mới lật. Phím tắt: Space để lật.</p>';
    } else {
      var c = S.cards[id];
      hh += '<div class="rate" role="group" aria-label="Bạn nhớ từ này thế nào?">' +
        rateBtn(0, "Quên", "10 phút") + rateBtn(1, "Khó", fmtNext(C.review(c, 1))) + rateBtn(2, "Nhớ", fmtNext(C.review(c, 2))) + rateBtn(3, "Dễ", fmtNext(C.review(c, 3))) + "</div>";
      hh += '<p class="kbd-hint">Phím tắt: 1 Quên · 2 Khó · 3 Nhớ · 4 Dễ</p>';
    }
    return hh;
  };
  function rateBtn(n, label, next) {
    return '<button class="btn r' + n + '" type="button" data-act="rate" data-r="' + n + '">' + label + "<small>" + next + "</small></button>";
  }
  function fmtNext(card) { return card.interval + " ngày"; }
  AFTER.review = function () {
    if (session && session.i < session.ids.length && !session.revealed && session.autoplay !== session.i) {
      session.autoplay = session.i;
      speak(BY_ID[session.ids[session.i]].h);
    }
  };
  function rate(r) {
    var id = session.ids[session.i];
    if (!S.cards[id]) S.newLog[C.dayKey()] = newToday() + 1;
    S.cards[id] = C.review(S.cards[id], r);
    markStudied(); save();
    session.done++;
    if (r === 0) session.again++;
    session.i++; session.revealed = false;
    render();
  }

  // ---------- Trang: Luyện tập ----------
  var QTYPES = [
    { id: "h2v", label: "Hán → Việt", desc: "Nhìn chữ Hán, chọn nghĩa" },
    { id: "v2h", label: "Việt → Hán", desc: "Đọc nghĩa, chọn chữ Hán" },
    { id: "listen", label: "Nghe → chọn", desc: "Nghe phát âm, chọn nghĩa" },
    { id: "pinyin", label: "Gõ pinyin", desc: "Nhìn chữ Hán, gõ pinyin" }
  ];
  var quizCfg = { topic: "", type: "h2v" }, quiz = null;
  function makeQuiz(cfg) {
    var pool = cfg.topic ? wordsOf(cfg.topic) : WORDS;
    var picks = C.shuffle(pool).slice(0, Math.min(10, pool.length));
    var qs = picks.map(function (w) {
      var same = WORDS.filter(function (x) { return x.t === w.t && x.id !== w.id; });
      var other = WORDS.filter(function (x) { return x.t !== w.t; });
      var distract = C.shuffle(same).slice(0, 3);
      if (distract.length < 3) distract = distract.concat(C.shuffle(other).slice(0, 3 - distract.length));
      return { w: w, opts: C.shuffle([w].concat(distract)), answered: null };
    });
    return { cfg: { topic: cfg.topic, type: cfg.type }, qs: qs, i: 0, correct: 0, wrongIds: [] };
  }
  PAGES.quiz = function (arg) {
    if (arg && TOPIC_BY_ID[arg] && !quiz) quizCfg.topic = arg;
    if (!quiz) {
      var h = pageHead("Luyện tập", "Mỗi bài 10 câu. Câu làm sai được tự động đưa vào Ôn thẻ để học lại.");
      h += '<div class="card stack"><h2 id="qt-label">Kiểu bài</h2><div class="chips" role="group" aria-labelledby="qt-label">' + QTYPES.map(function (t) {
        return '<button class="chip" type="button" data-act="qtype" data-v="' + t.id + '" aria-pressed="' + (quizCfg.type === t.id) + '" title="' + esc(t.desc) + '">' + t.label + "</button>";
      }).join("") + '</div><p class="muted">' + esc(QTYPES.filter(function (t) { return t.id === quizCfg.type; })[0].desc) + "</p>";
      h += '<div class="field"><label for="qtopic">Chủ đề</label><select id="qtopic" class="select"><option value="">Tất cả chủ đề (' + WORDS.length + " từ)</option>" + TOPICS.map(function (t) {
        return '<option value="' + t.id + '"' + (quizCfg.topic === t.id ? " selected" : "") + ">" + esc(t.ten) + " (" + wordsOf(t.id).length + ")</option>";
      }).join("") + "</select></div>";
      h += '<button class="btn btn-primary" type="button" data-act="quiz-start">' + I("play", 20) + "Bắt đầu 10 câu</button></div>";
      if (S.quiz.done) h += '<p class="muted section num">Đã làm ' + S.quiz.done + " câu, đúng " + Math.round((S.quiz.correct / S.quiz.done) * 100) + "%.</p>";
      return h;
    }
    var q = quiz.qs[quiz.i];
    if (!q) {
      var pct = Math.round((quiz.correct / quiz.qs.length) * 100);
      var r = pageHead("Kết quả bài luyện", null);
      r += '<div class="card stack" style="text-align:center"><div class="result-big">' + quiz.correct + "/" + quiz.qs.length + "</div><p>câu đúng (" + pct + "%)</p>" +
        (quiz.wrongIds.length ? note("warn", "rotate", quiz.wrongIds.length + " từ làm sai đã được đưa vào Ôn thẻ: " + quiz.wrongIds.map(function (id) { return '<span class="han">' + esc(BY_ID[id].h) + "</span>"; }).join(", ")) : note("ok", "check", "Đúng hết, rất tốt!")) +
        '<div class="btn-row" style="justify-content:center"><button class="btn btn-primary" type="button" data-act="quiz-again">' + I("rotate", 20) + "Làm bài khác</button>" +
        (quiz.wrongIds.length ? '<a class="btn" href="#/on-the">' + I("layers", 20) + "Ôn lại từ sai</a>" : "") + '<button class="btn btn-ghost" type="button" data-act="quiz-exit">Đổi kiểu bài</button></div></div>';
      return r;
    }
    var type = quiz.cfg.type, w = q.w;
    var hq = pageHead("Câu " + (quiz.i + 1) + "/" + quiz.qs.length, QTYPES.filter(function (t) { return t.id === type; })[0].desc);
    hq += '<div class="card"><div class="quiz-q">';
    if (type === "h2v" || type === "pinyin") hq += '<div class="han" lang="zh-CN">' + esc(w.h) + "</div>" + (type === "pinyin" ? '<p class="muted">' + esc(w.v) + "</p>" : "");
    if (type === "v2h") hq += '<p style="font-size:22px;font-weight:600;margin:0">' + esc(w.v) + "</p>";
    if (type === "listen") hq += '<button class="btn btn-primary" style="min-height:64px;padding:0 24px" type="button" data-act="speak" data-text="' + esc(w.h) + '">' + I("volume", 24) + "Nghe lại</button>";
    hq += "</div>";
    if (type === "pinyin") {
      var ans = q.answered;
      hq += '<form data-form="pinyin" class="stack" autocomplete="off"><div class="field"><label for="pyin">Pinyin của từ trên</label><input id="pyin" class="input" lang="en" autocapitalize="off" spellcheck="false" placeholder="Gõ không dấu cũng được, ví dụ: baojia"' + (ans ? " disabled value=\"" + esc(ans.input) + "\"" : "") + "></div>";
      if (!ans) hq += '<button class="btn btn-primary" type="submit">' + I("check", 20) + "Kiểm tra</button>";
      hq += "</form>";
      if (ans) hq += '<div style="margin-top:12px">' + (ans.ok ? note("ok", "check", "Đúng: <span class=\"py\">" + esc(w.p) + "</span>") : note("bad", "x", "Chưa đúng. Đáp án: <span class=\"py\">" + esc(w.p) + "</span>", "status")) + "</div>";
    } else {
      hq += '<div class="opts">' + q.opts.map(function (o, k) {
        var cls = "opt";
        if (q.answered) { if (o.id === w.id) cls += " correct"; else if (o.id === q.answered) cls += " wrong"; }
        var label = type === "v2h" ? '<span class="han" lang="zh-CN">' + esc(o.h) + "</span>" : "<span>" + esc(o.v) + "</span>";
        var mark = q.answered && o.id === w.id ? I("check", 18) : q.answered && o.id === q.answered ? I("x", 18) : '<span class="opt-key">' + (k + 1) + "</span>";
        return '<button class="' + cls + '" type="button" data-act="answer" data-id="' + o.id + '"' + (q.answered ? " disabled" : "") + ">" + mark + label + "</button>";
      }).join("") + "</div>";
      if (q.answered) hq += '<div style="margin-top:12px">' + (q.answered === w.id ? note("ok", "check", "Đúng. ") : note("bad", "x", "Sai. Đáp án đúng được đánh dấu ở trên.", "status")) + "</div>";
    }
    if (q.answered) {
      hq += '<div class="card" style="margin-top:12px;box-shadow:none;background:var(--surface-2)"><span class="han" style="font-size:22px">' + esc(w.h) + '</span> <span class="py">' + esc(w.p) + "</span> " + speakBtnSmall(w.h) + '<div class="muted">' + esc(w.v) + "</div></div>";
      hq += '<button class="btn btn-primary btn-block" style="margin-top:12px" type="button" data-act="quiz-next">' + (quiz.i + 1 < quiz.qs.length ? "Câu tiếp" : "Xem kết quả") + I("right", 20) + "</button>";
    }
    hq += '</div><p class="kbd-hint">' + (type === "pinyin" ? "Enter để kiểm tra, rồi Enter lần nữa để sang câu tiếp." : "Phím tắt: 1–4 chọn đáp án · Enter sang câu tiếp.") + "</p>";
    return hq;
  };
  AFTER.quiz = function () {
    var sel = document.getElementById("qtopic");
    if (sel) sel.addEventListener("change", function () { quizCfg.topic = sel.value; });
    if (!quiz) return;
    var q = quiz.qs[quiz.i]; if (!q) return;
    if (quiz.cfg.type === "listen" && !q.answered && q.played !== true) { q.played = true; speak(q.w.h); }
    var inp = document.getElementById("pyin"); if (inp && !q.answered) inp.focus();
    if (q.answered) { var nx = main.querySelector('[data-act="quiz-next"]'); if (nx) nx.focus({ preventScroll: true }); }
  };
  function answer(ok, id) {
    var q = quiz.qs[quiz.i];
    q.answered = id;
    S.quiz.done++;
    if (ok) { quiz.correct++; S.quiz.correct++; }
    else {
      quiz.wrongIds.push(q.w.id);
      // Làm sai: đưa thẻ về "Quên" để hiện lại ngay trong Ôn thẻ.
      var c = S.cards[q.w.id];
      S.cards[q.w.id] = c ? C.review(c, 0) : Object.assign(C.review(null, 0), { due: Date.now() });
    }
    markStudied(); save();
    if (!ok) speak(q.w.h);
    render();
  }

  // ---------- Trang: Hội thoại ----------
  var dlg = { pinyin: true, vi: true, hideMine: false, revealed: {}, scores: {}, playing: -1, listening: -1, err: "" };
  PAGES.dialogue = function (arg) {
    var d = DIALOGUES.filter(function (x) { return x.id === arg; })[0];
    if (!d) {
      var h = pageHead("Hội thoại tình huống", "Bạn là bên mua Việt Nam, làm việc với nhà cung cấp Trung Quốc. Nghe từng câu, bấm Nói thử để luyện phát âm.");
      h += '<div class="grid grid-2">' + DIALOGUES.map(function (x, i) {
        return '<a class="card topic" href="#/hoi-thoai/' + x.id + '"><div class="stat-ic">' + '<span class="num" style="font-weight:600">' + (i + 1) + "</span></div><div class=\"topic-body\"><strong>" + esc(x.ten) + "</strong><small>" + esc(x.boiCanh) + '</small></div><span class="topic-count">' + x.lines.length + " câu</span></a>";
      }).join("") + "</div>";
      return h;
    }
    var hd = pageHead(d.ten, esc(d.boiCanh), ["#/hoi-thoai", "Tất cả hội thoại"]);
    hd += '<div class="toolbar">' +
      (dlg.playing >= 0 ? '<button class="btn btn-primary" type="button" data-act="dlg-stop">' + I("stop", 20) + "Dừng</button>" : '<button class="btn btn-primary" type="button" data-act="dlg-play">' + I("play", 20) + "Nghe cả bài</button>") +
      toggleChip("pinyin", "Pinyin") + toggleChip("vi", "Nghĩa") + toggleChip("hideMine", "Đóng vai: ẩn câu của tôi") + "</div>";
    if (dlg.hideMine) hd += note("info", "info", "Chế độ đóng vai: câu của bạn chỉ hiện nghĩa tiếng Việt. Hãy tự nói bằng tiếng Trung, bấm Nói thử để chấm, rồi bấm Hiện câu để so.");
    if (dlg.err) hd += note("bad", "alert", dlg.err);
    hd += '<div class="card" style="margin-top:12px">' + d.lines.map(function (l, i) {
      var me = l[0] === "A", hidden = me && dlg.hideMine && !dlg.revealed[d.id + i];
      var sc = dlg.scores[d.id + i];
      var tools = speakBtnSmallLabeled(l[1]) +
        (Rec ? '<button class="btn btn-ghost" style="min-height:44px;padding:0 10px" type="button" data-act="dlg-say" data-i="' + i + '"' + (dlg.listening === i ? ' aria-busy="true" disabled' : "") + ">" + I("mic", 18) + (dlg.listening === i ? "Đang nghe…" : "Nói thử") + "</button>" : "") +
        (hidden ? '<button class="btn btn-ghost" style="min-height:44px;padding:0 10px" type="button" data-act="dlg-reveal" data-i="' + i + '">' + I("eye", 18) + "Hiện câu</button>" : "");
      var scoreHtml = sc ? '<div class="note ' + (sc.score >= 80 ? "ok" : sc.score >= 50 ? "warn" : "bad") + '" role="status" style="margin-top:6px;padding:8px 10px;font-size:14px">' + I(sc.score >= 80 ? "check" : sc.score >= 50 ? "info" : "x", 18) + '<div><span class="score">' + sc.score + "/100</span> · " + (sc.score >= 80 ? "Tốt" : sc.score >= 50 ? "Gần đúng, nói chậm và rõ hơn" : "Chưa khớp, nghe lại rồi thử lần nữa") + '<br><span class="muted">Máy nghe được: </span><span class="han">' + esc(sc.heard || "(trống)") + "</span></div></div>" : "";
      return '<div class="line' + (me ? " me" : "") + '"><div class="bubble' + (dlg.playing === i ? " playing" : "") + '"><div class="who">' + (me ? "Bạn" : "Đối tác") + "</div>" +
        (hidden ? '<div class="vi" style="font-size:16px;color:var(--text)">' + esc(l[3]) + "</div>" :
          '<div class="han" lang="zh-CN">' + esc(l[1]) + "</div>" + (dlg.pinyin ? '<div class="py">' + esc(l[2]) + "</div>" : "") + (dlg.vi ? '<div class="vi">' + esc(l[3]) + "</div>" : "")) +
        '<div class="tools">' + tools + "</div>" + scoreHtml + "</div></div>";
    }).join("") + "</div>";
    if (!Rec) hd += '<div style="margin-top:12px">' + note("info", "info", "Muốn luyện nói có chấm điểm, mở ứng dụng bằng Chrome hoặc Edge (cần mạng Internet).") + "</div>";
    return hd;
  };
  function toggleChip(key, label) {
    return '<button class="chip" type="button" data-act="dlg-toggle" data-k="' + key + '" aria-pressed="' + !!dlg[key] + '">' + label + "</button>";
  }
  function speakBtnSmallLabeled(text) {
    return '<button class="btn btn-ghost" style="min-height:44px;padding:0 10px" type="button" data-act="speak" data-text="' + esc(text) + '">' + I("volume", 18) + "Nghe</button>";
  }
  function currentDialogue() { var a = route().arg; return DIALOGUES.filter(function (x) { return x.id === a; })[0]; }
  function playAll() {
    var d = currentDialogue(); if (!d) return;
    var token = ++speakToken, i = 0;
    (function next() {
      if (token !== speakToken || i >= d.lines.length) { dlg.playing = -1; render(); return; }
      dlg.playing = i; render();
      speak(d.lines[i][1]).then(function () { i++; setTimeout(next, 350); });
    })();
  }

  // ---------- Trang: Cài đặt ----------
  PAGES.settings = function () {
    var s = S.settings;
    var h = pageHead("Cài đặt", "Tiến độ học lưu ngay trên trình duyệt của máy này. Muốn chuyển sang máy khác, dùng Xuất / Nhập tiến độ.");
    h += '<div class="card stack"><h2>Học tập</h2>' +
      field("set-new", "Số từ mới mỗi ngày", '<select id="set-new" class="select" data-set="newPerDay">' + [5, 10, 15, 20, 30].map(function (n) { return '<option value="' + n + '"' + (s.newPerDay === n ? " selected" : "") + ">" + n + " từ</option>"; }).join("") + "</select>") +
      field("set-rate", "Tốc độ đọc", '<select id="set-rate" class="select" data-set="rate">' + [[0.6, "Rất chậm"], [0.75, "Chậm"], [0.85, "Vừa (khuyên dùng)"], [1, "Bình thường"]].map(function (o) { return '<option value="' + o[0] + '"' + (Number(s.rate) === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>") +
      '<label class="toggle" for="set-py"><span>Hiện pinyin trước khi lật thẻ</span><input id="set-py" type="checkbox" data-set="pinyinFront"' + (s.pinyinFront ? " checked" : "") + "></label>" +
      field("set-theme", "Giao diện", '<select id="set-theme" class="select" data-set="theme">' + [["auto", "Theo máy"], ["light", "Sáng"], ["dark", "Tối"]].map(function (o) { return '<option value="' + o[0] + '"' + (s.theme === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>") +
      '<div class="btn-row"><button class="btn" type="button" data-act="speak" data-text="您好，欢迎学习化工中文。">' + I("volume", 20) + "Thử giọng đọc</button></div>" +
      '<p class="muted" style="margin:0">' + (voice ? "Giọng đang dùng: " + esc(voice.name) : voicesChecked ? "" : "Đang tìm giọng đọc…") + "</p>" +
      (voicesChecked && !voice ? note("warn", "alert", "Chưa có giọng đọc tiếng Trung. <b>Cách nhanh nhất:</b> mở ứng dụng bằng Microsoft Edge (có sẵn giọng Xiaoxiao trực tuyến). <b>Hoặc trên Windows:</b> Cài đặt → Thời gian &amp; ngôn ngữ → Ngôn ngữ → Thêm ngôn ngữ → 中文(中华人民共和国), tick Chuyển văn bản thành giọng nói, rồi mở lại trình duyệt. <b>Điện thoại:</b> Cài đặt giọng nói (Text-to-speech) → tải gói tiếng Trung.") : "") + "</div>";
    var learned = Object.keys(S.cards).length;
    h += '<div class="card stack section"><h2>Dữ liệu tiến độ</h2><p class="muted num" style="margin:0">' + learned + " từ đã học · " + S.days.length + " ngày có học · " + S.quiz.done + " câu luyện tập.</p>" +
      '<div class="btn-row"><button class="btn" type="button" data-act="export">' + I("download", 20) + "Xuất tiến độ (.json)</button>" +
      '<label class="btn" for="import-file">' + I("upload", 20) + 'Nhập tiến độ</label><input id="import-file" class="sr-only" type="file" accept="application/json,.json">' +
      '<button class="btn btn-danger" type="button" data-act="reset">' + I("trash", 20) + "Xoá toàn bộ tiến độ</button></div><div id=\"data-msg\"></div></div>";
    h += '<div class="card stack section"><h2>Về nội dung</h2><p style="margin:0">' + WORDS.length + " từ trong " + TOPICS.length + " chủ đề, " + DIALOGUES.length + " hội thoại. Nội dung là bản soạn đầu, nên nhờ người thạo tiếng Trung trong ngành rà lại trước khi dùng để dạy rộng. Thêm từ: sửa file <code>data/tuvung.js</code>; thêm hội thoại: <code>data/hoithoai.js</code>.</p></div>";
    return h;
  };
  function field(id, label, control) { return '<div class="field"><label for="' + id + '">' + label + "</label>" + control + "</div>"; }
  AFTER.settings = function () {
    main.querySelectorAll("[data-set]").forEach(function (el) {
      el.addEventListener("change", function () {
        var k = el.getAttribute("data-set");
        S.settings[k] = el.type === "checkbox" ? el.checked : (k === "theme" ? el.value : Number(el.value));
        save(); if (k === "theme") applyTheme();
      });
    });
    var f = document.getElementById("import-file");
    f.addEventListener("change", function () {
      var file = f.files[0]; if (!file) return;
      var rd = new FileReader();
      rd.onload = function () {
        var msg = document.getElementById("data-msg");
        try {
          var d = JSON.parse(rd.result);
          if (!d || typeof d.cards !== "object") throw new Error("thiếu dữ liệu thẻ");
          if (!confirm("Nhập tiến độ từ file sẽ THAY THẾ tiến độ hiện tại trên máy này. Tiếp tục?")) return;
          var base = defaults();
          S = Object.assign(base, d, { settings: Object.assign(base.settings, d.settings || {}), quiz: Object.assign(base.quiz, d.quiz || {}) });
          save(); applyTheme(); session = null; render();
          document.getElementById("data-msg").innerHTML = note("ok", "check", "Đã nhập tiến độ: " + Object.keys(S.cards).length + " từ.");
        } catch (e) {
          msg.innerHTML = note("bad", "alert", "File không đúng định dạng tiến độ của ứng dụng (" + esc(e.message) + "). Hãy chọn file .json đã xuất từ mục Xuất tiến độ.");
        }
      };
      rd.readAsText(file);
    });
  };

  // ---------- Sự kiện chung ----------
  main.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
    var act = b.getAttribute("data-act");
    if (act === "speak") { stopSpeaking(); speak(b.getAttribute("data-text")); return; }
    if (act === "reveal") { session.revealed = true; render(); return; }
    if (act === "rate") { rate(Number(b.getAttribute("data-r"))); return; }
    if (act === "new-session") { session = null; render(); return; }
    if (act === "qtype") { quizCfg.type = b.getAttribute("data-v"); render(); return; }
    if (act === "quiz-start") { var sel = document.getElementById("qtopic"); quizCfg.topic = sel ? sel.value : ""; quiz = makeQuiz(quizCfg); render(); return; }
    if (act === "answer") { var q = quiz.qs[quiz.i]; answer(b.getAttribute("data-id") === q.w.id, b.getAttribute("data-id")); return; }
    if (act === "quiz-next") { quiz.i++; render(); return; }
    if (act === "quiz-again") { quiz = makeQuiz(quiz.cfg); render(); return; }
    if (act === "quiz-exit") { quiz = null; render(); return; }
    if (act === "dlg-toggle") { var k = b.getAttribute("data-k"); dlg[k] = !dlg[k]; render(); return; }
    if (act === "dlg-play") { playAll(); return; }
    if (act === "dlg-stop") { stopSpeaking(); dlg.playing = -1; render(); return; }
    if (act === "dlg-reveal") { dlg.revealed[route().arg + b.getAttribute("data-i")] = true; render(); return; }
    if (act === "dlg-say") {
      var d = currentDialogue(), i = Number(b.getAttribute("data-i"));
      stopSpeaking(); dlg.err = ""; dlg.listening = i; render();
      listen().then(function (alts) {
        var best = alts.map(function (a) { return { heard: a, score: C.speechScore(d.lines[i][1], a) }; }).sort(function (x, y) { return y.score - x.score; })[0];
        dlg.scores[d.id + i] = best; markStudied(); save();
      }).catch(function (err) { dlg.err = listenErrorText(err); })
        .then(function () { dlg.listening = -1; render(); });
      return;
    }
    if (act === "export") {
      var blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "tien-do-hoa-ngu-hoa-chat_" + C.dayKey() + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      return;
    }
    if (act === "reset") {
      if (!confirm("Xoá toàn bộ tiến độ học trên máy này? Không thể hoàn tác (nên Xuất tiến độ trước).")) return;
      var keep = S.settings; S = defaults(); S.settings = keep; save(); session = null; quiz = null; render();
      document.getElementById("data-msg").innerHTML = note("ok", "check", "Đã xoá tiến độ.");
    }
  });
  main.addEventListener("submit", function (e) {
    var f = e.target.closest('[data-form="pinyin"]'); if (!f) return;
    e.preventDefault();
    var inp = document.getElementById("pyin"), val = inp.value;
    if (!val.trim()) { inp.focus(); return; }
    var q = quiz.qs[quiz.i];
    var ok = C.pinyinMatches(val, q.w.p);
    answer(ok, ok ? q.w.id : "x");
    quiz.qs[quiz.i].answered = { input: val, ok: ok };
    render();
  });
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var el = e.target && e.target.closest ? e.target : document.body;
    var tag = (el.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "select" || tag === "textarea";
    var r = route().name;
    if (r === "review" && session && session.i < session.ids.length && !typing) {
      // Space luôn lật thẻ; Enter chỉ lật khi không đứng trên nút/link (để Enter trên nút vẫn bấm nút đó).
      if (!session.revealed && (e.key === " " || (e.key === "Enter" && !el.closest("button, a")))) { e.preventDefault(); session.revealed = true; render(); }
      else if (session.revealed && /^[1-4]$/.test(e.key)) { e.preventDefault(); rate(Number(e.key) - 1); }
    }
    if (r === "quiz" && quiz && quiz.qs[quiz.i]) {
      var q = quiz.qs[quiz.i];
      if (!q.answered && quiz.cfg.type !== "pinyin" && /^[1-4]$/.test(e.key) && !typing) {
        var o = q.opts[Number(e.key) - 1]; if (o) answer(o.id === q.w.id, o.id);
      } else if (q.answered && e.key === "Enter" && !el.closest('[data-act="quiz-next"]')) { e.preventDefault(); quiz.i++; render(); }
    }
  });

  render();
})();

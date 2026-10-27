/*
 * Phần lõi không phụ thuộc giao diện: lịch ôn lặp lại ngắt quãng (SRS), so khớp pinyin, chấm điểm nói.
 * Chạy được cả trong trình duyệt (window.HC_CORE) lẫn Node (require) để kiểm thử.
 */
(function (root) {
  var MIN = 60 * 1000;
  var DAY = 24 * 60 * MIN;
  var MASTERED_DAYS = 7; // khoảng ôn ≥ 7 ngày thì tính là "đã thuộc"

  // Đánh giá: 0 = Quên, 1 = Khó, 2 = Nhớ, 3 = Dễ. Trả về trạng thái mới, không sửa trạng thái cũ.
  function review(card, rating, now) {
    var c = card ? Object.assign({}, card) : { reps: 0, ease: 2.5, interval: 0, lapses: 0 };
    now = now || Date.now();
    if (rating === 0) {
      c.reps = 0;
      c.lapses = (c.lapses || 0) + 1;
      c.ease = Math.max(1.3, c.ease - 0.2);
      c.interval = 0;
      c.due = now + 10 * MIN;
    } else {
      var next;
      if (rating === 1) {
        next = Math.max(1, Math.round((c.interval || 0) * 1.2));
        c.ease = Math.max(1.3, c.ease - 0.15);
      } else {
        if (c.reps === 0) next = rating === 3 ? 3 : 1;
        else if (c.reps === 1) next = rating === 3 ? 6 : 3;
        else next = Math.round(c.interval * c.ease * (rating === 3 ? 1.3 : 1));
        if (rating === 3) c.ease = Math.min(3.0, c.ease + 0.15);
        next = Math.max(next, (c.interval || 0) + 1);
      }
      c.reps += 1;
      c.interval = next;
      c.due = now + next * DAY;
    }
    c.last = now;
    return c;
  }

  function isDue(card, now) {
    return !!card && card.due <= (now || Date.now());
  }

  function isMastered(card) {
    return !!card && card.interval >= MASTERED_DAYS;
  }

  // Bỏ dấu thanh, khoảng trắng, dấu nháy, số thanh điệu → để so pinyin gõ không dấu ("qingyanghuana", "qing1yang3").
  function plainPinyin(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/ü/g, "v")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/u:/g, "v")
      .replace(/[\s'’\-·0-9]/g, "");
  }

  function pinyinMatches(input, answer) {
    var a = plainPinyin(input);
    if (!a) return false;
    var b = plainPinyin(answer);
    return a === b || a.replace(/v/g, "u") === b.replace(/v/g, "u");
  }

  // Chỉ giữ chữ Hán, chữ và số để chấm câu nói.
  function hanziOnly(s) {
    return String(s || "").replace(/[^\u3400-\u9fffA-Za-z0-9]/g, "");
  }

  // Tỉ lệ khớp theo chuỗi con chung dài nhất (LCS) giữa câu mẫu và câu nhận dạng được, 0–100.
  function speechScore(target, heard) {
    var a = Array.from(hanziOnly(target));
    var b = Array.from(hanziOnly(heard));
    if (!a.length || !b.length) return 0;
    var prev = new Array(b.length + 1).fill(0);
    for (var i = 1; i <= a.length; i++) {
      var cur = [0];
      for (var j = 1; j <= b.length; j++) {
        cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
      }
      prev = cur;
    }
    return Math.round((prev[b.length] / Math.max(a.length, b.length)) * 100);
  }

  // Xáo trộn có thể truyền hàm random để kiểm thử.
  function shuffle(arr, rnd) {
    var a = arr.slice();
    rnd = rnd || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Ngày theo giờ máy dạng "2026-10-27" để tính chuỗi ngày học.
  function dayKey(ts) {
    var d = new Date(ts || Date.now());
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  // Chuỗi ngày học liên tiếp tính đến hôm nay (hoặc hôm qua nếu hôm nay chưa học).
  function streak(days, now) {
    var set = {};
    (days || []).forEach(function (d) { set[d] = true; });
    var t = now || Date.now();
    if (!set[dayKey(t)]) t -= DAY;
    var n = 0;
    while (set[dayKey(t)]) { n++; t -= DAY; }
    return n;
  }

  var api = {
    DAY: DAY, MIN: MIN, MASTERED_DAYS: MASTERED_DAYS,
    review: review, isDue: isDue, isMastered: isMastered,
    plainPinyin: plainPinyin, pinyinMatches: pinyinMatches,
    hanziOnly: hanziOnly, speechScore: speechScore,
    shuffle: shuffle, dayKey: dayKey, streak: streak
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HC_CORE = api;
})(this);

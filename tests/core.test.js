// Chạy: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../assets/core.js");
const { TOPICS, WORDS } = require("../data/tuvung.js");
const { DIALOGUES } = require("../data/hoithoai.js");

const NOW = new Date(2026, 9, 27, 9, 0).getTime();

test("dữ liệu từ vựng: đủ trường, mã không trùng, chủ đề hợp lệ", () => {
  const ids = new Set();
  const topicIds = new Set(TOPICS.map((t) => t.id));
  assert.ok(WORDS.length >= 200, "cần ít nhất 200 từ, đang có " + WORDS.length);
  for (const w of WORDS) {
    assert.ok(!ids.has(w.id), "trùng mã " + w.id);
    ids.add(w.id);
    assert.ok(topicIds.has(w.t), w.id + " sai chủ đề");
    assert.match(w.h, /[㐀-鿿]/, w.id + " thiếu chữ Hán");
    assert.match(w.p, /^[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü' \-]+$/, w.id + " pinyin có ký tự lạ: " + w.p);
    assert.ok(w.v.trim().length > 1, w.id + " thiếu nghĩa");
    if (w.ex) for (const k of ["h", "p", "v"]) assert.ok(w.ex[k] && w.ex[k].trim(), w.id + " ví dụ thiếu " + k);
  }
  for (const t of TOPICS) assert.ok(WORDS.some((w) => w.t === t.id), "chủ đề rỗng " + t.id);
});

test("không có chữ Hán trùng giữa các từ", () => {
  const seen = {};
  for (const w of WORDS) {
    assert.ok(!seen[w.h], `"${w.h}" trùng ở ${seen[w.h]} và ${w.id}`);
    seen[w.h] = w.id;
  }
});

test("dữ liệu hội thoại: vai A/B, đủ 4 phần, có chữ Hán", () => {
  const ids = new Set();
  for (const d of DIALOGUES) {
    assert.ok(!ids.has(d.id)); ids.add(d.id);
    assert.ok(d.lines.length >= 5);
    for (const l of d.lines) {
      assert.equal(l.length, 4);
      assert.ok(l[0] === "A" || l[0] === "B");
      assert.match(l[1], /[㐀-鿿]/);
      assert.ok(l[2].trim() && l[3].trim());
    }
  }
});

test("SRS: thẻ mới chọn Nhớ hẹn 1 ngày, Dễ hẹn 3 ngày", () => {
  assert.equal(C.review(null, 2, NOW).interval, 1);
  assert.equal(C.review(null, 3, NOW).interval, 3);
  assert.equal(C.review(null, 2, NOW).due, NOW + C.DAY);
});

test("SRS: Quên đặt lại và hẹn 10 phút, giảm độ dễ nhưng không dưới 1.3", () => {
  let c = C.review(null, 2, NOW);
  c = C.review(c, 2, NOW);
  const f = C.review(c, 0, NOW);
  assert.equal(f.reps, 0);
  assert.equal(f.interval, 0);
  assert.equal(f.due, NOW + 10 * C.MIN);
  assert.equal(f.lapses, 1);
  let low = { reps: 3, ease: 1.35, interval: 10, lapses: 0 };
  assert.equal(C.review(low, 0, NOW).ease, 1.3);
});

test("SRS: khoảng ôn tăng dần và luôn tăng ít nhất 1 ngày khi nhớ", () => {
  let c = null, prev = 0;
  for (let i = 0; i < 6; i++) {
    c = C.review(c, 2, NOW);
    assert.ok(c.interval > prev, `lần ${i}: ${c.interval} phải > ${prev}`);
    prev = c.interval;
  }
  assert.ok(C.isMastered(c));
});

test("SRS: không sửa thẻ gốc", () => {
  const c = { reps: 2, ease: 2.5, interval: 3, lapses: 0, due: NOW };
  const copy = JSON.stringify(c);
  C.review(c, 3, NOW);
  assert.equal(JSON.stringify(c), copy);
});

test("SRS: đến hạn", () => {
  assert.equal(C.isDue({ due: NOW - 1 }, NOW), true);
  assert.equal(C.isDue({ due: NOW + 1 }, NOW), false);
  assert.equal(C.isDue(undefined, NOW), false);
});

test("pinyin: chấp nhận không dấu, số thanh điệu, khoảng trắng, ü→v", () => {
  assert.ok(C.pinyinMatches("qingyanghuana", "qīngyǎnghuànà"));
  assert.ok(C.pinyinMatches("qing1 yang3 hua4 na4", "qīngyǎnghuànà"));
  assert.ok(C.pinyinMatches("Lv hua na", "lǜhuànà"));
  assert.ok(C.pinyinMatches("lu hua na", "lǜhuànà"));
  assert.ok(C.pinyinMatches("lian'anjia", "lí'ànjià") === false);
  assert.ok(C.pinyinMatches("lianjia", "lí'ànjià"));
  assert.ok(!C.pinyinMatches("", "bàojià"));
  assert.ok(!C.pinyinMatches("baojie", "bàojià"));
});

test("chấm nói: khớp hoàn toàn 100, bỏ dấu câu, câu trống 0", () => {
  assert.equal(C.speechScore("您好，我想询价。", "您好我想询价"), 100);
  assert.equal(C.speechScore("您好", ""), 0);
  const partial = C.speechScore("我们下周下单。", "我们下单");
  assert.ok(partial > 40 && partial < 100, String(partial));
});

test("chuỗi ngày học: tính liên tiếp, chưa học hôm nay vẫn giữ chuỗi đến hôm qua", () => {
  const d = (off) => C.dayKey(NOW - off * C.DAY);
  assert.equal(C.streak([d(0), d(1), d(2)], NOW), 3);
  assert.equal(C.streak([d(1), d(2)], NOW), 2);
  assert.equal(C.streak([d(0), d(2)], NOW), 1);
  assert.equal(C.streak([], NOW), 0);
});

test("xáo trộn giữ đủ phần tử", () => {
  const a = [1, 2, 3, 4, 5];
  let s = 0.1;
  const r = C.shuffle(a, () => (s = (s * 7.3) % 1));
  assert.deepEqual([...r].sort(), a);
  assert.deepEqual(a, [1, 2, 3, 4, 5]);
});

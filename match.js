/* 两瓶对撞
   输入：两套答案、同一份词表
   输出：匹配度 + 四个区（重合 / 单向 / 撞线 / 共同雷区）+ 提示

   档位：0 跳过 / 1 雷区 / 2 抵触 / 3 好奇 / 4 喜欢 / 5 满溢
   匹配度的定义：逐项算"你们在这项上有多一致"，再取平均。
   完全相同的两瓶必须给 100，这是这个算法唯一不能违反的性质。 */

(function (global) {

  var WANT = 3;   /* 从这一档开始算"想要" */

  function match(a, b, items) {
    var shared = [], hard = [], soft = [], agreeNo = [], agreeRel = [], onlyA = [], onlyB = [];
    var bothSkip = 0, union = 0, sum = 0;

    for (var i = 0; i < items.length; i++) {
      var x = a[i], y = b[i];

      if (x <= 0 && y <= 0) { bothSkip++; continue; }

      union++;

      /* 一边跳过：未开发区，不奖不罚 */
      if (x <= 0 || y <= 0) {
        var p = Math.max(x, y);
        if (p >= WANT) {
          if (x >= WANT) onlyA.push(i); else onlyB.push(i);
          sum += 0.15;
        } else {
          sum += 0.05;
        }
        continue;
      }

      /* 双方都是负向：相同就是完全一致，全额给分，否则自己跟自己比永远到不了 100 */
      if (x < WANT && y < WANT) {
        if (x === 1 && y === 1) { agreeNo.push(i); sum += 1; }
        else if (x === 2 && y === 2) { agreeRel.push(i); sum += 1; }
        else { sum -= 0.12; }        /* 一个雷区一个抵触，轻微分歧 */
        continue;
      }

      /* 双方都想要 */
      if (x >= WANT && y >= WANT) {
        shared.push({ i: i, lv: Math.min(x, y) });
        sum += 1 - Math.abs(x - y) / 3;   /* 差一档扣三分之一，差两档扣三分之二 */
        continue;
      }

      /* 一负一正：这才是真正要标出来的 */
      var neg = x < WANT ? x : y;
      var pos = x < WANT ? y : x;
      if (neg === 1) {
        hard.push(i);
        sum -= pos >= 4 ? 1 : 0.6;
      } else {
        soft.push(i);
        sum -= pos >= 4 ? 0.45 : 0.2;
      }
    }

    var score = union ? Math.max(0, Math.round(100 * sum / union)) : 0;

    /* 样本太少时不做假精确 */
    if (union && union < items.length * 0.4) score = Math.max(0, Math.round(50 + (score - 50) * 0.7));

    /* 没有任何共同想要，分数不该很高，不管你们多默契 */
    if (!shared.length && union) score = Math.min(score, 55);

    shared.sort(function (q, r) { return r.lv - q.lv; });

    var safe = agreeNo.length + agreeRel.length;

    var text;
    if (!union) {
      text = '两边没有一项表过态，这个没法比。';
    } else if (!shared.length && hard.length) {
      text = '几乎每一项都撞在一起：一边是雷区，一边想要。这份答案已经把结论给你了。';
    } else if (!shared.length && soft.length) {
      text = '没有一项是共同想要的，而且那些「抵触」正好撞在对方的想要上。';
    } else if (!shared.length) {
      text = safe
        ? '没有一项是两个人共同想要的。分数只说明你们在「不要什么」上很一致——那也是共识，只是不能当基础。'
        : '你们想要的东西几乎不重叠。不是冲突，是两条平行线。';
    } else if (hard.length * 4 >= shared.length * 3) {
      text = '撞线区不比重合区小。这份答案最该看的不是分数，是撞线区那几项。';
    } else if (score < 55 && shared.length >= items.length * 0.6) {
      text = '你们要的是同一批东西，但强度差得远：一个人的「喜欢」是另一个人的「满溢」。';
    } else if (score >= 85) {
      text = '这份重合很罕见。你们要谈的不是「要不要」，是「从哪一项开始」。';
    } else if (score >= 65) {
      text = '底座是稳的，有几处要绕开。先看撞线区，再看单向区。';
    } else if (score >= 45) {
      text = '一半在地上，一半在地下。别急着扩，先把重合的那几项做熟。';
    } else if (score >= 25) {
      text = '重叠不多。这不是谁的问题，你们要的东西本来就不同。';
    } else {
      text = '几乎全是反向。这份答案已经把结论给你了。';
    }

    var tips = [];
    if (hard.length) tips.push('有 ' + hard.length + ' 项是硬撞线：一边是雷区，一边想要。这些不用讨论，直接列成禁区。');
    if (soft.length) tips.push(soft.length + ' 项是软冲突：一边只是抵触，一边想要。抵触的那方值得被认真问一句「为什么」。');
    if (onlyA.length + onlyB.length >= 3) tips.push('有 ' + (onlyA.length + onlyB.length) + ' 项只有一边表态。别试探，直接问——试探比问难堪得多。');
    if (shared.length && shared.length < 6) tips.push('重合区只有 ' + shared.length + ' 项，先把它们做熟，别急着扩。');
    else if (shared.length) tips.push('重合区 ' + shared.length + ' 项，从强度最低的那项开始。');
    if (bothSkip >= 5) tips.push('两边都跳过 ' + bothSkip + ' 项，那是未开发区，不是禁区。');
    tips = tips.slice(0, 3);

    return {
      score: score,
      text: text,
      tips: tips,
      shared: shared,
      hard: hard,
      soft: soft,
      agreeNo: agreeNo,
      agreeRel: agreeRel,
      onlyA: onlyA,
      onlyB: onlyB,
      bothSkip: bothSkip,
      both: union,
      union: union,
      coverage: items.length ? union / items.length : 0
    };
  }

  global.XM = { match: match };
})(window);

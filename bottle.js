/* 瓶身引擎 · 13 种瓶型 × 4 档液面
   坐标系：100 宽 × 140 高（瓶身本体），外部留白由 viewBox 负责
   档位：0 未填 / 1 雷区 / 2 好奇 / 3 喜欢 / 4 满溢 */

(function (global) {
  var VB = '-6 -8 112 160';

  var SHAPES = {
    round: {
      d: 'M38,18 h24 v10 C86,28 94,40 94,52 v66 c0,14 -6,22 -18,22 H24 c-12,0 -18,-8 -18,-22 V52 c0,-12 8,-24 24,-24 h8 z',
      cap: { x: 34, y: 9, w: 32, h: 10, r: 3 }
    },
    square: {
      d: 'M34,18 h32 v12 h24 c6,0 8,3 8,8 v88 c0,8 -4,12 -12,12 H14 c-8,0 -12,-4 -12,-12 V38 c0,-5 2,-8 8,-8 h24 z',
      cap: { x: 30, y: 9, w: 40, h: 10, r: 2 }
    },
    flask: {
      d: 'M40,18 h20 v34 c0,8 26,22 26,44 v30 c0,10 -10,14 -36,14 s-36,-4 -36,-14 V96 c0,-22 26,-36 26,-44 z',
      cap: { x: 36, y: 9, w: 28, h: 10, r: 3 }
    },
    tall: {
      d: 'M40,6 h20 v26 c8,4 12,10 12,20 v74 c0,10 -6,14 -16,14 H44 c-10,0 -16,-4 -16,-14 V52 c0,-10 4,-16 12,-20 z',
      cap: { x: 35, y: -2, w: 30, h: 9, r: 3 }
    }
  };

  var FORM = {
    round: { b: 'round' },
    square: { b: 'square' },
    flask: { b: 'flask' },
    tall: { b: 'tall' },
    rope: { b: 'square', x: 'rope' },
    belt: { b: 'square', x: 'belt' },
    collar: { b: 'round', x: 'collar' },
    cage: { b: 'square', x: 'cage' },
    wax: { b: 'flask', x: 'wax' },
    bolt: { b: 'tall', x: 'bolt' },
    feather: { b: 'round', x: 'feather' },
    mask: { b: 'round', x: 'mask' },
    tent: { b: 'flask', x: 'tent' }
  };

  var INK = '#3A3733';
  /* 负向用灰、正向用粉：颜色本身就在说方向 */
  var LIQ = { 2: '#DCD6CA', 3: '#F4C0D1', 4: '#D4537E', 5: '#993556' };
  var RATIO = { 2: 0.2, 3: 0.42, 4: 0.72, 5: 1 };

  var EXTRAS = {
    rope: function (u) {
      return '<g clip-path="url(#cp' + u + ')" stroke="' + INK + '" stroke-width="1.8" opacity="0.38">' +
        '<path d="M4,66 L96,84"/><path d="M4,84 L96,102"/><path d="M4,102 L96,120"/></g>';
    },
    belt: function (u) {
      return '<g clip-path="url(#cp' + u + ')">' +
        '<rect x="0" y="88" width="100" height="13" fill="' + INK + '" opacity="0.76"/>' +
        '<rect x="41" y="86" width="18" height="17" rx="2.5" fill="none" stroke="#FAF7F2" stroke-width="2"/></g>';
    },
    collar: function (u) {
      return '<g clip-path="url(#cp' + u + ')">' +
        '<circle cx="50" cy="58" r="14" fill="none" stroke="' + INK + '" stroke-width="2.6" opacity="0.55"/>' +
        '<circle cx="50" cy="43" r="2.2" fill="' + INK + '" opacity="0.7"/></g>';
    },
    cage: function (u) {
      return '<g clip-path="url(#cp' + u + ')" stroke="' + INK + '" stroke-width="1.6" opacity="0.45">' +
        '<path d="M22,44 V134"/><path d="M36,44 V134"/><path d="M50,44 V134"/>' +
        '<path d="M64,44 V134"/><path d="M78,44 V134"/></g>';
    },
    wax: function (u) {
      return '<g clip-path="url(#cp' + u + ')" fill="#D4537E" opacity="0.5">' +
        '<path d="M30,34 c0,12 5,16 5,24 c0,4 -6,4 -6,0 z"/>' +
        '<path d="M62,32 c0,14 5,18 5,26 c0,4 -6,4 -6,0 z"/>' +
        '<path d="M46,36 c0,10 4,14 4,20 c0,4 -6,4 -6,0 z"/></g>';
    },
    bolt: function (u) {
      return '<g clip-path="url(#cp' + u + ')"><path d="M58,46 L44,78 L59,78 L46,110" fill="none" ' +
        'stroke="#993C1D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/></g>';
    },
    feather: function (u) {
      return '<g clip-path="url(#cp' + u + ')">' +
        '<path d="M54,44 C74,62 66,100 46,124" fill="none" stroke="' + INK + '" stroke-width="2" opacity="0.5"/>' +
        '<g stroke="' + INK + '" stroke-width="1.4" opacity="0.35">' +
        '<path d="M54,56 L66,52"/><path d="M58,70 L71,68"/><path d="M59,84 L71,84"/><path d="M58,98 L69,100"/>' +
        '<path d="M54,56 L44,54"/><path d="M58,70 L46,70"/><path d="M59,84 L47,86"/></g></g>';
    },
    mask: function (u) {
      return '<g clip-path="url(#cp' + u + ')"><rect x="2" y="52" width="96" height="17" rx="3" ' +
        'fill="' + INK + '" opacity="0.8"/></g>';
    },
    tent: function (u) {
      return '<g fill="none" stroke="' + INK + '" stroke-width="2.4" opacity="0.55" stroke-linecap="round">' +
        '<path d="M12,118 c-12,-4 -12,-18 0,-18 c8,0 10,7 5,11"/>' +
        '<path d="M88,118 c12,-4 12,-18 0,-18 c-8,0 -10,7 -5,11"/></g>';
    }
  };

  var seq = 0;

  function body(key, level, uid) {
    var f = FORM[key] || FORM.round;
    var s = SHAPES[f.b];
    var out = '';

    out += '<defs><clipPath id="cp' + uid + '"><path d="' + s.d + '"/></clipPath></defs>';

    var stroke = level === 1 ? '#C9C4B8' : INK;
    var dash = level === 1 ? ' stroke-dasharray="5 5"' : '';

    out += '<path d="' + s.d + '" fill="#FFFFFF" fill-opacity="' + (level === 0 ? 0.25 : 0.6) + '" stroke="' +
      stroke + '" stroke-width="2.4"' + dash + '/>';

    if (level >= 2) {
      var top = 136 - 102 * RATIO[level];
      out += '<g clip-path="url(#cp' + uid + ')">' +
        '<rect x="0" y="' + top + '" width="100" height="' + (142 - top) + '" fill="' + LIQ[level] + '"/>' +
        '<ellipse cx="50" cy="' + top + '" rx="52" ry="4" fill="#FFFFFF" fill-opacity="0.3"/>' +
        '</g>';
    }

    var c = s.cap;
    out += '<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" rx="' + c.r +
      '" fill="' + INK + '" fill-opacity="' + (level === 1 ? 0.3 : 0.82) + '"/>';

    if (f.x && EXTRAS[f.x]) out += EXTRAS[f.x](uid);

    if (level === 1) {
      out += '<path d="M34,58 L66,98 M66,58 L34,98" stroke="#A32D2D" stroke-width="3" ' +
        'stroke-linecap="round" opacity="0.45"/>';
    }

    return out;
  }

  function mark(key, level) {
    var uid = 'b' + (++seq);
    return '<g>' + body(key, level, uid) + '</g>';
  }

  function tag(key, level, size) {
    var uid = 'b' + (++seq);
    return '<svg viewBox="' + VB + '" width="' + (size || 100) + '" style="display:block;overflow:visible">' +
      body(key, level, uid) + '</svg>';
  }

  global.Bottle = {
    VB: VB,
    SHAPES: SHAPES,
    FORM: FORM,
    KEYS: Object.keys(FORM),
    LEVELS: [
      { v: 1, n: '雷区' },
      { v: 2, n: '抵触' },
      { v: 3, n: '好奇' },
      { v: 4, n: '喜欢' },
      { v: 5, n: '满溢' }
    ],
    ink: INK,
    liquid: LIQ,
    mark: mark,
    tag: tag
  };
})(window);

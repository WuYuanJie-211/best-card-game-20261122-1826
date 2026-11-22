// FLIP-style move helper, deal stagger, combo flare and win burst for Cinderwick.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  // Float a "+5 LADDER" style tag up from an element, then remove it.
  function floatTag(target, text, cls) {
    if (!target || !document.getElementById('float-layer')) return;
    var layer = document.getElementById('float-layer');
    var r = target.getBoundingClientRect();
    var stage = document.getElementById('stage').getBoundingClientRect();
    var tag = document.createElement('div');
    tag.className = 'float-tag ' + (cls || '');
    tag.textContent = text;
    tag.style.left = (r.left - stage.left + r.width / 2) + 'px';
    tag.style.top = (r.top - stage.top) + 'px';
    layer.appendChild(tag);
    setTimeout(function () { tag.remove(); }, 900);
  }

  // Deal stagger: mark each hand card to fly in from the deck origin.
  function dealIn(handEl) {
    if (!handEl) return;
    var cards = handEl.querySelectorAll('.card');
    cards.forEach(function (card, i) {
      card.classList.add('deal-in');
      card.style.animationDelay = (i * 60) + 'ms';
    });
    setTimeout(function () {
      cards.forEach(function (card) { card.classList.remove('deal-in'); card.style.animationDelay = ''; });
    }, 900);
  }

  // Combo flare: ring both cards in a lane. The bonus is named in the lane's
  // score-column chip, never floated over the cards.
  function comboFlare(lane, combo, who) {
    var box = document.getElementById('lane-' + lane);
    if (!box) return;
    var row = box.querySelector(who === 'you' ? '.lane-you-cards' : '.lane-ai-cards');
    if (!row) return;
    var cards = row.querySelectorAll('.card');
    cards.forEach(function (c) { c.classList.add('flare'); });
    setTimeout(function () {
      cards.forEach(function (c) { c.classList.remove('flare'); });
    }, 1600);
  }

  // Wick drain: shake the loser's panel while pips extinguish.
  function wickDrain(who) {
    var panel = document.getElementById(who === 'you' ? 'wick-you-panel' : 'wick-ai-panel');
    if (!panel) return;
    panel.classList.add('shake');
    setTimeout(function () { panel.classList.remove('shake'); }, 500);
  }

  // Win flourish: 18 card backs parked in the outer 140px band, around the
  // edges, keeping an 80px clear radius around the headline block so no card
  // ever crosses the title.
  function winBurst() {
    var layer = document.getElementById('burst-layer');
    if (!layer) return;
    layer.innerHTML = '';
    // Top corners only (never above the centred headline), both side edges,
    // and a full bottom row. All inside the outer 140px band.
    var spots = [
      { x: 66, y: 66 }, { x: 156, y: 66 }, { x: 1124, y: 66 }, { x: 1214, y: 66 },
      { x: 66, y: 300 }, { x: 66, y: 420 }, { x: 66, y: 540 },
      { x: 1214, y: 300 }, { x: 1214, y: 420 }, { x: 1214, y: 540 },
      { x: 86, y: 654 }, { x: 266, y: 654 }, { x: 446, y: 654 }, { x: 626, y: 654 },
      { x: 806, y: 654 }, { x: 986, y: 654 }, { x: 1106, y: 654 }, { x: 1194, y: 654 }
    ];
    spots.forEach(function (p, i) {
      var back = document.createElement('div');
      back.className = 'burst-card static';
      back.style.left = p.x + 'px';
      back.style.top = p.y + 'px';
      back.style.animationDelay = (i * 60) + 'ms';
      layer.appendChild(back);
    });
  }

  // Snap a placed card: brief impact nudge on its lane frame.
  function snapLane(lane) {
    var box = document.getElementById('lane-' + lane);
    if (!box) return;
    box.classList.add('snap');
    setTimeout(function () { box.classList.remove('snap'); }, 200);
  }

  CW.flyCard = floatTag;
  CW.dealIn = dealIn;
  CW.comboFlare = comboFlare;
  CW.wickDrain = wickDrain;
  CW.winBurst = winBurst;
  CW.snapLane = snapLane;
})();

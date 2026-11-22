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

  // Combo flare: ring both cards in a lane and float the bonus tag.
  function comboFlare(lane, combo, who) {
    var box = document.getElementById('lane-' + lane);
    if (!box) return;
    var row = box.querySelector(who === 'you' ? '.lane-you-cards' : '.lane-ai-cards');
    if (!row) return;
    var cards = row.querySelectorAll('.card');
    cards.forEach(function (c) { c.classList.add('flare'); });
    var name = CW.COMBOS[combo].name.toUpperCase();
    floatTag(row, '+' + CW.COMBOS[combo].bonus + ' ' + name, 'combo-' + combo);
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

  // Win flourish: 18 card backs burst radially from the stage centre.
  function winBurst() {
    var layer = document.getElementById('burst-layer');
    if (!layer) return;
    layer.innerHTML = '';
    for (var i = 0; i < 18; i++) {
      var back = document.createElement('div');
      back.className = 'burst-card';
      var angle = (i / 18) * Math.PI * 2;
      var dist = 260 + (i % 3) * 60;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      back.style.setProperty('--dx', dx.toFixed(0) + 'px');
      back.style.setProperty('--dy', dy.toFixed(0) + 'px');
      back.style.animationDelay = (i * 25) + 'ms';
      layer.appendChild(back);
    }
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

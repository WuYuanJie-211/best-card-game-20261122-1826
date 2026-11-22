// Pure state-to-DOM rendering of hands, lanes and the HUD for Cinderwick.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  function el(id) { return document.getElementById(id); }

  function cardHtml(card, opts) {
    opts = opts || {};
    var suit = CW.CARD_SUITS[card.suit];
    var cls = 'card suit-' + card.suit + (opts.selected ? ' selected' : '') + (opts.flare ? ' flare' : '');
    var value = card.wild ? '✶' : String(card.value);
    var svg = CW.suitSvg(card.suit, 22);
    var big = CW.suitSvg(card.suit, 46);
    return '<div class="' + cls + '" data-id="' + card.id + '" data-suit="' + card.suit + '"' +
      ' title="' + CW.cardLabel(card) + '">' +
      '<span class="card-value">' + value + '</span>' +
      '<span class="card-suit-top">' + svg + '</span>' +
      '<span class="card-suit-big">' + big + '</span>' +
      '<span class="card-name">' + suit.name + '</span>' +
      '<span class="card-suit-bottom">' + svg + '</span>' +
      '<span class="card-value-mirror">' + value + '</span>' +
      (opts.ribbon ? '<span class="combo-ribbon ' + opts.ribbon.kind + '">' + opts.ribbon.text + '</span>' : '') +
      '</div>';
  }

  function backHtml() {
    return '<div class="card back"><span class="back-dot"></span></div>';
  }

  function pipRow(n, max, cls) {
    var out = '';
    for (var i = 0; i < max; i++) out += '<span class="pip ' + cls + (i < n ? ' on' : ' off') + '"></span>';
    return out;
  }

  function renderHud(state) {
    el('wick-you-pips').innerHTML = pipRow(state.wick.you, CW.MAX_WICK, 'wick');
    el('wick-ai-pips').innerHTML = pipRow(state.wick.ai, CW.MAX_WICK, 'wick');
    el('wick-you-num').textContent = state.wick.you;
    el('wick-ai-num').textContent = state.wick.ai;
    el('heat-you-num').textContent = state.heat.you;
    el('heat-ai-num').textContent = state.heat.ai;
    el('round-label').textContent = 'Round ' + Math.min(state.round, CW.MAX_ROUNDS) + ' / ' + CW.MAX_ROUNDS;
    el('temper-line').textContent = state.temperLine || '';
    el('wick-ai-panel').classList.toggle('thinking', state.turn === 'ai' && state.phase === 'table');
  }

  function renderHands(state) {
    var you = '';
    for (var i = 0; i < state.hands.you.length; i++) {
      var c = state.hands.you[i];
      you += cardHtml(c, { selected: state.selected === c.id });
    }
    el('player-hand').innerHTML = you;
    var ai = '';
    for (var j = 0; j < state.hands.ai.length; j++) ai += backHtml();
    el('ai-hand').innerHTML = ai;
    el('ai-hand-count').textContent = state.hands.ai.length + ' cards';
  }

  function renderLanes(state) {
    for (var i = 0; i < CW.LANES.length; i++) {
      var lane = CW.LANES[i];
      var box = el('lane-' + lane);
      var youCards = state.lanes[lane].you;
      var aiCards = state.lanes[lane].ai;
      var y = CW.scoreLane(youCards);
      var a = CW.scoreLane(aiCards);
      box.classList.toggle('kindled', state.kindled === lane);
      box.querySelector('.lane-ai-cards').innerHTML = aiCards.map(function (c) {
        return cardHtml(c, { flare: state.flare && state.flare.lane === lane && state.flare.who === 'ai' });
      }).join('');
      box.querySelector('.lane-you-cards').innerHTML = youCards.map(function (c) {
        return cardHtml(c, { flare: state.flare && state.flare.lane === lane && state.flare.who === 'you' });
      }).join('');
      box.querySelector('.lane-total-ai').textContent = aiCards.length ? String(a.total) : '–';
      box.querySelector('.lane-total-you').textContent = youCards.length ? String(y.total) : '–';
      var rib = box.querySelector('.lane-combo');
      var combo = y.combo || a.combo;
      var comboOwner = y.combo ? 'you' : (a.combo ? 'ai' : null);
      if (combo) {
        var name = CW.COMBOS[combo].name.toUpperCase();
        rib.textContent = name + ' +' + CW.COMBOS[combo].bonus + (comboOwner === 'you' ? ' · YOU' : ' · KEEPER');
        rib.className = 'lane-combo show ' + combo;
      } else {
        rib.textContent = '';
        rib.className = 'lane-combo';
      }
      box.querySelector('.lane-kindled-badge').style.visibility = state.kindled === lane ? 'visible' : 'hidden';
    }
  }

  function renderButtons(state) {
    var burn = el('btn-burn');
    var surge = el('btn-surge');
    burn.disabled = !(state.phase === 'table' && state.turn === 'you' && CW.canBurn(state, 'you') && state.selected);
    burn.textContent = state.selected ? 'Burn selected (bank Heat)' : 'Burn: select a card first';
    surge.disabled = !(state.phase === 'table' && state.turn === 'you' && CW.canSurge(state, 'you'));
    surge.textContent = 'Surge +' + (state.surgeUsed.you ? 'used' : '1 placement') + ' (4 Heat)';
    el('btn-resolve').style.display =
      (state.phase === 'table' && CW.placementsLeft(state, 'you') === 0 && CW.placementsLeft(state, 'ai') === 0) ? '' : 'none';
  }

  function renderLog(state) {
    if (state.log) el('log-line').textContent = state.log;
  }

  // Render the whole table from state in one pass.
  function renderHand(state) {
    renderHud(state);
    renderHands(state);
    renderLanes(state);
    renderButtons(state);
    renderLog(state);
  }

  CW.cardHtml = cardHtml;
  CW.backHtml = backHtml;
  CW.renderHand = renderHand;
  CW.renderHud = renderHud;
  CW.renderHands = renderHands;
  CW.renderLanes = renderLanes;
})();

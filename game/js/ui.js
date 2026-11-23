// UI: pure state-to-DOM rendering of the HUD, hands, buttons and log.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  function el(id) { return document.getElementById(id); }

  function cardHtml(card, opts) {
    opts = opts || {};
    var suit = CW.CARD_SUITS[card.suit];
    var cls = 'card suit-' + card.suit + (opts.selected ? ' selected' : '') + (opts.flare ? ' flare' : '');
    var value = card.wild ? '0' : String(card.value);
    var svg = CW.suitSvg(card.suit, 18);
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
    // One flame pip per Heat held, and no empty slots: Heat has no cap,
    // so a fixed track would wrongly imply one.
    var pips = '';
    for (var p = 0; p < state.heat.you; p++) pips += '<span class="heat-pip on">▲</span>';
    el('heat-pips-you').innerHTML = pips;
    var surgeReady = CW.canSurge(state, 'you');
    el('surge-chip-you').style.display = surgeReady ? '' : 'none';
    var deckCount = (state.deckCount != null) ? state.deckCount : state.deck.length;
    el('deck-count').textContent = deckCount;
    el('round-label').textContent = 'Round ' + Math.min(state.round, CW.MAX_ROUNDS) + ' / ' + CW.MAX_ROUNDS;
    // Temper line, one sentence, lane name in amber.
    var temper = state.temperLine || '';
    var laneName = CW.LANE_NAMES[state.temper] || '';
    el('temper-line').innerHTML = laneName && temper.indexOf(laneName) >= 0
      ? temper.replace(laneName, '<span class="temper-lane-name">' + laneName + '</span>')
      : temper;
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

  function renderButtons(state) {
    var burn = el('btn-burn');
    var surge = el('btn-surge');
    burn.disabled = !(state.phase === 'table' && state.turn === 'you' && CW.canBurn(state, 'you') && state.selected);
    // The button is just "Burn"; its state reads as guidance on the line above
    // the buttons, never as an instruction trapped inside a greyed control.
    burn.textContent = 'Burn';
    var hint = el('action-hint');
    if (state.phase === 'table' && state.turn === 'you') {
      if (!CW.canBurn(state, 'you')) hint.textContent = 'Burn already used this round.';
      else if (state.selected) hint.textContent = 'Burn discards the selected card and banks Heat equal to its value.';
      else hint.textContent = 'Select a card first to Burn it.';
    } else {
      hint.textContent = '';
    }
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
    CW.renderLanes(state);
    renderButtons(state);
    renderLog(state);
  }

  CW.cardHtml = cardHtml;
  CW.backHtml = backHtml;
  CW.renderHand = renderHand;
  CW.renderHud = renderHud;
  CW.renderHands = renderHands;
})();

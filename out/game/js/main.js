// State machine, click wiring, round and match flow for Cinderwick.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  // Fit the fixed 1280x720 stage to any viewport by CSS zoom.
  function fitStage() {
    var stage = document.getElementById('stage');
    if (!stage) return;
    var scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.zoom = String(scale);
  }

  function drawHands(state, n) {
    for (var i = 0; i < n; i++) {
      // The 36-card deck cannot refill 5 each for 8 rounds: when it runs
      // out, reshuffle the played cards (discard pile) into a fresh deck.
      if (!state.deck.length && state.discard.length) {
        state.deck = CW.shuffleDeck(state.discard);
        state.discard = [];
      }
      if (state.deck.length && state.hands.you.length < CW.HAND_SIZE) state.hands.you.push(state.deck.pop());
      if (state.deck.length && state.hands.ai.length < CW.HAND_SIZE) state.hands.ai.push(state.deck.pop());
    }
  }

  // Start a fresh match: shuffle once, draw 5 each, both at 15 Wick.
  function startMatch() {
    var s = CW.freshState();
    s.deck = CW.shuffleDeck(CW.buildDeck());
    s.phase = 'table';
    drawHands(s, CW.HAND_SIZE);
    CW.state = s;
    CW.setScreen('table');
    startRound();
  }

  function startRound() {
    var s = CW.state;
    drawHands(s, CW.HAND_SIZE);
    s.placed = { you: 0, ai: 0 };
    s.burnUsed = { you: false, ai: false };
    s.surgeUsed = { you: false, ai: false };
    s.selected = null;
    s.flare = null;
    s.kindled = CW.LANES[Math.floor(Math.random() * 3)];
    s.temper = CW.temperLane(s);
    s.temperLine = CW.temperLine(s.temper);
    s.leader = s.round === 1 ? 'you' : (s.lastRoundLoser || 'you');
    s.turn = s.leader;
    s.log = 'Round ' + s.round + ' — ' + CW.LANE_NAMES[s.kindled] + ' is Kindled (double damage). ' + s.temperLine;
    CW.renderHand(s);
    CW.dealIn(document.getElementById('player-hand'));
    if (s.turn === 'ai') setTimeout(aiStep, 700);
  }

  function placeCard(state, who, cardId, lane) {
    var hand = state.hands[who];
    for (var i = 0; i < hand.length; i++) {
      if (hand[i].id === cardId) {
        var card = hand.splice(i, 1)[0];
        state.lanes[lane][who].push(card);
        state.placed[who]++;
        return card;
      }
    }
    return null;
  }

  function maybeResolve() {
    var s = CW.state;
    if (CW.placementsLeft(s, 'you') === 0 && CW.placementsLeft(s, 'ai') === 0) {
      setTimeout(resolveRound, 900);
      return true;
    }
    return false;
  }

  function playerPlace(lane) {
    var s = CW.state;
    if (s.phase !== 'table' || s.turn !== 'you') return;
    if (!s.selected || CW.placementsLeft(s, 'you') <= 0) return;
    var card = placeCard(s, 'you', s.selected, lane);
    if (!card) return;
    s.selected = null;
    s.log = 'You played ' + CW.cardLabel(card) + ' in ' + CW.LANE_NAMES[lane] + '.';
    CW.snapLane(lane);
    CW.renderHand(s);
    s.turn = 'ai';
    CW.renderHand(s);
    if (!maybeResolve()) setTimeout(aiStep, 650);
  }

  function aiStep() {
    var s = CW.state;
    if (!s || s.phase !== 'table' || s.turn !== 'ai') return;
    if (CW.placementsLeft(s, 'ai') <= 0) { maybeResolve(); return; }
    var move = CW.takeTurn(s);
    if (!move.card) { s.turn = 'you'; CW.renderHand(s); maybeResolve(); return; }
    var card = placeCard(s, 'ai', move.card.id, move.lane);
    if (!card) return;
    s.log = (move.burned ? 'The Wickkeeper burns ' + CW.cardLabel(move.burned) + ' for Heat, then ' : 'The Wickkeeper ') +
      'plays ' + CW.cardLabel(card) + ' in ' + CW.LANE_NAMES[move.lane] + '.';
    CW.snapLane(move.lane);
    CW.renderHand(s);
    s.turn = 'you';
    CW.renderHand(s);
    maybeResolve();
  }

  function resolveRound() {
    var s = CW.state;
    if (!s || s.phase !== 'table') return;
    var result = CW.scoreRound(s.lanes, s.kindled);
    for (var i = 0; i < result.lanes.length; i++) {
      var r = result.lanes[i];
      if (r.you.combo) CW.comboFlare(r.lane, r.you.combo, 'you');
      if (r.ai.combo) CW.comboFlare(r.lane, r.ai.combo, 'ai');
      var best = r.you.combo || r.ai.combo;
      if (best) {
        var name = CW.COMBOS[best].name;
        if (!s.bestCombo || CW.COMBOS[best].bonus >= 5) s.bestCombo = name + ' +' + CW.COMBOS[best].bonus;
      }
    }
    s.wick.you -= result.damage.you;
    s.wick.ai -= result.damage.ai;
    if (result.damage.you > 0) CW.wickDrain('you');
    if (result.damage.ai > 0) CW.wickDrain('ai');
    s.log = 'Round ' + s.round + ' scored — you dealt ' + result.damage.ai + ' Wick, took ' + result.damage.you + '.';
    s.lastRoundLoser = result.damage.you >= result.damage.ai ? 'you' : 'ai';
    CW.LANES.forEach(function (l) {
      s.discard.push.apply(s.discard, s.lanes[l].you);
      s.discard.push.apply(s.discard, s.lanes[l].ai);
      s.lanes[l] = { you: [], ai: [] };
    });
    CW.renderHand(s);
    setTimeout(function () {
      var winner = CW.matchWinner(s);
      if (winner === 'you') { s.aiWinningCard = null; CW.showWin(s); }
      else if (winner === 'ai') {
        var top = s.hands.ai.slice().sort(function (a, b) { return b.value - a.value; })[0];
        s.aiWinningCard = top || CW.makeCard('gloam', 8, 'end');
        CW.showLoss(s);
      } else if (winner === 'sudden-death') {
        s.log = 'Equal Wick after round 8 — sudden death in the Kiln!';
        s.round = CW.MAX_ROUNDS + 1;
        startRound();
      } else if (winner === 'draw') { CW.showWin(s); }
      else { s.round++; startRound(); }
    }, 1600);
  }

  function burnSelected() {
    var s = CW.state;
    if (!s || s.phase !== 'table' || s.turn !== 'you' || !s.selected) return;
    var card = CW.burnCard(s, 'you', s.selected);
    if (!card) return;
    s.selected = null;
    s.log = 'You burned ' + CW.cardLabel(card) + ' — Heat +' + card.value + ' (now ' + s.heat.you + ').';
    CW.renderHand(s);
  }

  function surge() {
    var s = CW.state;
    if (!s || !CW.canSurge(s, 'you')) return;
    s.heat.you -= CW.SURGE_COST;
    s.surgeUsed.you = true;
    s.log = 'Surge! One extra placement this round (Heat ' + s.heat.you + ').';
    CW.renderHand(s);
  }

  function wireClicks() {
    document.getElementById('btn-deal').addEventListener('click', startMatch);
    document.getElementById('btn-deal-again').addEventListener('click', startMatch);
    document.getElementById('btn-try-again').addEventListener('click', startMatch);
    document.getElementById('btn-burn').addEventListener('click', burnSelected);
    document.getElementById('btn-surge').addEventListener('click', surge);
    document.getElementById('btn-howto').addEventListener('click', function () {
      document.getElementById('howto').classList.toggle('hidden');
    });
    document.getElementById('howto-close').addEventListener('click', function () {
      document.getElementById('howto').classList.add('hidden');
    });
    document.getElementById('player-hand').addEventListener('click', function (e) {
      var card = e.target.closest('.card');
      var s = CW.state;
      if (!card || !s || s.phase !== 'table' || s.turn !== 'you') return;
      s.selected = s.selected === card.dataset.id ? null : card.dataset.id;
      CW.renderHand(s);
    });
    CW.LANES.forEach(function (lane) {
      document.getElementById('lane-' + lane).addEventListener('click', function () { playerPlace(lane); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.getElementById('howto').classList.add('hidden');
    });
  }

  function boot() {
    fitStage();
    window.addEventListener('resize', fitStage);
    CW.state = CW.freshState();
    wireClicks();
    var shot = new URLSearchParams(window.location.search).get('shot');
    if (!CW.applyShot(shot)) CW.showTitle();
  }

  CW.fitStage = fitStage;
  CW.startMatch = startMatch;
  CW.startRound = startRound;
  CW.placeCard = placeCard;
  CW.playerPlace = playerPlace;
  CW.aiStep = aiStep;
  CW.resolveRound = resolveRound;
  CW.burnSelected = burnSelected;
  CW.surge = surge;
  CW.boot = boot;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})();

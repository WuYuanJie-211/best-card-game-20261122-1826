// Title, table, win and loss routing, plus ?shot= seeded states for screenshots.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  var SCREENS = ['title', 'table', 'win', 'loss'];

  function showTitle() {
    setScreen('title');
  }

  function setScreen(name) {
    SCREENS.forEach(function (s) {
      var el = document.getElementById('screen-' + s);
      if (el) el.classList.toggle('active', s === name);
    });
    if (CW.state) CW.state.phase = name === 'table' ? 'table' : name;
  }

  function showWin(state) {
    document.getElementById('win-wick').textContent = 'Wick ' + state.wick.you + ' – ' + state.wick.ai;
    document.getElementById('win-rounds').textContent = 'Rounds played: ' + Math.min(state.round, CW.MAX_ROUNDS);
    document.getElementById('win-best').textContent = 'Best combo: ' + (state.bestCombo || 'Bond +4');
    setScreen('win');
    CW.winBurst();
  }

  function showLoss(state) {
    document.getElementById('loss-wick').textContent = 'Wick ' + state.wick.you + ' – ' + state.wick.ai;
    document.getElementById('loss-rounds').textContent = 'Rounds played: ' + Math.min(state.round, CW.MAX_ROUNDS);
    var card = state.aiWinningCard || CW.makeCard('gloam', 8, 'seed-win');
    document.getElementById('loss-card').innerHTML = CW.cardHtml(card, {
      ribbon: { kind: 'twin', text: 'TWIN +6' }
    });
    setScreen('loss');
  }

  function freshState() {
    var lanes = {};
    CW.LANES.forEach(function (l) { lanes[l] = { you: [], ai: [] }; });
    return {
      phase: 'title', round: 1, kindled: 'kiln', temper: 'kiln', temperLine: '',
      leader: 'you', turn: 'you',
      deck: [], discard: [], hands: { you: [], ai: [] },
      lanes: lanes, wick: { you: CW.MAX_WICK, ai: CW.MAX_WICK },
      heat: { you: 0, ai: 0 }, placed: { you: 0, ai: 0 },
      burnUsed: { you: false, ai: false }, surgeUsed: { you: false, ai: false },
      selected: null, flare: null, log: '', bestCombo: null, aiWinningCard: null
    };
  }

  // Seeded mid-game states so each screenshot is one URL flag away.
  function seedTableState() {
    var s = freshState();
    s.phase = 'table';
    s.round = 3;
    s.kindled = 'kiln';
    s.temper = 'kiln';
    s.temperLine = CW.temperLine('kiln');
    s.wick = { you: 9, ai: 11 };
    s.heat = { you: 4, ai: 2 };
    s.lanes.kiln.you = [CW.makeCard('flame', 6, 's-k1'), CW.makeCard('flame', 7, 's-k2')];
    s.lanes.kiln.ai = [CW.makeCard('frost', 5, 's-k3')];
    s.lanes.hollow.you = [CW.makeCard('bramble', 4, 's-h1')];
    s.lanes.hollow.ai = [CW.makeCard('gloam', 8, 's-h2')];
    s.lanes.tide.ai = [CW.makeCard('frost', 3, 's-t1')];
    s.hands.you = [
      CW.makeCard('flame', 8, 's-y1'), CW.makeCard('bramble', 2, 's-y2'),
      CW.makeCard('ember', 0, 's-y3'), CW.makeCard('gloam', 5, 's-y4'),
      CW.makeCard('frost', 7, 's-y5')
    ];
    s.hands.ai = [
      CW.makeCard('flame', 3, 's-a1'), CW.makeCard('frost', 6, 's-a2'),
      CW.makeCard('bramble', 7, 's-a3'), CW.makeCard('gloam', 2, 's-a4'),
      CW.makeCard('ember', 0, 's-a5')
    ];
    s.flare = { lane: 'kiln', who: 'you' };
    s.bestCombo = 'Ladder +5';
    s.log = 'Ladder flares in the Kiln — +5. The Wickkeeper coils in the Kiln.';
    return s;
  }

  function seedWinState() {
    var s = seedTableState();
    s.round = 5;
    s.wick = { you: 6, ai: 0 };
    s.bestCombo = 'Twin +6';
    return s;
  }

  function seedLossState() {
    var s = seedTableState();
    s.round = 6;
    s.wick = { you: 0, ai: 7 };
    s.aiWinningCard = CW.makeCard('gloam', 8, 's-loss');
    s.bestCombo = 'Twin +6';
    return s;
  }

  // Apply a ?shot= flag: jump straight to a screen with a seeded state.
  function applyShot(shot) {
    if (!shot) return false;
    if (shot === 'title') { CW.state = freshState(); setScreen('title'); return true; }
    if (shot === 'table') {
      CW.state = seedTableState();
      setScreen('table');
      CW.renderHand(CW.state);
      CW.comboFlare('kiln', 'ladder', 'you');
      return true;
    }
    if (shot === 'win') { CW.state = seedWinState(); showWin(CW.state); return true; }
    if (shot === 'loss') { CW.state = seedLossState(); showLoss(CW.state); return true; }
    return false;
  }

  CW.showTitle = showTitle;
  CW.setScreen = setScreen;
  CW.showWin = showWin;
  CW.showLoss = showLoss;
  CW.freshState = freshState;
  CW.seedTableState = seedTableState;
  CW.seedWinState = seedWinState;
  CW.seedLossState = seedLossState;
  CW.applyShot = applyShot;
})();

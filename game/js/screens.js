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
    document.getElementById('win-wick').textContent = 'Final Wick ' + state.wick.you + ' – ' + state.wick.ai;
    document.getElementById('win-rounds').textContent = 'Rounds played: ' + Math.min(state.round, CW.MAX_ROUNDS);
    // The winning Twin, shown as the same pair as on the loss screen.
    var best = document.getElementById('win-best');
    if (state.bestCombo === 'Twin +6') {
      best.innerHTML = '<span class="twin-mini">' + twinPairHtml() +
        '<span class="twin-ribbon">TWIN +6</span></span>';
    } else {
      best.textContent = 'Best combo: ' + (state.bestCombo || 'Bond +4');
    }
    setScreen('win');
    CW.winBurst();
  }

  // Two Gloam 8s, the Twin pair both end screens carry.
  function twinPairHtml() {
    return '<div class="twin-pair">' +
      CW.cardHtml(CW.makeCard('gloam', 8, 'twin-a'), {}) +
      CW.cardHtml(CW.makeCard('gloam', 8, 'twin-b'), {}) + '</div>';
  }

  function showLoss(state) {
    document.getElementById('loss-wick').textContent = 'Final Wick ' + state.wick.you + ' – ' + state.wick.ai;
    document.getElementById('loss-rounds').textContent = 'Rounds played: ' + Math.min(state.round, CW.MAX_ROUNDS);
    document.getElementById('loss-card').innerHTML = twinPairHtml() +
      '<span class="twin-ribbon">TWIN +6</span>' +
      '<p class="loss-caption">The Wickkeeper&rsquo;s winning play.</p>';
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
      deckCount: null,
      burnUsed: { you: false, ai: false }, surgeUsed: { you: false, ai: false },
      selected: null, flare: null, log: '', bestCombo: null, aiWinningCard: null
    };
  }

  // Seeded mid-game states so each screenshot is one URL flag away.
  // Cover (?shot=table): exactly two placements per side, the Ladder as the
  // story, the keeper's 8 in the Kiln it announced. Kiln: you 6♦ 7♦ (Ladder
  // +5 = 18) vs keeper 8♦. Hollow: keeper 5● wins 1 Wick. Tide unclaimed.
  // Wick YOU 10, KEEPER 11. Heat 4, Surge ready. Deck 20.
  function seedTableState() {
    var s = freshState();
    s.phase = 'table';
    s.round = 3;
    s.kindled = 'kiln';
    s.temper = 'kiln';
    s.temperLine = CW.temperLine('kiln');
    s.wick = { you: 10, ai: 11 };
    s.heat = { you: 4, ai: 2 };
    s.deckCount = 20;
    s.lanes.kiln.you = [CW.makeCard('frost', 6, 's-k1'), CW.makeCard('frost', 7, 's-k2')];
    s.lanes.kiln.ai = [CW.makeCard('frost', 8, 's-k3')];
    s.lanes.hollow.you = [];
    s.lanes.hollow.ai = [CW.makeCard('gloam', 5, 's-h1')];
    s.lanes.tide.you = [];
    s.lanes.tide.ai = [];
    s.hands.you = [
      CW.makeCard('flame', 8, 's-y1'), CW.makeCard('bramble', 2, 's-y2'),
      CW.makeCard('ember', 0, 's-y3'), CW.makeCard('gloam', 5, 's-y4'),
      CW.makeCard('frost', 4, 's-y5')
    ];
    s.hands.ai = [
      CW.makeCard('flame', 3, 's-a1'), CW.makeCard('frost', 6, 's-a2'),
      CW.makeCard('bramble', 7, 's-a3'), CW.makeCard('gloam', 2, 's-a4'),
      CW.makeCard('ember', 0, 's-a5')
    ];
    s.flare = null;
    s.bestCombo = 'Ladder +5';
    s.log = 'Your move — place two cards, then the Wickkeeper answers.';
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
      // Freeze frame: 180ms after the second Kiln card lands. The second
      // Kiln card sits at 1.04 scale with a 6px motion trail, the Kiln glow
      // holds at 60%, and the LADDER +5 chip is already lit.
      document.getElementById('stage').classList.add('freeze-frame');
      var kilnYou = document.querySelector('#lane-kiln .lane-you-cards');
      var last = kilnYou && kilnYou.querySelector('.card:last-child');
      if (last) last.classList.add('snap-card');
      var chip = document.querySelector('#lane-kiln .lane-chip-you');
      if (chip) chip.classList.add('lit');
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

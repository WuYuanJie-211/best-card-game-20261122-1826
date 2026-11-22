// Score: legal moves, combo detection, lane scoring, damage and match end.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  var LANES = ['kiln', 'hollow', 'tide'];
  var LANE_NAMES = { kiln: 'The Kiln', hollow: 'The Hollow', tide: 'The Tide' };
  var COMBOS = {
    bond:   { name: 'Bond',   bonus: 4 },
    ladder: { name: 'Ladder', bonus: 5 },
    twin:   { name: 'Twin',   bonus: 6 }
  };
  var MAX_WICK = 15;
  var HAND_SIZE = 5;
  var MAX_ROUNDS = 8;
  var SURGE_COST = 4;

  // Highest applicable combo only, never stacked. A lone card never combos.
  // An Ember Wild copies the suit of the other card (enables a Bond) but adds
  // 0 and can never form a Ladder or Twin.
  function comboOf(cards) {
    if (!cards || cards.length !== 2) return null;
    var a = cards[0], b = cards[1];
    if (a.wild && b.wild) return null;
    var wild = a.wild ? a : (b.wild ? b : null);
    var other = wild === a ? b : a;
    if (!wild) {
      if (a.value === b.value) return 'twin';
      if (Math.abs(a.value - b.value) === 1) return 'ladder';
      if (a.suit === b.suit) return 'bond';
      return null;
    }
    // Wild + other: only a Bond is possible (wild copies the other's suit).
    return 'bond';
  }

  // Lane total: sum of values plus one combo bonus.
  function scoreLane(cards) {
    var sum = 0;
    for (var i = 0; i < cards.length; i++) sum += cards[i].value;
    var combo = comboOf(cards);
    var bonus = combo ? COMBOS[combo].bonus : 0;
    return { sum: sum, combo: combo, bonus: bonus, total: sum + bonus };
  }

  // Score all three lanes. Returns per-lane winners and Wick damage.
  // A lane won deals 1, +1 if it held your combo, +1 if it is Kindled.
  function scoreRound(lanes, kindled) {
    var results = [];
    var damage = { you: 0, ai: 0 };
    for (var i = 0; i < LANES.length; i++) {
      var lane = LANES[i];
      var yours = scoreLane(lanes[lane].you);
      var theirs = scoreLane(lanes[lane].ai);
      var winner = null;
      var dmg = 0;
      if (yours.total > theirs.total) {
        winner = 'you';
        dmg = 1 + (yours.combo ? 1 : 0) + (lane === kindled ? 1 : 0);
        damage.ai += dmg;
      } else if (theirs.total > yours.total) {
        winner = 'ai';
        dmg = 1 + (theirs.combo ? 1 : 0) + (lane === kindled ? 1 : 0);
        damage.you += dmg;
      }
      results.push({ lane: lane, you: yours, ai: theirs, winner: winner, damage: dmg, kindled: lane === kindled });
    }
    return { lanes: results, damage: damage };
  }

  function legalLanes(state, who) {
    // Any lane accepts a card; placements are capped per round, not per lane.
    return LANES.slice();
  }

  function placementsLeft(state, who) {
    var base = 2;
    var extra = state.surgeUsed[who] ? 1 : 0;
    return base + extra - state.placed[who];
  }

  function canBurn(state, who) {
    return !state.burnUsed[who] && state.hands[who].length > 0;
  }

  function canSurge(state, who) {
    return state.heat[who] >= SURGE_COST && !state.surgeUsed[who] && placementsLeft(state, who) > 0;
  }

  // Burn: discard a card from hand, bank Heat equal to its value (free action).
  function burnCard(state, who, cardId) {
    var hand = state.hands[who];
    for (var i = 0; i < hand.length; i++) {
      if (hand[i].id === cardId) {
        var card = hand.splice(i, 1)[0];
        state.heat[who] += card.value;
        state.burnUsed[who] = true;
        return card;
      }
    }
    return null;
  }

  function matchWinner(state) {
    if (state.wick.you <= 0 && state.wick.ai <= 0) {
      return state.wick.you === state.wick.ai ? 'draw' : (state.wick.you > state.wick.ai ? 'you' : 'ai');
    }
    if (state.wick.you <= 0) return 'ai';
    if (state.wick.ai <= 0) return 'you';
    if (state.round > MAX_ROUNDS) {
      if (state.wick.you === state.wick.ai) return 'sudden-death';
      return state.wick.you > state.wick.ai ? 'you' : 'ai';
    }
    return null;
  }

  CW.LANES = LANES;
  CW.LANE_NAMES = LANE_NAMES;
  CW.COMBOS = COMBOS;
  CW.MAX_WICK = MAX_WICK;
  CW.HAND_SIZE = HAND_SIZE;
  CW.MAX_ROUNDS = MAX_ROUNDS;
  CW.SURGE_COST = SURGE_COST;
  CW.comboOf = comboOf;
  CW.scoreLane = scoreLane;
  CW.scoreRound = scoreRound;
  CW.legalLanes = legalLanes;
  CW.placementsLeft = placementsLeft;
  CW.canBurn = canBurn;
  CW.canSurge = canSurge;
  CW.burnCard = burnCard;
  CW.matchWinner = matchWinner;
})();

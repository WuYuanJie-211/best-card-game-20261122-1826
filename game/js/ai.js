// The Wickkeeper: a readable AI that announces its strongest lane and keeps its word.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  var WICKKEEPER = {
    name: 'The Wickkeeper',
    // Temper lines, one per lane, shown at round start.
    temperLines: {
      kiln: 'The Wickkeeper is coiling in the Kiln.',
      hollow: 'The Wickkeeper is coiling in the Hollow.',
      tide: 'The Wickkeeper is coiling in the Tide.'
    }
  };

  function sortedHand(hand) {
    return hand.slice().sort(function (a, b) { return b.value - a.value; });
  }

  // Best two-card total the AI could field from its hand (combo-aware).
  function bestPairTotal(hand) {
    var best = 0;
    for (var i = 0; i < hand.length; i++) {
      for (var j = i + 1; j < hand.length; j++) {
        var t = CW.scoreLane([hand[i], hand[j]]).total;
        if (t > best) best = t;
      }
    }
    return best;
  }

  // Strongest lane: the Kindled lane when the AI holds a strong pair,
  // otherwise the lane the player has committed least to (Kiln on a tie).
  // Announced in the temper line before any placement.
  function temperLane(state) {
    if (bestPairTotal(state.hands.ai) >= 15) return state.kindled;
    var bestLane = 'kiln';
    var bestCount = Infinity;
    for (var i = 0; i < CW.LANES.length; i++) {
      var lane = CW.LANES[i];
      var n = state.lanes[lane].you.length;
      if (n < bestCount) { bestCount = n; bestLane = lane; }
    }
    return bestLane;
  }

  function temperLine(lane) {
    return WICKKEEPER.temperLines[lane];
  }

  // First placement always goes to the announced lane, with its highest card.
  function chooseFirstPlacement(state) {
    var hand = sortedHand(state.hands.ai);
    return { card: hand[0], lane: state.temper };
  }

  // Second placement: complete a combo in the announced lane if possible,
  // else contest the lane the player leads by the smallest margin,
  // else take the Kindled lane if it is free.
  function chooseSecondPlacement(state) {
    var hand = state.hands.ai;
    var temperCards = state.lanes[state.temper].ai;
    if (temperCards.length === 1) {
      var best = null, bestTotal = -1;
      for (var i = 0; i < hand.length; i++) {
        var t = CW.scoreLane([temperCards[0], hand[i]]).total;
        if (t > bestTotal) { bestTotal = t; best = hand[i]; }
      }
      if (best && CW.comboOf([temperCards[0], best])) {
        return { card: best, lane: state.temper };
      }
    }
    // Contest the lane the player leads by the smallest margin.
    var contest = null, contestMargin = Infinity;
    for (var l = 0; l < CW.LANES.length; l++) {
      var lane = CW.LANES[l];
      var y = CW.scoreLane(state.lanes[lane].you).total;
      var a = CW.scoreLane(state.lanes[lane].ai).total;
      var margin = y - a;
      if (margin > 0 && margin < contestMargin) { contestMargin = margin; contest = lane; }
    }
    if (contest) {
      return { card: sortedHand(hand)[0], lane: contest };
    }
    if (state.lanes[state.kindled].ai.length === 0) {
      return { card: sortedHand(hand)[0], lane: state.kindled };
    }
    return { card: sortedHand(hand)[0], lane: state.temper };
  }

  // Burn when the two lowest cards total under 6 and Heat is below 4.
  function shouldBurn(state) {
    if (state.heat.ai >= 4 || state.burnUsed.ai) return null;
    var low = state.hands.ai.slice().sort(function (a, b) { return a.value - b.value; });
    if (low.length >= 2 && low[0].value + low[1].value < 6) return low[0];
    return null;
  }

  // One AI turn: maybe burn, then place. Returns the move it made.
  function takeTurn(state) {
    var burn = shouldBurn(state);
    if (burn) CW.burnCard(state, 'ai', burn.id);
    var move = state.placed.ai === 0 ? chooseFirstPlacement(state) : chooseSecondPlacement(state);
    return { card: move.card, lane: move.lane, burned: burn || null };
  }

  CW.WICKKEEPER = WICKKEEPER;
  CW.bestPairTotal = bestPairTotal;
  CW.temperLane = temperLane;
  CW.temperLine = temperLine;
  CW.chooseFirstPlacement = chooseFirstPlacement;
  CW.chooseSecondPlacement = chooseSecondPlacement;
  CW.shouldBurn = shouldBurn;
  CW.takeTurn = takeTurn;
})();

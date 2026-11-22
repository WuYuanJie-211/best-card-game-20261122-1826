// Lane rendering for Cinderwick: totals, maths lines, combo chips and the
// Wick chip that says what winning each lane is worth right now.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  function el(id) { return document.getElementById(id); }

  // Sum-then-result, combo named in the chip, never in the sum:
  // "6 + 7 + 5 = 18" for a Ladder, "8" for a lone card, "—" for an empty row.
  function mathsText(cards) {
    if (!cards.length) return '—';
    var s = CW.scoreLane(cards);
    if (cards.length === 1) return String(s.sum);
    var parts = cards.map(function (c) { return String(c.value); });
    if (s.combo) parts.push(String(s.bonus));
    return parts.join(' + ') + ' = ' + s.total;
  }

  // A lane win deals 1 Wick, +1 if the winner held a combo, +1 if the lane
  // is Kindled — the same rule as scoreRound's damage.
  function wickChipText(state, lane, you, ai) {
    if (you.total === ai.total) return 'UNCLAIMED';
    var winner = you.total > ai.total ? you : ai;
    return 'WINS ' + (1 + (winner.combo ? 1 : 0) + (state.kindled === lane ? 1 : 0)) + ' WICK';
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
        return CW.cardHtml(c, { flare: state.flare && state.flare.lane === lane && state.flare.who === 'ai' });
      }).join('');
      box.querySelector('.lane-you-cards').innerHTML = youCards.map(function (c) {
        return CW.cardHtml(c, { flare: state.flare && state.flare.lane === lane && state.flare.who === 'you' });
      }).join('');
      box.querySelector('.lane-total-ai').textContent = aiCards.length ? String(a.total) : '–';
      box.querySelector('.lane-total-you').textContent = youCards.length ? String(y.total) : '–';
      box.querySelector('.lane-maths-ai').textContent = mathsText(aiCards);
      box.querySelector('.lane-maths-you').textContent = mathsText(youCards);
      var chipAi = box.querySelector('.lane-chip-ai');
      var chipYou = box.querySelector('.lane-chip-you');
      if (a.combo) {
        chipAi.textContent = CW.COMBOS[a.combo].name.toUpperCase() + ' +' + CW.COMBOS[a.combo].bonus;
        chipAi.className = 'lane-chip lane-chip-ai show ' + a.combo;
      } else {
        chipAi.textContent = '';
        chipAi.className = 'lane-chip lane-chip-ai';
      }
      if (y.combo) {
        chipYou.textContent = CW.COMBOS[y.combo].name.toUpperCase() + ' +' + CW.COMBOS[y.combo].bonus;
        chipYou.className = 'lane-chip lane-chip-you show ' + y.combo;
      } else {
        chipYou.textContent = '';
        chipYou.className = 'lane-chip lane-chip-you';
      }
      var wick = box.querySelector('.lane-combo');
      wick.textContent = wickChipText(state, lane, y, a);
      wick.className = 'lane-combo show';
      box.querySelector('.lane-kindled-badge').style.visibility = state.kindled === lane ? 'visible' : 'hidden';
    }
  }

  CW.mathsText = mathsText;
  CW.renderLanes = renderLanes;
})();

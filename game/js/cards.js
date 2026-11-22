// Deck construction, shuffle, card model and suit metadata for Cinderwick.
(function () {
  var root = (typeof window !== 'undefined') ? window : globalThis;
  var CW = root.CW = root.CW || {};

  // Suit metadata: colour AND shape carry the suit, never text alone.
  var CARD_SUITS = {
    flame:   { name: 'Flame',   color: '#e2603a', shape: 'triangle', glyph: '▲' },
    frost:   { name: 'Frost',   color: '#4fa8d8', shape: 'diamond',  glyph: '◆' },
    bramble: { name: 'Bramble', color: '#6fa844', shape: 'knot',     glyph: '❋' },
    gloam:   { name: 'Gloam',   color: '#8f6bd6', shape: 'circle',   glyph: '●' },
    ember:   { name: 'Ember Wild', color: '#e8d9a8', shape: 'star',  glyph: '✶' }
  };

  // Inline SVG for a suit shape, drawn from paths (no text, no network).
  function suitSvg(suit, size) {
    var s = CARD_SUITS[suit];
    var c = s.color;
    var n = size || 24;
    var inner = '';
    if (suit === 'flame') inner = '<polygon points="12,2 22,20 2,20" fill="' + c + '"/>';
    else if (suit === 'frost') inner = '<polygon points="12,1 23,12 12,23 1,12" fill="' + c + '"/>';
    else if (suit === 'bramble') inner = '<g fill="' + c + '"><ellipse cx="12" cy="5" rx="4" ry="5"/><ellipse cx="12" cy="19" rx="4" ry="5"/><ellipse cx="5" cy="12" rx="5" ry="4"/><ellipse cx="19" cy="12" rx="5" ry="4"/><circle cx="12" cy="12" r="3.4"/></g>';
    else if (suit === 'gloam') inner = '<circle cx="12" cy="12" r="10" fill="' + c + '"/>';
    else inner = '<polygon points="12,1 14.6,8.2 22,8.6 16.4,13.4 18.4,20.8 12,16.8 5.6,20.8 7.6,13.4 2,8.6 9.4,8.2" fill="' + c + '"/>';
    return '<svg class="suit-svg" width="' + n + '" height="' + n + '" viewBox="0 0 24 24" aria-hidden="true">' + inner + '</svg>';
  }

  function makeCard(suit, value, id) {
    return { id: id, suit: suit, value: value, wild: suit === 'ember' };
  }

  // 36 cards, one shared deck: four suits at values 1-8 plus four Ember Wilds.
  function buildDeck() {
    var deck = [];
    var id = 0;
    var suits = ['flame', 'frost', 'bramble', 'gloam'];
    for (var s = 0; s < suits.length; s++) {
      for (var v = 1; v <= 8; v++) deck.push(makeCard(suits[s], v, 'c' + (id++)));
    }
    for (var w = 0; w < 4; w++) deck.push(makeCard('ember', 0, 'c' + (id++)));
    return deck;
  }

  function shuffleDeck(deck, rand) {
    var r = rand || Math.random;
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    return deck;
  }

  function cardLabel(card) {
    if (card.wild) return 'Ember Wild';
    return CARD_SUITS[card.suit].name + ' ' + card.value;
  }

  CW.CARD_SUITS = CARD_SUITS;
  CW.suitSvg = suitSvg;
  CW.makeCard = makeCard;
  CW.buildDeck = buildDeck;
  CW.shuffleDeck = shuffleDeck;
  CW.cardLabel = cardLabel;
})();

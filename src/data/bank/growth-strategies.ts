// gcsebusiness question bank — Growth Strategies (Topic 2.1)
// Author: gcsebusiness content team. Real cases (Etsy/Depop, The Restaurant Group
// and Wagamama, Gymshark, BMW/MINI, Ben & Jerry's, Aston Martin) are verifiable.

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'growth-strategies',
  title: 'Growth Strategies',
  blurb:
    'Organic versus inorganic growth — Etsy’s Depop takeover, Wagamama, Gymshark’s garage start — economies of scale, PLCs, globalisation with BMW’s MINI exports, and ethics with Ben & Jerry’s.',
  theme: 2,
  topics: ['2.1'],
  questions: [
    {
      id: 'gs1',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which type of growth did Etsy’s purchase of Depop represent?',
      extract: {
        title: 'Etsy buys Depop',
        text: 'In 2021 Etsy — the online marketplace for handmade and vintage goods — bought Depop, the fashion resale app popular with Generation Z, in a deal reported at around $1.6 billion. Depop kept its app and its brand, but ownership passed to Etsy.',
      },
      options: [
        'Organic (internal) growth from within',
        'A merger of two equal partners',
        'External growth by buying a business',
        'Growth by franchising the brand',
      ],
      correct: 2,
      explain:
        'Buying another business is external growth: Etsy acquired Depop rather than building its own resale app from scratch. A merger would have combined the two as equals, and no franchise was involved.',
    },
    {
      id: 'gs2',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which reason best explains why The Restaurant Group bought Wagamama rather than opening similar restaurants of its own?',
      extract: {
        title: 'The Restaurant Group buys Wagamama',
        text: 'In 2018 The Restaurant Group — which already owned chains such as Frankie & Benny’s — bought Wagamama, the fast-growing Asian noodle restaurant chain, for around £560 million. Wagamama was famous for the queues outside its restaurants.',
      },
      options: [
        'It gained a proven, growing brand with restaurants, staff and customers at once',
        'Takeovers are always cheaper than organic growth in every single case',
        'All of Wagamama’s restaurants had to be closed down for legal reasons',
        'The group wanted to reduce the total number of brands it owned',
      ],
      correct: 0,
      explain:
        'A takeover delivers instant growth: a proven brand, sites, trained staff and customers all come on day one. Building a rival chain restaurant-by-restaurant would take years with no guarantee of matching Wagamama’s popularity — though takeovers bring their own risks, such as overpaying.',
    },
    {
      id: 'gs3',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which type of growth is Gymshark’s story?',
      extract: {
        title: 'Gymshark — grown from within',
        text: 'Gymshark was started in 2012 by Ben Francis, then a teenager, who screen-printed gym clothing in his parents’ garage in Birmingham and sold it online. The brand grew through social media and by launching new product ranges of its own design. In 2020 an investor bought a 21% stake, valuing the business at over £1 billion — yet Gymshark never bought another business in order to grow.',
      },
      options: [
        'Organic (internal) growth',
        'External growth by merger',
        'External growth by takeover',
        'Growth by franchising its brand',
      ],
      correct: 0,
      explain:
        'Gymshark grew organically: more sales of its own products and new ranges of its own design, built through its own website and social media. Selling a stake to an investor raised finance — but the growth itself came from within.',
    },
    {
      id: 'gs4',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'The diagram shows how a business’s average cost per unit changes as its output grows. Which statement describes the pattern shown?',
      diagram: 'economies',
      options: [
        'Average cost per unit falls continuously, however big the business becomes',
        'Average cost per unit stays constant at every level of output',
        'Average cost per unit falls, flattens, then rises as the business gets too big',
        'Average cost per unit rises at first and then falls later on',
      ],
      correct: 2,
      explain:
        'The curve falls as the cost advantages of large-scale production take hold — bulk buying, bigger machines, cheaper borrowing — then flattens at its minimum point, where cost per unit is lowest. Beyond that, diseconomies of scale (typically poor communication and weak coordination) push average costs back up.',
    },
    {
      id: 'gs5',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which benefit of trading worldwide does the MINI plant most clearly show?',
      extract: {
        title: 'MINI — made in Oxford, sold worldwide',
        text: 'BMW, the German carmaker, builds the MINI at its plant in Oxford and exports it to customers in more than 100 countries. Cars roll off the line and are shipped to markets from Japan to the United States.',
      },
      options: [
        'Trading worldwide guarantees high profits for every single exporter',
        'Export markets reach far more customers than the home country alone',
        'Trading worldwide removes all competition from foreign rivals',
        'Selling abroad removes the need to build high-quality cars',
      ],
      correct: 1,
      explain:
        'The UK car market alone is far too small to absorb everything Oxford produces, so selling to over 100 markets multiplies the customer base. Selling across borders creates these export opportunities — though it also means competing with the whole world, not just local rivals.',
    },
    {
      id: 'gs6',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.4',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, why can the higher cost of Fairtrade ingredients still make business sense for Ben & Jerry’s?',
      extract: {
        title: 'Ben & Jerry’s — values in the tub',
        text: 'Ben & Jerry’s, the ice cream brand owned by Unilever, uses Fairtrade-certified ingredients wherever it can and campaigns openly on environmental and social issues. Fairtrade ingredients usually cost more than uncertified alternatives.',
      },
      options: [
        'Fairtrade ingredients are always the cheapest ingredients available',
        'Ethical sourcing guarantees that the ice cream tastes better',
        'The law requires every ice cream brand to use Fairtrade ingredients',
        'Its customers value ethical sourcing, so the brand can charge premium prices',
      ],
      correct: 3,
      explain:
        'For a values-led premium brand, ethics is part of what customers are buying: Fairtrade sourcing reinforces the brand and keeps loyal customers paying premium prices. Ethical behaviour can also make recruitment easier — but it is a choice, not a legal requirement, and it usually does raise costs.',
    },
    {
      id: 'gs7',
      type: 'term',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 3,
      marks: 1,
      stem: 'In large PLCs, the people who own the company are different from the directors and managers who run it day to day. What is the term for this separation?',
      accept: [
        'divorce of ownership and control',
        'separation of ownership and control',
        'divorce of ownership & control',
      ],
      explain:
        'The divorce of ownership and control describes how the owners are separated from control (the directors and managers). Managers may pursue their own goals — growth, perks, status — rather than maximising returns for the owners, who can still vote directors out at the AGM.',
    },
    {
      id: 'gs8',
      type: 'term',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'A car factory installs a robotic paint line that can paint thousands of cars a day far more cheaply per car than smaller equipment could. What TYPE of economy of scale is this?',
      accept: [
        'technical economy of scale',
        'technical economy',
        'technical economies of scale',
        'technical economies',
        'economies of scale',
      ],
      explain:
        'Technical economies of scale come from using larger, more efficient machines and production methods that smaller businesses cannot afford. The huge cost of the line is spread over so many cars that the cost per car falls — one reason mass producers undercut small rivals.',
    },
    {
      id: 'gs9',
      type: 'term',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for a person who owns part of a company by holding shares in it?',
      accept: ['shareholder', 'a shareholder', 'shareholders', 'the shareholders'],
      explain:
        'A shareholder owns a slice of a company in proportion to the shares they hold. They may receive dividends if profits are paid out, and in a PLC they can usually sell their shares on the stock exchange — which also means the company could one day be taken over.',
    },
    {
      id: 'gs10',
      type: 'fib',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Growth by merger or takeover — buying or combining with another business — is called ________ growth, also known as external growth. What one word completes the term?',
      accept: ['inorganic', 'Inorganic', 'in-organic', 'in organic'],
      explain:
        'Inorganic (external) growth means expanding by merger or takeover rather than from within. It is much faster than organic growth, but riskier and usually needing a great deal of finance.',
    },
    {
      id: 'gs11',
      type: 'fib',
      topic: '2.1',
      subtopic: '2.1.3',
      difficulty: 1,
      marks: 1,
      stem: 'The internet, cheaper transport and trade blocs have all encouraged ________ — the increasing integration of the world’s economies, as businesses trade and operate across borders. What one word completes the sentence?',
      accept: ['globalisation', 'Globalisation', 'globalization'],
      explain:
        'Globalisation is the growing integration of the world’s economies. For a UK business it means bigger export markets and cheaper suppliers abroad — but also competition from rivals anywhere on the planet.',
    },
    {
      id: 'gs12',
      type: 'numeric',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the percentage FALL in the average cost of making one pie as output rises from 5,000 to 40,000 a week. Give your answer to the nearest whole number.',
      extract: {
        title: 'Marrow & Mash — the pie factory',
        text: 'Marrow & Mash makes premium pies. When it produces 5,000 pies a week, the average cost of making ONE pie is £5.20. At 40,000 pies a week the average cost per pie falls to £3.90, because ingredients bought in bulk cost less and the factory’s fixed costs are spread over far more pies.',
      },
      value: 25,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'The fall is £5.20 − £3.90 = £1.30. As a percentage of the original cost: (£1.30 ÷ £5.20) × 100 = 25%. Each pie costs a quarter less to make at the higher output — the cost advantages of producing at scale in action.',
    },
    {
      id: 'gs13',
      type: 'numeric',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the percentage increase in the number of Painted Teapot cafés over the five years. Give your answer to the nearest whole number.',
      extract: {
        title: 'The Painted Teapot — pottery cafés',
        text: 'The Painted Teapot opened its first paint-your-own-pottery café in 2018. Instead of buying other businesses, it has opened its own new cafés one at a time, funded from its profits. Five years later it runs 15 cafés, up from 3 in its first year.',
      },
      value: 400,
      tol: 1,
      unit: '%',
      dp: 0,
      explain:
        'Percentage change = ((new − original) ÷ original) × 100 = ((15 − 3) ÷ 3) × 100 = 400%. That is organic growth — twelve extra cafés opened by the business itself rather than bought from anyone else.',
    },
    {
      id: 'gs14',
      type: 'numeric',
      topic: '2.1',
      subtopic: '2.1.3',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate exports as a percentage of Blakeney Biscuits’ TOTAL sales. Give your answer to the nearest whole number.',
      extract: {
        title: 'Blakeney Biscuits — selling abroad',
        text: 'Blakeney Biscuits is a Norfolk biscuit maker. Last year its UK sales were £480,000 and its export sales — to shops in France, Germany and the Netherlands — were £320,000. The owners are deciding whether to push harder into export markets.',
      },
      value: 40,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'Total sales = £480,000 + £320,000 = £800,000. Exports as a percentage of total = (£320,000 ÷ £800,000) × 100 = 40%. Two-fifths of the business already depends on overseas customers — a big opportunity, but also exposure to exchange-rate swings.',
    },
    {
      id: 'gs15',
      type: 'truefalse',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Aston Martin Lagonda floated on the London Stock Exchange in 2018. Since then, its shares could only legally be bought by professional investment banks.',
      answer: false,
      explain:
        'False. Once a company floats, anyone — professional or ordinary member of the public — can buy its shares through the stock exchange. That is how flotation raises capital from a wide pool of investors, but it also opens the door to a takeover by anyone who buys enough shares.',
    },
    {
      id: 'gs16',
      type: 'truefalse',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 1,
      marks: 1,
      stem: 'When two rival supermarket chains merge, competition in the market is reduced.',
      answer: true,
      explain:
        'True. A horizontal merger removes a competitor at a stroke, leaving customers with fewer choices — which is why large mergers can attract the attention of competition regulators. Reducing competition and gaining market share is a classic motive for merging.',
    },
  ],
};
export default def;

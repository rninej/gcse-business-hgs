// gcsebusiness question bank — PRACTICE pool, Topic 2.1 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-2-1',
  title: 'Growing the Business',
  blurb: 'Fifteen mixed questions on internal growth, buying other firms, share issues, the cost advantages of size and trading worldwide — with Sainsbury’s, Argos, Aldi and Kraft.',
  theme: 2,
  topics: ['2.1'],
  audience: 'practice',
  questions: [
    {
      id: 'p21a',
      type: 'mcq',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which type of growth does Aldi’s expansion show?',
      extract: {
        title: 'Aldi keeps opening',
        text: 'Aldi opened its first British store in 1990 and by 2023 had opened its 1,000th UK store, in Wellingborough — every one built and opened by Aldi itself, rather than bought from another chain.',
      },
      options: [
        'Opening new stores itself, one after another',
        'Combining with a rival to become one business',
        'Buying up smaller rival chains',
        'Selling shares to the public for the first time',
      ],
      correct: 0,
      explain:
        'Growing by opening its own stores — rather than buying or combining with other firms — is internal growth. It is slower than a purchase, but it keeps control and grows at a pace the business can afford.',
    },
    {
      id: 'p21b',
      type: 'mcq',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which type of growth does the Sainsbury’s–Argos deal show?',
      extract: {
        title: 'Sainsbury’s buys Argos',
        text: 'In 2016 Sainsbury’s bought Argos for £1.4 billion, gaining hundreds of Argos concessions inside its supermarkets. Shoppers can now collect Argos goods with the weekly food shop.',
      },
      options: [
        'Opening hundreds of new supermarkets itself',
        'Buying another established business outright',
        'Franchising the Sainsbury’s name abroad',
        'Lending money to a smaller rival',
      ],
      correct: 1,
      explain:
        'Sainsbury’s expanded by buying an existing business with its customers and stores already in place — far faster than building a non-food operation from scratch. The concessions inside supermarkets show why the two fitted together.',
    },
    {
      id: 'p21c',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a drawback of becoming a public limited company?',
      options: [
        'The company can no longer sell shares to anyone',
        'Directors lose the right to make any decisions at all',
        'Another firm can buy enough shares to seize control',
        'Every shareholder must work in the business',
      ],
      correct: 2,
      explain:
        'Once shares trade on a stock exchange, anyone can buy them — including a rival who buys enough to take control. Publishing accounts and pressure for short-term profit are the other classic drawbacks.',
    },
    {
      id: 'p21d',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Why does the average cost of making one jumper fall as a factory’s output rises?',
      options: [
        'The factory pays its workers less for every hour they work',
        'Rent and machines are shared over more units; bulk buying is cheaper',
        'Wool stops costing anything at all once orders pass a thousand units',
        'Every single cost becomes fixed, so making extra jumpers is free',
      ],
      correct: 1,
      explain:
        'These savings come from size: the factory’s rent and machines are fixed, so more units share them, and big orders earn supplier discounts. Variable costs never vanish — but each jumper’s slice of them and of the fixed costs shrinks.',
    },
    {
      id: 'p21e',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, what does the Purplebricks story best illustrate?',
      extract: {
        title: 'Purplebricks — from £1.89 to £1',
        text: 'Purplebricks, the online estate agent, was sold to its rival Strike for just £1 in May 2023 after its share price collapsed. The shares had peaked at £1.89 in May 2022; the day after the sale they were worth about £0.76.',
      },
      options: [
        'Estate agents are banned from advertising online',
        'House prices rise every single year without fail',
        'Share prices never fall after a company is sold',
        'Rapid growth is no guarantee of lasting success',
      ],
      correct: 3,
      explain:
        'Purplebricks grew fast, floated, then collapsed — its shares fell from a £1.89 peak to being sold for £1. Growth brings risk as well as reward, and stock-market investors can walk away quickly.',
    },
    {
      id: 'p21f',
      type: 'mcq',
      topic: '2.1',
      difficulty: 3,
      marks: 1,
      stem: 'Kraft’s bid for Cadbury was resisted by Cadbury’s board until a higher offer won the day. Which word best describes a bid the target’s board has tried to refuse?',
      options: [
        'Friendly',
        'Hostile',
        'Vertical',
        'Deferred',
      ],
      correct: 1,
      explain:
        'A bid made against the wishes of the target’s board is hostile. Kraft ultimately prevailed by raising its offer to around £11.5 billion until the board could no longer recommend refusal.',
    },
    {
      id: 'p21g',
      type: 'term',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for an arrangement in which two separate businesses agree to combine into a single business?',
      accept: ['merger', 'a merger', 'mergers'],
      explain:
        'A merger combines two businesses by agreement — unlike a buyout, where one buys the other whether the target likes it or not. Both are ways of growing without building anything new.',
    },
    {
      id: 'p21h',
      type: 'term',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the falling average cost per unit that comes from producing on a larger scale — bulk discounts, bigger machines, cheaper borrowing?',
      accept: ['economies of scale', 'economy of scale'],
      explain:
        'Economies of scale are the cost advantages of size: buying in bulk, running bigger machines, borrowing more cheaply. They are why average cost per unit falls as output rises — until a business grows too big to manage.',
    },
    {
      id: 'p21i',
      type: 'term',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for integration in which two businesses at the SAME stage of production combine — such as two rival supermarkets?',
      accept: ['horizontal integration', 'horizontal'],
      explain:
        'Horizontal integration joins two businesses at the same stage of production, cutting the number of rivals. Buying a supplier instead is backward vertical integration; buying a distributor is forward vertical.',
    },
    {
      id: 'p21j',
      type: 'fib',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'When one business buys another — sometimes against the wishes of the target’s board, as when Kraft bought Cadbury — the deal is called a ________. What one word completes the sentence?',
      accept: ['takeover', 'takeovers', 'take-over'],
      explain:
        'A takeover is the purchase of one business by another. Kraft’s £11.5 billion bid for Cadbury began hostile — the board resisted — until the higher offer won the day.',
    },
    {
      id: 'p21k',
      type: 'fib',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Growth that comes from within the business itself — new branches, new products, more sales — rather than from buying other firms, is called ________ growth. What one word completes the sentence?',
      accept: ['organic', 'organic growth'],
      explain:
        'Organic growth is expansion under a business’s own steam: more branches, new products, rising sales. It is slower than buying another firm but carries less risk and keeps control with the existing owners.',
    },
    {
      id: 'p21l',
      type: 'numeric',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, calculate the percentage change in Kettle & Crow’s revenue between the two years. Give your answer as a percentage to the nearest whole number.',
      extract: {
        title: 'Kettle & Crow',
        text: 'Kettle & Crow is a small Sheffield business that designs and prints greeting cards. Last year its revenue was £480,000. This year, after winning listings in two national retail chains, revenue rose to £600,000.',
      },
      value: 25,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'Percentage change = ((new − original) ÷ original) × 100 = ((£600,000 − £480,000) ÷ £480,000) × 100 = 25%. Revenue grew by a quarter in a single year — growth that will need financing.',
    },
    {
      id: 'p21m',
      type: 'truefalse',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Morrisons bought the convenience chain McColl’s out of administration in 2022 for £190 million.',
      answer: true,
      explain:
        'True. Morrisons paid £190m for McColl’s in 2022, rescuing it from administration — growth by buying an existing chain rather than building new stores.',
    },
    {
      id: 'p21n',
      type: 'truefalse',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Money raised by selling new shares must be repaid to the investors within five years.',
      answer: false,
      explain:
        'False. Money raised by selling shares is permanent: there is no repayment date and no interest, because the buyers become part-owners. The cost is dilution — the original owners’ control shrinks.',
    },
    {
      id: 'p21o',
      type: 'written',
      topic: '2.1',
      difficulty: 3,
      marks: 3,
      stem: 'A family-owned bakery chain with 12 shops wants to double in size within three years. Justify whether it should open its own new shops or buy a smaller rival chain.',
      explain:
        'Opening its own shops keeps full control: the family chooses every location, fits each shop its way and grows at a pace it can fund — but it is slow, and two dozen sites must be found, fitted and staffed. Buying a rival brings instant shops, staff and customers, but at a price set by the sellers, and merging two working cultures is risky. With 12 shops and limited funds, the best route is probably staged: a few owned openings plus one targeted purchase where the rival’s sites fill gaps in the map.',
      points: [
        { text: 'Opening its own shops: full control of locations and pace, no culture clash — but slow, and each site must be found, fitted and staffed.', marks: 1 },
        { text: 'Buying a rival: instant shops, staff and customers — but a big bill, integration risk and a price set by the sellers.', marks: 1 },
        { text: 'Judgement: a staged mix suits a 12-shop family firm best — owned openings plus one targeted purchase that fills gaps in its coverage.', marks: 1 },
      ],
    },
  ],
};
export default def;

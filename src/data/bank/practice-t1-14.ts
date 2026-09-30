// gcsebusiness question bank — PRACTICE pool, Topic 1.4 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-1-4',
  title: 'Start-ups, Location & the 4Ps',
  blurb: 'Self-study practice on ownership, franchising, location, the 4Ps and business plans, with John Lewis, McDonald’s, IKEA and Nike.',
  theme: 1,
  topics: ['1.4'],
  audience: 'practice',
  questions: [
    {
      id: 'p14a',
      type: 'mcq',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, what form of business ownership is John Lewis an example of?',
      extract: {
        title: 'John Lewis Partnership',
        text: 'John Lewis is one of Britain’s best-known department-store chains. It has no single owner and no outside shareholders: instead, its permanent staff — known as ‘Partners’ — jointly own the business, share an annual bonus and help shape how it is run.',
      },
      options: [
        'A partnership — owned jointly by its employee Partners, who share the profits',
        'A sole trader — owned by one person who keeps all the profit',
        'A public limited company — shares bought and sold on the stock exchange',
        'A franchise of an overseas brand',
      ],
      correct: 0,
      explain:
        'John Lewis is owned collectively by its staff — the Partners — who share the profits through an annual bonus. Shared ownership by more than one person is the defining feature of a partnership, unlike a sole trader (one owner) or a company owned by outside shareholders.',
    },
    {
      id: 'p14b',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a DRAWBACK of turning a sole trader business into a private limited company (Ltd)?',
      options: [
        'The owners lose their limited liability',
        'The business can no longer take on employees',
        'Annual accounts must be filed and are open for anyone to inspect',
        'The owner must give the business away to investors',
      ],
      correct: 2,
      explain:
        'Limited companies must file accounts each year, where rivals and customers can read them — extra admin and a loss of privacy. The owners GAIN limited liability by becoming a Ltd, and a company can employ people exactly like any other business.',
    },
    {
      id: 'p14c',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, what is the main benefit of this arrangement for McDONALD’S (the franchisor)?',
      extract: {
        title: 'McDonald’s and its franchisees',
        text: 'Many McDonald’s restaurants in the UK are run not by the company itself but by franchisees: local business owners who pay an initial fee, fit out the restaurant to McDonald’s exact design, follow its menus and rules, and hand over a continuing share of their sales.',
      },
      options: [
        'McDonald’s has to invest its own money in every new restaurant',
        'The brand grows using the franchisees’ money, while McDonald’s collects fees and a share of sales',
        'McDonald’s can stop protecting its brand and standards',
        'Every franchisee is guaranteed to make a large profit',
      ],
      correct: 1,
      explain:
        'Franchising lets a brand expand fast without paying for premises and equipment itself — the franchisee’s money does that — while the franchisor collects the initial fee, a royalty on sales, and keeps control through strict rules. Profit is never guaranteed for either side.',
    },
    {
      id: 'p14d',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which factor best explains IKEA’s choice of out-of-town sites?',
      extract: {
        title: 'IKEA on the edge of town',
        text: 'IKEA, the Swedish furniture giant, builds its huge blue stores on the edges of cities, close to motorway junctions, with thousands of free parking spaces and a restaurant inside. Customers often drive a long way, shop in bulk and load flat-packed furniture into their cars.',
      },
      options: [
        'The highest possible footfall from city-centre passers-by',
        'Being as close as possible to the most expensive shopping streets',
        'Making sure customers cannot arrive by car',
        'Large, cheaper plots of land with easy motorway access for customers making big, occasional trips',
      ],
      correct: 3,
      explain:
        'IKEA needs vast plots for its stores and warehouses — far cheaper on a city’s edge — and its customers arrive by car to buy in bulk, so motorway access and free parking matter far more than high-street footfall. The right location always depends on the type of business.',
    },
    {
      id: 'p14e',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which statement best explains why the marketing mix matters?',
      extract: {
        title: 'Nike’s marketing mix',
        text: 'When Nike launches a premium running shoe, the four Ps line up: the shoe is packed with new technology (product), it carries a top-end price tag of around £180 (price), it is promoted by elite marathon runners (promotion), and it is sold through Nike’s own app, website and selected sports shops (place).',
      },
      options: [
        'Each of the 4Ps can point in a different direction without any harm',
        'A premium product sells best when paired with the lowest possible price',
        'Promotion is the only P that influences what customers buy',
        'The product, price, promotion and place must work together to appeal to the target market',
      ],
      correct: 3,
      explain:
        'The marketing mix only works as a set: a technology-packed shoe, a premium price, star-athlete promotion and quality retailers all reinforce the same message to serious runners. A premium product at a bargain price would send mixed signals and cheapen the brand.',
    },
    {
      id: 'p14f',
      type: 'mcq',
      topic: '1.4',
      difficulty: 3,
      marks: 1,
      stem: 'Which of the following would NOT normally be found in a start-up’s business plan?',
      options: [
        'A month-by-month cash flow forecast for the first year',
        'The target market and the marketing mix',
        'The current share prices of rival companies on the stock exchange',
        'An estimate of start-up costs and predicted revenue',
      ],
      correct: 2,
      explain:
        'A business plan sets out the idea, the market, the marketing plan, the costs, the revenue forecast and the cash flow forecast — the evidence a bank needs before lending. Live share prices of other companies are irrelevant to a start-up’s plan.',
    },
    {
      id: 'p14g',
      type: 'term',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for a person’s legal responsibility to pay back money that is owed?',
      accept: ['liability', 'a liability', 'liabilities', 'the liability'],
      explain:
        'Liability is legal responsibility for debts. For sole traders it is unlimited — the owner’s own savings and possessions can be claimed — while the owners of a limited company can lose only the money they invested.',
    },
    {
      id: 'p14h',
      type: 'term',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for buying and selling goods and services over the internet?',
      accept: ['e-commerce', 'ecommerce', 'e commerce', 'electronic commerce', 'online commerce', 'online selling'],
      explain:
        'E-commerce is trading online — through a website or app rather than a physical shop. It lets a business reach customers anywhere at any hour with no shop rent to pay, though delivery costs and returns become new problems to solve.',
    },
    {
      id: 'p14i',
      type: 'term',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the business that owns a brand and sells the right to trade under it — McDonald’s, for example?',
      accept: ['franchisor', 'the franchisor', 'a franchisor', 'franchiser', 'the franchiser'],
      explain:
        'The franchisor owns the brand and the business system; the franchisee buys the right to use them, paying an initial fee plus a continuing share of revenue. McDonald’s is the franchisor — the local restaurant owner is the franchisee.',
    },
    {
      id: 'p14j',
      type: 'term',
      topic: '1.4',
      difficulty: 3,
      marks: 1,
      stem: 'What is the name for a company whose shares are not traded on a stock exchange, and whose shareholders enjoy limited liability?',
      accept: ['private limited company', 'a private limited company', 'private limited', 'ltd', 'limited company'],
      explain:
        'A private limited company (Ltd) sells shares — but privately, to family, friends or invited investors, never on the open market. Its shareholders have limited liability: the most they can lose is what they paid for their shares.',
    },
    {
      id: 'p14k',
      type: 'fib',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'A company whose shares anyone can buy and sell on the stock exchange is a ________ limited company. What one word completes the sentence?',
      accept: ['public', 'public limited', 'plc'],
      explain:
        'A public limited company (plc) can sell shares to the general public on a stock exchange such as the London Stock Exchange — a way of raising huge sums for growth, at the cost of losing some control and having to publish results.',
    },
    {
      id: 'p14l',
      type: 'fib',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'A franchisee pays the franchisor a continuing share of sales, known as a ________. What one word completes the sentence?',
      accept: ['royalty', 'a royalty', 'royalties', 'royalty fee', 'the royalty'],
      explain:
        'The royalty is the franchisor’s ongoing income: a percentage of the franchisee’s sales, paid for as long as the franchisee trades under the brand. Together with the initial fee, it is the price of renting a proven business system.',
    },
    {
      id: 'p14m',
      type: 'numeric',
      topic: '1.4',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate how many whole years of profit it would take a new franchisee to earn back the £120,000 fee.',
      extract: {
        title: 'Bean Scene franchise',
        text: 'Bean Scene is a coffee-shop franchise. Opening a new franchise costs a one-off fee of £120,000, which covers equipment, shop-fitting, training and the right to use the brand. Bean Scene forecasts that a typical shop earns its owner an average profit of £30,000 a year.',
      },
      value: 4,
      tol: 0.05,
      unit: 'years',
      explain:
        'Payback = fee ÷ annual profit = £120,000 ÷ £30,000 = 4 years. Only after four years does the franchisee start keeping ‘new’ money — one reason a franchise feels lower-risk (a proven brand) but takes time to reward.',
    },
    {
      id: 'p14n',
      type: 'numeric',
      topic: '1.4',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate Site A’s rent cost PER PASSER-BY, in pence. Give your answer to the nearest penny.',
      extract: {
        title: 'Two sites in Kelsford',
        text: 'A jeweller is comparing two shop sites in Kelsford. Site A, in the shopping centre, costs £2,400 a month in rent and has roughly 12,000 passers-by a month. Site B, on a quiet side street, costs £900 a month in rent and has roughly 3,000 passers-by a month.',
      },
      value: 20,
      tol: 0.05,
      unit: 'p',
      dp: 0,
      explain:
        'Site A: £2,400 = 240,000p a month ÷ 12,000 passers-by = 20p per potential customer. Site B works out at 30p (£900 = 90,000p ÷ 3,000) — so the ‘expensive’ site actually reaches each passer-by for less. Footfall always has to be weighed against the cost of the site.',
    },
    {
      id: 'p14o',
      type: 'truefalse',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'Shares in a private limited company can be bought and sold freely by anyone on the stock exchange.',
      answer: false,
      explain:
        'False — that describes a public limited company (plc). A private limited company’s shares are sold privately, usually with the agreement of the other shareholders, and are never traded on the stock exchange.',
    },
    {
      id: 'p14p',
      type: 'truefalse',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Selling online allows even a tiny business to reach customers far beyond its local area, at any hour of the day.',
      answer: true,
      explain:
        'True. E-commerce turns ‘place’ into a website or app: a one-person business can sell nationwide — even worldwide — around the clock, without opening a single shop. The trade-offs are delivery costs and customers not being able to touch the product first.',
    },
  ],
};
export default def;

// gcsebusiness question bank — Growth Case Studies (Topic 2.1)
// Author: gcsebusiness content team. Real cases: Purplebricks/Strike,
// Biscuiteers, Primark & ABF — all figures verifiable. The Old Mill Bakery
// is fictional with clean, internally consistent numbers.

import type { QuizDef } from '@/lib/bank';

const casesgrowth: QuizDef = {
  id: 'casesgrowth',
  title: 'Growth Case Studies',
  blurb:
    'Four growth case studies: Purplebricks and Strike, Biscuiteers, Primark and ABF, and a fictional craft bakery planning its expansion.',
  theme: 2,
  topics: ['2.1'],
  questions: [
    {
      id: 'cg1',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Purplebricks was once a well-known brand worth hundreds of millions of pounds on the stock market. Which statement best explains why it sold for just £1?',
      extract: {
        title: 'Purplebricks sold for £1',
        text: 'In May 2023 the online estate agent Purplebricks was sold to competing estate agent Strike for just £1. Only a year earlier, in May 2022, its share price had peaked at £1.89. The business had been losing money, and years of falling sales had destroyed most of its value.',
      },
      diagram: 'shareprice',
      options: [
        'A PLC can never be worth more than £1 in total',
        'It was losing money and its value had collapsed',
        'It had too many high-street branches, which made the business worthless',
        'Brands become less valuable the better known they become',
      ],
      correct: 1,
      explain:
        'A business is worth what a buyer will pay for its future profits. Purplebricks kept losing money, so almost no value was left once its debts and problems were counted in — hence a price of £1. A well-known brand alone does not guarantee value.',
    },
    {
      id: 'cg2',
      type: 'numeric',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 2,
      stem: 'Calculate how much the investor’s 1,000 shares were worth at the price of £0.76.',
      extract: {
        title: 'Purplebricks — a painful year for investors',
        text: 'In May 2022 Purplebricks’ share price peaked at £1.89. In May 2023 the business was sold to Strike for £1, and the day after the sale was announced the share price was £0.76. One investor had bought 1,000 shares at the peak.',
      },
      unit: '£',
      value: 760,
      tol: 0.5,
      explain:
        '1,000 × £0.76 = £760. At the peak they had been worth 1,000 × £1.89 = £1,890, so the investor lost £1,130 of value as the business collapsed.',
    },
    {
      id: 'cg3',
      type: 'fib',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Because Strike and Purplebricks sold the same service to the same customers, they were ________ of one another. What one word completes this sentence?',
      extract: {
        title: 'Strike and Purplebricks',
        text: 'Strike and Purplebricks both sold the same service — online estate agency — to the same customers: people selling their homes. Now that Strike owns Purplebricks, it no longer has to compete with it.',
      },
      accept: ['competitors', 'competitor', 'rivals', 'rival'],
      explain:
        'Businesses selling the same product or service to the same customers are competitors (rivals). Taking over a competitor is a classic reason for a horizontal takeover — it removes one source of competition.',
    },
    {
      id: 'cg4',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which benefit is Biscuiteers most likely to gain from co-branding with a famous name like Dior?',
      extract: {
        title: 'Biscuiteers',
        text: 'Biscuiteers Baking Company Ltd was founded in 2007 and sells luxury hand-iced biscuits as gifts. It has grown by around 400% per annum, with projected revenue of £11m for 2023/24. As well as selling through its own website, it has created co-branded ranges with Dior, Harrods, Great Ormond Street Hospital and Emma Bridgewater.',
      },
      diagram: 'luxgrowth',
      options: [
        'It can close its own website and stop selling directly to customers',
        'Dior will pay all of Biscuiteers’ running costs forever',
        'Access to Dior’s customers and the prestige of a famous brand link-up',
        'Hand-icing the biscuits will suddenly become cheaper to do',
      ],
      correct: 2,
      explain:
        'Co-branding with a big luxury name puts Biscuiteers in front of a huge new audience and borrows the partner’s prestige — a big help as it moves into wholesale and then overseas markets.',
    },
    {
      id: 'cg5',
      type: 'term',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'What type of growth is Biscuiteers achieving?',
      extract: {
        title: 'Biscuiteers — growing from within',
        text: 'Biscuiteers’ rapid growth has come from selling more of its own products through its own website and shops, and from winning wholesale contracts with big retailers. It has not bought any other businesses.',
      },
      accept: ['organic growth', 'organic', 'internal growth', 'organic (internal) growth'],
      explain:
        'Growth from within — more sales, new ranges, new outlets, funded by the business’s own resources — is organic (internal) growth. Buying or merging with other businesses would be inorganic.',
    },
    {
      id: 'cg6',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 3,
      marks: 1,
      stem: 'Which of the following is the most likely reason for the founders’ decision not to float?',
      extract: {
        title: 'Biscuiteers — staying private',
        text: 'Biscuiteers is a private limited company (Ltd). Its founders want to keep growing but have decided not to float the business on a stock exchange, even though selling shares to the public would raise money for expansion.',
      },
      options: [
        'Selling ownership to the public always makes a business smaller',
        'A PLC is not allowed to sell luxury products at all',
        'Once floated, the founders would be forced to sell all of their own shares',
        'Floating would dilute the founders’ control and invite a takeover',
      ],
      correct: 3,
      explain:
        'Selling shares to the public means the founders own a smaller slice, must answer to outside shareholders — and an outsider could buy enough shares to seize control. Staying private keeps control and avoids takeover risk, at the cost of slower funding.',
    },
    {
      id: 'cg7',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 3,
      marks: 1,
      stem: 'Which statement gives the most likely reason why Primark sells almost entirely through its shops?',
      extract: {
        title: 'Primark — no online store',
        text: 'Primark is owned by Associated British Foods (ABF), which also owns food brands such as Ryvita, Patak’s and Kingsmill. In 2022 Primark had 408 stores worldwide, including 197 in the UK. Unlike most competing fashion chains, Primark has no online store — almost all sales happen in its shops, where prices are famously low.',
      },
      diagram: 'primarkstores',
      options: [
        'Selling online would force Primark to close all 408 of its shops first',
        'Picking and posting individual orders adds costs its low prices cannot cover',
        'Clothes bought online can never legally be returned to a shop',
        'ABF bans every single brand it owns from using the internet',
      ],
      correct: 1,
      explain:
        'Primark’s whole model rests on very low prices and huge in-store basket sizes. Handling individual online orders — warehousing, picking, postage, returns — would add big costs per item that rock-bottom prices would struggle to cover.',
    },
    {
      id: 'cg8',
      type: 'term',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for growth into different, unrelated markets or products?',
      extract: {
        title: 'ABF — a varied portfolio',
        text: 'ABF is a diversified group: as well as the clothing retailer Primark, it owns food brands including Ryvita, Patak’s and Kingsmill, so it earns money from fashion retail, groceries and ingredients. If one market suffers, the others can keep the group’s profits up.',
      },
      accept: ['diversification', 'diversifying', 'diversify'],
      explain:
        'Diversification means expanding into different products, markets or industries. ABF spreading its portfolio across food and fashion retail reduces the risk that one struggling market drags the whole group down.',
    },
    {
      id: 'cg9',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a benefit to Primark of being owned by ABF?',
      extract: {
        title: 'Primark — part of a bigger group',
        text: 'Primark opens dozens of new stores around the world each year. Because it is part of ABF, these openings can be funded from the profits of the whole group, not just from Primark’s own cash.',
      },
      options: [
        'New stores can be funded from the group’s pooled profits',
        'Primark no longer needs to win any customers at all',
        'ABF guarantees Primark will never face any competition',
        'Primark can ignore the running costs of all of its shops',
      ],
      correct: 0,
      explain:
        'Being part of a large group gives access to funding from the group’s combined profits — a cheaper, lower-risk way to finance expansion than borrowing alone. The other options describe advantages no owner could ever guarantee.',
    },
    {
      id: 'cg10',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which advantage of buying The Bread Basket would appeal most to the Old Mill Bakery?',
      extract: {
        title: 'The Old Mill Bakery — two ways to grow',
        text: 'The Old Mill Bakery is a craft bakery with one busy shop in Ludlow. Its owners want to expand into Shrewsbury. They are weighing up two options: open a new shop of their own, or buy The Bread Basket, a two-shop bakery in Shrewsbury whose owners are retiring.',
      },
      diagram: 'growpaths',
      options: [
        'Buying another bakery is always cheaper than opening a new shop',
        'Speed — the shops, trained staff and existing customers come on day one',
        'The retiring owners must keep working for free for five years',
        'A takeover removes the need to pay any legal fees at all',
      ],
      correct: 1,
      explain:
        'A takeover delivers instant growth: premises, equipment, trained staff and an existing customer base are already in place. Opening from scratch means finding a site, fitting it out and building custom — much slower.',
    },
    {
      id: 'cg11',
      type: 'term',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the rise in average costs that can happen when a business becomes too large to manage efficiently?',
      extract: {
        title: 'The Old Mill Bakery — growing pains',
        text: 'The Old Mill Bakery’s owners know that running shops 30 miles apart will not be easy. If the business grows too quickly, communication between the shops can break down and mistakes can multiply, pushing up costs per loaf.',
      },
      accept: ['diseconomies of scale', 'diseconomies'],
      explain:
        'Diseconomies of scale raise average unit costs when a business grows beyond the size it can manage well — typically through poor communication and weak coordination. They appear on the rising part of the average cost curve.',
    },
    {
      id: 'cg12',
      type: 'numeric',
      topic: '2.4',
      subtopic: '2.4.1',
      difficulty: 3,
      marks: 2,
      stem: 'Calculate how many extra loaves the Shrewsbury shop must sell each month just to cover the extra £2,500 of fixed costs.',
      extract: {
        title: 'The Old Mill Bakery — the cost of expanding',
        text: 'Opening a new shop in Shrewsbury would add £2,500 a month to the Old Mill Bakery’s fixed costs. Loaves sell for £2.00 each, and the variable cost of the flour, yeast and baking for each loaf is £0.75.',
      },
      unit: 'loaves',
      value: 2000,
      tol: 0.5,
      explain:
        'Contribution per loaf = selling price − variable cost = £2.00 − £0.75 = £1.25. Extra loaves needed to cover the new fixed costs = £2,500 ÷ £1.25 = 2000 loaves a month.',
    },
    {
      id: 'cg13',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 1,
      marks: 1,
      stem: 'The proportion of total sales in a market made by one business is known as what?',
      extract: {
        title: 'The Old Mill Bakery — a bigger slice',
        text: 'Today the Old Mill Bakery sells about a quarter of all the craft bread bought in Ludlow. If it takes over The Bread Basket, it will also supply Shrewsbury, and its slice of the regional bread market will grow.',
      },
      options: [
        'Its market share',
        'Its market size',
        'Its market growth',
        'Its market segment',
      ],
      correct: 0,
      explain:
        'Market share is the proportion (percentage) of total sales in a market that one business makes. Takeovers often aim to increase market share — removing one competing business and adding its sales in one step.',
    },
    {
      id: 'cg14',
      type: 'term',
      topic: '2.1',
      subtopic: '2.1.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for growth in which a business buys one of its suppliers?',
      extract: {
        title: 'The Old Mill Bakery — a third option',
        text: 'A third option for the Old Mill Bakery is to buy a small local flour mill that already supplies part of its flour. Owning the mill would secure the bakery’s supply of flour and could cut its buying costs.',
      },
      accept: ['vertical integration', 'backward vertical integration', 'backward integration', 'vertical'],
      explain:
        'Buying a supplier is backward vertical integration — the business moves back along the supply chain towards raw materials, securing supply and often cutting costs.',
    },
  ],
};

export default casesgrowth;

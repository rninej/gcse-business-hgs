// gcsebusiness question bank — PRACTICE pool, Topic 2.2 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-2-2',
  title: 'Product, Price, Promotion & Place',
  blurb: 'Product life cycles, pricing strategies, sponsorship and distribution — featuring Zara, Spotify, Notonthehighstreet.com and Arsenal’s Emirates deal.',
  theme: 2,
  topics: ['2.2'],
  audience: 'practice',
  questions: [
    {
      id: 'p22a',
      type: 'mcq',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which of the following best explains how Zara competes with its rivals?',
      extract: {
        title: 'Zara',
        text: 'Zara is part of Inditex, the Spanish fashion group. Its design teams create new designs continuously, and a new design can go from the drawing board to Zara’s shops around the world in a matter of weeks. Shop managers report back daily on what customers are buying, so popular designs are re-made quickly and unpopular ones are dropped.',
      },
      options: [
        'New designs reach its shops within weeks, so customers always find something new',
        'It charges the highest prices on the high street',
        'It sells exactly the same designs for two full seasons',
        'It keeps every design on sale until every item is sold',
      ],
      correct: 0,
      explain:
        'Zara differentiates itself through speed: turning designs into stock in weeks means customers know there is always something new, and daily sales feedback means less money wasted on designs nobody wants. Rivals find that combination very hard to copy.',
    },
    {
      id: 'p22b',
      type: 'mcq',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study and the diagram, which stage of the product life cycle has music streaming reached in the UK?',
      extract: {
        title: 'Spotify and streaming',
        text: 'Spotify, launched in Sweden in 2008, lets millions of people in the UK stream music. By the 2020s, streaming had become the way most people in Britain listen to music — almost every phone works with it, and rivals such as Apple Music and Amazon Music compete for the same listeners.',
      },
      diagram: 'plc',
      options: [
        'Introduction',
        'Growth',
        'Maturity',
        'Decline',
      ],
      correct: 2,
      explain:
        'Streaming is mature: almost everyone who wants it already uses it, and several strong rivals compete for the same listeners. At maturity, sales growth flattens, so businesses defend share with updates and new features rather than counting on explosive growth.',
    },
    {
      id: 'p22c',
      type: 'mcq',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is most likely to lead to a price war between rival businesses?',
      options: [
        'Strong rivals keep cutting prices below each other to win customers',
        'One business quietly raises its prices',
        'A business launches a premium product at a high price',
        'Rivals agree to keep their prices high together',
      ],
      correct: 0,
      explain:
        'A price war starts when rivals keep undercutting each other — and everyone’s margins shrink. The usual winners are the businesses with the lowest costs. Note the last option: rivals agreeing to fix prices is illegal, and it keeps prices UP rather than starting a war.',
    },
    {
      id: 'p22d',
      type: 'mcq',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, why do businesses such as Emirates pay millions for Premier League sponsorship deals?',
      extract: {
        title: 'Emirates and Arsenal',
        text: 'Arsenal’s home ground in north London has been known as the Emirates Stadium since it opened in 2006, after the airline Emirates agreed one of the biggest sponsorship deals in football. The Emirates name appears on the stadium, on Arsenal’s shirts and across match broadcasts, and the deal has been renewed repeatedly since.',
      },
      options: [
        'Fans are required to buy from the sponsor',
        'The sponsor’s name is seen again and again by millions of fans and TV viewers, keeping the brand famous',
        'It is the cheapest form of promotion available',
        'It guarantees the club will win trophies',
      ],
      correct: 1,
      explain:
        'Sponsorship is promotion through association: the sponsor’s name is repeated endlessly to a huge, loyal audience, and some of the club’s image rubs off on the brand. It is expensive compared with, say, social media — but it reaches mass audiences that smaller channels cannot.',
    },
    {
      id: 'p22e',
      type: 'mcq',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which of the following is a drawback for the small businesses of selling through Notonthehighstreet.com?',
      extract: {
        title: 'Notonthehighstreet.com',
        text: 'Notonthehighstreet.com is a British online marketplace founded in 2006. Thousands of small businesses — jewellers, artists, food makers — list their products on the website, which brings them a huge audience of gift shoppers. In return, the website takes a percentage of the price of each item sold.',
      },
      options: [
        'They must open their own shops on the high street',
        'The website designs every product for them',
        'It removes the need for good product photographs',
        'The website takes a share of every sale, so sellers keep less than they would selling direct',
      ],
      correct: 3,
      explain:
        'Selling through an intermediary sacrifices margin: the marketplace’s share comes out of every sale. In return the sellers get reach and convenience — a ready-made audience they could never attract alone. Selling direct keeps the full price, but the seller must then win its own customers.',
    },
    {
      id: 'p22f',
      type: 'mcq',
      topic: '2.2',
      difficulty: 3,
      marks: 1,
      stem: 'A watch brand sells luxury watches at £3,000 each. Which combination of decisions is most consistent with this product?',
      options: [
        'Sold on market stalls, promoted with money-off vouchers, priced to match rivals',
        'Sold in supermarkets, promoted with buy-one-get-one-free offers, heavy discounts online',
        'Sold through upmarket jewellers, promoted with quality magazine advertising, price held firm',
        'Sold in as many outlets as possible, promoted with flashing sale banners, prices cut weekly',
      ],
      correct: 2,
      explain:
        'The four Ps must work together for the target market. A premium product needs a premium price, an upmarket place and promotion that signals quality — if a £3,000 watch were promoted like a bargain, customers would doubt its worth and the brand would suffer.',
    },
    {
      id: 'p22g',
      type: 'term',
      topic: '2.2',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for the feature that makes a product different from every rival’s product — the reason a customer chooses it over the others?',
      accept: ['unique selling point', 'unique selling proposition', 'usp', 'USP'],
      explain:
        'A unique selling point (USP) is what sets a product apart — Dyson’s design, Innocent’s natural ingredients, Zara’s speed to market. A strong USP lets a business charge more, because customers cannot get the same thing elsewhere.',
    },
    {
      id: 'p22h',
      type: 'term',
      topic: '2.2',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for a product sold below cost on purpose, to attract customers who will then buy other, profitable items?',
      accept: ['loss leader', 'a loss leader', 'loss leaders', 'loss-leader'],
      explain:
        'A loss leader loses money on every sale — but that is the point. Shoppers drawn in by the bargain pick up a full basket of goods at a profit, so the business can still come out ahead.',
    },
    {
      id: 'p22i',
      type: 'term',
      topic: '2.2',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for customers who keep choosing the same brand again and again instead of switching to rivals?',
      accept: ['brand loyalty', 'loyalty', 'customer loyalty', 'brand-loyalty'],
      explain:
        'Brand loyalty means customers buy almost without checking rivals. Strong brands such as Coca-Cola — one of the most recognised brands in the world — benefit hugely: loyal customers keep buying, which makes revenue more predictable and price rises easier to get away with.',
    },
    {
      id: 'p22j',
      type: 'fib',
      topic: '2.2',
      difficulty: 3,
      marks: 1,
      stem: 'Launching an updated version of a product, or finding new markets for it, to keep it selling during maturity or decline is called an ________ strategy. What one word completes the term?',
      accept: ['extension', 'Extension', 'extending' ],
      explain:
        'Extension strategies prolong a product’s life: new versions, new packaging, new features or new markets. Introduced early — around maturity — they can restart growth; left too late, the product may already be in decline.',
    },
    {
      id: 'p22k',
      type: 'fib',
      topic: '2.2',
      difficulty: 1,
      marks: 1,
      stem: 'Buying and selling goods and services over the internet is known as e-________. What one word completes the term?',
      accept: ['commerce', 'Commerce', 'EC'],
      explain:
        'E-commerce is trading online. It has transformed the place element of the marketing mix: a business can now sell to customers anywhere, at any time, without needing a shop on every high street.',
    },
    {
      id: 'p22l',
      type: 'truefalse',
      topic: '2.2',
      difficulty: 3,
      marks: 1,
      stem: 'Price skimming means setting a LOW launch price to win market share quickly, then raising the price later.',
      answer: false,
      explain:
        'False — that describes penetration pricing. Skimming is the opposite: a HIGH launch price (typical for new technology) that “skims” the maximum from customers who must have it first, before prices are cut as rivals catch up.',
    },
    {
      id: 'p22m',
      type: 'truefalse',
      topic: '2.2',
      difficulty: 1,
      marks: 1,
      stem: 'For most small businesses with a small marketing budget, a prime-time TV advertising campaign is usually more cost-effective than targeted social media promotion.',
      answer: false,
      explain:
        'False. TV reaches huge audiences but at enormous cost, and much of the spending lands on people who would never buy. Social media is cheap, precisely targeted and its results can be measured — usually a far better fit for a small budget.',
    },
    {
      id: 'p22n',
      type: 'numeric',
      topic: '2.2',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the selling price of one pair of trainers under cost-plus pricing. Give your answer in pounds to 2 decimal places.',
      extract: {
        title: 'Sole & Thread',
        text: 'Sole & Thread is a small British start-up making trainers. The unit cost of making one pair — materials, labour and factory costs — is £14. Using cost-plus pricing, the founders add a mark-up of 150% of the unit cost. They are deciding how to price the trainers when they launch.',
      },
      value: 35,
      tol: 0.25,
      unit: '£',
      dp: 2,
      explain:
        'Cost-plus price = unit cost + mark-up. The mark-up is 150% of £14 = £21, so the price is £14 + £21 = £35.00. Cost-plus is simple and guarantees a margin on every pair — but it ignores what customers will actually pay and what rivals charge.',
    },
    {
      id: 'p22o',
      type: 'numeric',
      topic: '2.2',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the percentage increase in the price of one tube when the launch offer ends. Give your answer to the nearest whole number.',
      extract: {
        title: 'Meadow & Marsh',
        text: 'Meadow & Marsh makes skincare from natural ingredients. To launch its new moisturiser, it is using penetration pricing: the first tubes sell at an introductory price of £8.00. Once the moisturiser is established and reviewed, the price will rise to the normal £12.00.',
      },
      value: 50,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'The rise is £12.00 − £8.00 = £4.00. As a percentage of the launch price: (£4.00 ÷ £8.00) × 100 = 50%. The low launch price wins early customers and reviews — the business then bets they will stay when the price rises.',
    },
    {
      id: 'p22p',
      type: 'term',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for making a product stand out from rivals — through design, quality, branding or service — so customers see it as different?',
      accept: ['differentiation', 'product differentiation', 'Differentiation', 'differentiating'],
      explain:
        'Differentiation lifts a product out of price competition: customers who see it as unique will pay more, which is why businesses hunt for a genuine USP. Without it, the only weapon left is price — and price wars squeeze everyone’s margins.',
    },
  ],
};

export default def;

// gcsebusiness question bank — sub-topic fillers: The marketing mix in action
// Fills the 2.2.5 (Using the mix), 2.2.3 (Promotion) and 2.2.4 (Place) coverage gaps.
// 2.2.5 ×4 · 2.2.3 ×3 (segment-matched promotion + tech) · 2.2.4 ×3 (retailers vs e-tailers).

import type { QuizDef } from '@/lib/bank';

const mixinaction: QuizDef = {
  id: 'mixinaction',
  title: 'The marketing mix in action',
  blurb: 'How the 4Ps lean on each other to win customers — promotion that fits the segment and place choices from shop to website.',
  theme: 2,
  topics: ['2.2'],
  audience: 'assignment',
  questions: [
    {
      id: 'mx1',
      type: 'mcq',
      topic: '2.2',
      subtopic: '2.2.5',
      difficulty: 2,
      marks: 1,
      stem: 'A chocolatier sells handmade luxury truffles in gift boxes. Which price best fits the rest of its marketing mix, and why?',
      options: [
        'A high price that signals quality and craftsmanship',
        'A loss-leader price below cost, to pull shoppers in',
        'The lowest price in the market, to beat every rival',
        'A price matched exactly to the cheapest supermarket',
      ],
      correct: 0,
      explain:
        'Price must match product: handmade luxury truffles need a premium price that signals quality and protects the margin. A rock-bottom price would undermine the luxury image — the elements influence each other.',
    },
    {
      id: 'mx2',
      type: 'mcq',
      topic: '2.2',
      subtopic: '2.2.5',
      difficulty: 2,
      marks: 1,
      stem: 'The same chocolatier must now choose where to sell the truffles. Which choice fits the rest of its mix best?',
      options: [
        'A discount pound shop on the edge of town',
        'A market stall squeezed between fruit vendors',
        'Upmarket food halls and its own website',
        'A cash-and-carry wholesaler, in boxes of 200',
      ],
      correct: 2,
      explain:
        'Place must match product and price: luxury truffles belong in upmarket outlets that reinforce the premium image. A pound shop or market stall would send mixed messages about quality.',
    },
    {
      id: 'mx3',
      type: 'mcq',
      topic: '2.2',
      subtopic: '2.2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is meant by an INTEGRATED marketing mix?',
      options: [
        'Choosing each of the 4Ps independently, to save time',
        'All four Ps designed to work together for the target market',
        'Using the most expensive option for each of the 4Ps',
        'Selling as many products as possible at any price',
      ],
      correct: 1,
      explain:
        'An integrated mix means product, price, promotion and place reinforce one another and suit the target market — a premium product with a premium price, promotion and place. Consistency across all four Ps is what rivals find hard to copy.',
    },
    {
      id: 'mx4',
      type: 'truefalse',
      topic: '2.2',
      subtopic: '2.2.5',
      difficulty: 3,
      marks: 1,
      stem: 'A skincare brand halves its prices but keeps its gold packaging, celebrity adverts and department-store counters. Its marketing mix will still work just as well as before.',
      answer: false,
      explain:
        'False. The elements of the mix influence each other: a half-price product with luxury promotion and an upmarket place sends confused messages. Promotion and place would need to change too if the price genuinely fell to budget level.',
    },
    {
      id: 'mx5',
      type: 'mcq',
      topic: '2.2',
      subtopic: '2.2.3',
      difficulty: 2,
      marks: 1,
      stem: 'A garden centre wants to promote its new tearoom to customers aged 65 and over. Which channel is most appropriate for this market segment?',
      options: [
        'A viral dance challenge on TikTok',
        'Sponsoring a national gaming tournament',
        'Flyers handed out at a nightclub door',
        'Adverts in the local paper they read',
      ],
      correct: 3,
      explain:
        'Promotion must suit the segment: many customers aged 65 and over read a local paper, while few follow the latest TikTok trends. Matching the channel to the audience is what makes promotion cost-effective.',
    },
    {
      id: 'mx6',
      type: 'mcq',
      topic: '2.2',
      subtopic: '2.2.3',
      difficulty: 1,
      marks: 1,
      stem: 'A new breakfast cereal wants shoppers to try it before deciding whether to buy. Which promotion method fits this aim best?',
      options: [
        'Free sample packs handed out in supermarkets',
        'A sponsorship deal with a football league',
        'A price rise to make the cereal feel premium',
        'Stopping all advertising to save money',
      ],
      correct: 0,
      explain:
        'Product trials such as free samples let customers taste before buying — ideal for a new food product, where taste decides the sale. Sponsorship builds awareness but never gets the product tasted.',
    },
    {
      id: 'mx7',
      type: 'fib',
      topic: '2.2',
      subtopic: '2.2.3',
      difficulty: 1,
      marks: 1,
      stem: 'A bakery emails its regular customers a monthly bulletin with news and money-off vouchers. This form of digital promotion is called an e-________. What word completes the term?',
      accept: ['newsletter', 'news letter', 'news-letter'],
      explain:
        'E-newsletters are promotion delivered by technology: cheap to send, easy to personalise and measurable — the bakery can count how many vouchers are redeemed. They keep the brand in customers’ minds between visits.',
    },
    {
      id: 'mx8',
      type: 'mcq',
      topic: '2.2',
      subtopic: '2.2.4',
      difficulty: 1,
      marks: 1,
      stem: 'What is an e-tailer?',
      options: [
        'A retailer that sells only from market stalls',
        'A retailer that sells to customers over the internet',
        'A business that delivers parcels for other firms',
        'A wholesaler that sells only to other businesses',
      ],
      correct: 1,
      explain:
        'An e-tailer is a retailer selling online — ASOS is an e-tailer with no shops at all. E-commerce lets e-tailers serve customers far beyond any single high street.',
    },
    {
      id: 'mx9',
      type: 'mcq',
      topic: '2.2',
      subtopic: '2.2.4',
      difficulty: 3,
      marks: 1,
      stem: 'A toy maker sells its wooden toys through high-street shops but is considering selling through its own website instead. Which of the following is an advantage of the website route?',
      options: [
        'Customers can pick the toys up and try them first',
        'The shops promote the toys and hold stock for it',
        'No shop takes a share of the selling price',
        'The maker no longer needs a delivery service',
      ],
      correct: 2,
      explain:
        'Selling direct online avoids sharing margin with a retailer — but the trade-offs are real: customers cannot handle the toys first, and the maker must run its own deliveries. Choosing a channel means weighing cost against convenience.',
    },
    {
      id: 'mx10',
      type: 'fib',
      topic: '2.2',
      subtopic: '2.2.4',
      difficulty: 1,
      marks: 1,
      stem: 'A business that buys goods from manufacturers and sells them to consumers — such as a high-street toy shop — is called a ________. What one word completes the sentence?',
      accept: ['retailer', 'retailers', 'a retailer'],
      explain:
        'A retailer is the shop — physical or online — in the distribution channel between maker and consumer. Selling through retailers reaches their footfall, but each one takes a share of the price, which is why some makers sell direct.',
    },
  ],
};

export default mixinaction;

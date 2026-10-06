// gcsebusiness question bank — PRACTICE pool, mixed sub-topic fillers (student self-study)
// Fifteen objective questions from the spec's quieter corners:
// 1.5.1 Stakeholders ×4 · 1.5.2 Technology ×3 · 2.1.2 Changing aims ×3 · 2.2.5 Using the mix ×2 · 2.3.4 Sales process ×3.

import type { QuizDef } from '@/lib/bank';

const practicefillers: QuizDef = {
  id: 'practicefillers',
  title: 'Mixed practice: spec corners',
  blurb: 'Self-study questions from the spec’s quiet corners — stakeholders, technology, changing aims, the marketing mix and the sales process.',
  theme: 1,
  topics: ['1.5', '2.1', '2.2', '2.3'],
  audience: 'practice',
  questions: [
    {
      id: 'pf1',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following best describes a business stakeholder?',
      options: [
        'Only the people who own shares in the business',
        'Only the people the business employs as staff',
        'Any individual or group affected by the business',
        'Only the customers who buy from the business',
      ],
      correct: 2,
      explain:
        'A stakeholder is anyone affected by, or with an interest in, the business — owners, employees, customers, suppliers, the local community, pressure groups and the government. Shareholders are just one group among many.',
    },
    {
      id: 'pf2',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 1,
      marks: 1,
      stem: 'Ravi runs a small bakery. Which of the following are his SUPPLIERS?',
      options: [
        'The mill and farm that sell him flour',
        'The regulars who buy his loaves each morning',
        'The bakers he employs on the morning shift',
        'The bank that lends him money for an oven',
      ],
      correct: 0,
      explain:
        'Suppliers sell a business the inputs it needs — for Ravi, the mill and the farm. His customers buy the finished loaves, his staff work in the bakery and the bank is a lender: all stakeholders, but each with a different role.',
    },
    {
      id: 'pf3',
      type: 'truefalse',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 1,
      marks: 1,
      stem: 'Pressure groups that campaign about pollution or animal welfare are stakeholders, because they take an active interest in what businesses do.',
      answer: true,
      explain:
        'True. Pressure groups may own nothing and buy nothing, but they campaign to change business behaviour — which makes them stakeholders. Firms may respond by changing products, packaging or suppliers.',
    },
    {
      id: 'pf4',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 2,
      marks: 1,
      stem: 'A factory’s night shifts keep the neighbours awake with lorry noise and floodlight glare. Which stakeholder group is most directly in conflict with the factory?',
      options: [
        'The suppliers, who deliver only in daylight',
        'The local community, whose sleep is disturbed',
        'The government, which collects the factory’s taxes',
        'The customers, who buy its products weekly',
      ],
      correct: 1,
      explain:
        'The local community bears the noise and light, so its objective — a quiet neighbourhood — clashes with the factory’s all-night production. Community opposition can bring complaints, campaigns and even planning restrictions.',
    },
    {
      id: 'pf5',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.2',
      difficulty: 2,
      marks: 1,
      stem: 'A small candle maker films its products being made; customers share the videos widely and its sales climb. Which type of technology most directly boosted the sales?',
      options: [
        'Spreadsheet software that keeps the accounts tidy',
        'Barcode scanners that speed up stock counting',
        'Video calls that shorten supplier meetings',
        'Social media, where shared posts spread the brand',
      ],
      correct: 3,
      explain:
        'Social media turned the videos into free promotion: every share reached new potential customers at no cost to the maker. It is now one of the cheapest ways a small business can raise its sales.',
    },
    {
      id: 'pf6',
      type: 'truefalse',
      topic: '1.5',
      subtopic: '1.5.2',
      difficulty: 2,
      marks: 1,
      stem: 'Sending newsletters and invoices to customers by email is usually dearer than printing and posting them.',
      answer: false,
      explain:
        'False — email and other digital communication cost next to nothing to send: no paper, ink, stamps or delays. Businesses save money and reach customers instantly, though some customers still prefer paper copies.',
    },
    {
      id: 'pf7',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.2',
      difficulty: 2,
      marks: 1,
      stem: 'A jewellery maker works from a small village workshop but sells to customers across the UK. Which technology has made this possible?',
      options: [
        'E-commerce — her website sells across the country',
        'Job production — each ring is made to order',
        'A chain of shops — one in every major city',
        'A wholesaler — holding stock in every county',
      ],
      correct: 0,
      explain:
        'Selling online — e-commerce — removes the need for a shop network: a website and a delivery service let one craftsperson reach the whole country. Technology has opened national markets to the smallest businesses.',
    },
    {
      id: 'pf8',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 3,
      marks: 1,
      stem: 'The founder of a family firm retires, and her daughter takes over with ambitious new plans for the business. Which reason for changing aims is this?',
      options: [
        'Legislation — a new law forced the change',
        'An internal reason — new leadership, new priorities',
        'Market conditions — customers stopped buying',
        'Performance — the business had been failing',
      ],
      correct: 1,
      explain:
        'Internal reasons include changes of ownership or leadership: the new owner’s ambitions become the business’s new aims. Aims often change when the people setting them change.',
    },
    {
      id: 'pf9',
      type: 'fib',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A sandwich shop drops its hot baguettes after sales fall and concentrates on salads and wraps instead. Its product ________ has narrowed. What one word completes the sentence?',
      accept: ['range', 'selection', 'portfolio'],
      explain:
        'Decreasing the product range is one way aims and objectives change: the shop is narrowing what it offers to focus on what sells. Growing businesses make the opposite change, widening the range.',
    },
    {
      id: 'pf10',
      type: 'truefalse',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A struggling business may EXIT a market deliberately, so it can focus on the products where it is strongest.',
      answer: true,
      explain:
        'True. Entering or exiting markets is one way aims change: pulling out of a loss-making market frees cash and management time for stronger products. Exiting can be a strategic retreat rather than a failure.',
    },
    {
      id: 'pf11',
      type: 'mcq',
      topic: '2.2',
      subtopic: '2.2.5',
      difficulty: 3,
      marks: 1,
      stem: 'A budget supermarket’s target market is price-conscious families. Which marketing mix fits this target market best?',
      options: [
        'Luxury own-label food and boutique town-centre shops',
        'Premium prices, celebrity adverts and glossy magazines',
        'Low prices, own-label products and large stores',
        'Designer packaging sold only in airport boutiques',
      ],
      correct: 2,
      explain:
        'The whole mix must fit the target market: price-conscious families want low prices, which own-label products and big stores keep affordable. Premium pricing and boutique outlets would suit a different market entirely.',
    },
    {
      id: 'pf12',
      type: 'fib',
      topic: '2.2',
      subtopic: '2.2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Because its mix fits its market better than its rivals’ mixes fit theirs, a business gains a competitive ________ — an edge that helps it outsell them. What one word completes the sentence?',
      accept: ['advantage', 'advantages', 'edge'],
      explain:
        'A competitive advantage is whatever lets a business outperform its rivals — a better-fitting mix, lower costs or a stronger brand. An integrated mix is one of the most durable advantages because it is hard to copy.',
    },
    {
      id: 'pf13',
      type: 'mcq',
      topic: '2.3',
      subtopic: '2.3.4',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following happens FIRST in the sales process?',
      options: [
        'Answering a customer’s enquiry before any sale is made',
        'Delivering and installing the product after payment',
        'Repairing the product months after the purchase',
        'Inviting the customer to leave a review afterwards',
      ],
      correct: 0,
      explain:
        'The sales process starts before money changes hands, with pre-sale stages such as answering enquiries and advising customers. Delivery, repairs and reviews all belong to the sale itself and afterwards.',
    },
    {
      id: 'pf14',
      type: 'fib',
      topic: '2.3',
      subtopic: '2.3.4',
      difficulty: 1,
      marks: 1,
      stem: 'The support given AFTER a sale — delivery, installation, help lines and repairs — is called after-________ service. What word completes the term?',
      accept: ['sales', 'sale'],
      explain:
        'After-sales service covers everything the business does for the customer once they have paid. It turns one-off buyers into repeat customers, because help after the sale is what people remember.',
    },
    {
      id: 'pf15',
      type: 'truefalse',
      topic: '2.3',
      subtopic: '2.3.4',
      difficulty: 1,
      marks: 1,
      stem: 'Happy customers who recommend a business to their friends are giving it free promotion.',
      answer: true,
      explain:
        'True. Word-of-mouth recommendations cost the business nothing and carry more trust than paid advertising. It is one of the biggest rewards for excellent customer service — alongside repeat purchases.',
    },
  ],
};

export default practicefillers;

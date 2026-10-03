// gcsebusiness question bank — Ownership, Location & the Mix (Topic 1.4)
// Author: gcsebusiness content team. All real-world figures are verifiable.

import type { QuizDef } from '@/lib/bank';

const ownership: QuizDef = {
  id: 'ownership',
  title: 'Ownership, Location & the Mix',
  blurb: 'Sole traders to limited companies, franchising, location, e-commerce, the 4Ps, business plans and stakeholders.',
  theme: 1,
  topics: ['1.4'],
  questions: [
    {
      id: 'ow1',
      type: 'mcq',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'What does UNLIMITED LIABILITY mean for a business owner whose business fails while owing money?',
      options: [
        'The owner is personally responsible for all the business’s debts',
        'The owner can only lose the money they originally invested in the business',
        'The government steps in and settles the business’s unpaid debts',
        'The owner automatically loses nothing at all if the business fails',
      ],
      correct: 0,
      explain:
        'With unlimited liability there is no legal separation between the owner and the business: if it fails, the owner must settle the debts personally. Losing only the amount invested is the position for companies, which are separate legal entities.',
    },
    {
      id: 'ow2',
      type: 'term',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the protection that means the owners of a company can only lose the money they invested, not their personal possessions?',
      accept: ['limited liability', 'limited', 'limited liability protection'],
      explain:
        'Limited liability protects the owners of a company: the business is a separate legal entity, so if it fails, the owners lose at most what they paid for their shares — not their homes or savings.',
    },
    {
      id: 'ow3',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Two partners in a successful design agency are worried that the firm’s debts could put their houses at risk. What change would protect their personal assets?',
      options: [
        'Converting into a private company (Ltd), so each owner risks only what they invested',
        'Staying exactly as they are, because partners’ personal assets are already protected',
        'One partner buying the other out and continuing alone as a one-person business',
        'Borrowing more money so that the existing debts are repaid',
      ],
      correct: 0,
      explain:
        'Ordinary partners have unlimited liability, so their personal assets are exposed. Incorporating makes the business a separate legal entity, so the owners risk at most what they invested.',
    },
    {
      id: 'ow4',
      type: 'fib',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'A business owned and controlled by one person, who keeps all the profit but has unlimited liability, is called a ________ trader. What one word completes the sentence?',
      accept: ['sole', 'sole trader'],
      explain:
        'A sole trader is a one-person business: it is quick and cheap to set up, and the owner keeps all the profit — but the owner also has unlimited liability for all of the business’s debts.',
    },
    {
      id: 'ow5',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Many McDonald’s restaurants in the UK are run as franchises by local business people rather than by the company itself. Which of the following is an advantage for someone who buys the right to run one?',
      options: [
        'Trading under a globally recognised brand, with training and marketing provided',
        'Keeping every pound of revenue, with nothing at all paid to McDonald’s',
        'Complete freedom to change the menu and redesign the brand image',
        'A written guarantee from the franchisor that the outlet cannot fail',
      ],
      correct: 0,
      explain:
        'Buying a franchise gives the right to trade under an established brand such as McDonald’s, benefiting from instant recognition, training and national marketing. In return the buyer pays a fee and a share of revenue, and must follow the franchisor’s rules.',
    },
    {
      id: 'ow6',
      type: 'mcq',
      topic: '1.4',
      difficulty: 3,
      marks: 1,
      stem: 'Which of the following is a DRAWBACK of running a franchise, such as a Krispy Kreme outlet?',
      options: [
        'You must follow the franchisor’s rules and pay a fee plus a share of revenue',
        'You have to build up brand recognition for the outlet completely from scratch',
        'You receive no training or support at all from the franchisor',
        'The franchisor invents all the products but keeps none of the profits',
      ],
      correct: 0,
      explain:
        'Franchising buys a proven system, but the price is independence: the buyer pays an initial fee plus a share of revenue (a royalty), and the franchisor controls pricing, products and branding. Brand recognition, training and support are the advantages, not the drawbacks.',
    },
    {
      id: 'ow7',
      type: 'term',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the person who buys the right to trade under an established brand, such as a McDonald’s restaurant?',
      accept: ['franchisee', 'a franchisee', 'the franchisee', 'franchise owner'],
      explain:
        'The franchisee buys the right to trade under the franchisor’s brand and system, paying a fee and a share of revenue. The franchisor — McDonald’s, for example — keeps overall control of the brand.',
    },
    {
      id: 'ow8',
      type: 'truefalse',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'In an ordinary partnership, the partners’ personal possessions are usually protected from the firm’s debts.',
      answer: false,
      explain:
        'False. In an ordinary partnership each partner usually has unlimited liability — personally responsible for the firm’s debts, including debts run up by the other partners on the business’s behalf. Partnerships do bring shared skills and capital, but that protection is not one of the benefits.',
    },
    {
      id: 'ow9',
      type: 'fib',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'When choosing a site for a shop, the number of potential customers who walk past it each day is called ________. What one word completes the sentence?',
      accept: ['footfall', 'foot fall', 'passing trade', 'passers by'],
      explain:
        'Footfall (passing trade) is crucial for retail: shoppers must be able to see and reach the shop easily. Retailers weigh footfall against the cost of premises, while manufacturers focus more on access to raw materials, motorways and workers.',
    },
    {
      id: 'ow10',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'The fashion retailer ASOS trades online only — it has no physical stores. Which of the following is an advantage of selling only online?',
      options: [
        'No shops to rent, heat or staff — so fixed costs stay low',
        'Customers can try the clothes on before buying them',
        'There is no need to deliver orders to customers',
        'Online fashion retailers never have to process returns',
      ],
      correct: 0,
      explain:
        'E-commerce removes the cost of a whole store network — rent, heating and shop staff. The trade-offs are the opposite of the other options: customers cannot try items on, every order must be delivered, and online fashion sees high rates of returns.',
    },
    {
      id: 'ow11',
      type: 'term',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'What is the collective name for the four elements a business blends together to meet the needs of its target market?',
      accept: ['marketing mix', 'the marketing mix', '4ps', 'the 4ps', 'four ps'],
      explain:
        'The marketing mix is the combination of the four elements (the 4Ps). They must work together — a premium product needs a premium price, quality promotion and the right way of reaching customers.',
    },
    {
      id: 'ow12',
      type: 'fib',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'Product, price, promotion and ________ are the four elements a business combines to meet the needs of its customers. What one word completes the sentence?',
      accept: ['place', 'distribution', 'the place'],
      explain:
        'Place is how and where the product reaches the customer — in shops, online, by mail order or through wholesalers. ASOS’s ‘place’ is entirely online, with no stores.',
    },
    {
      id: 'ow13',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is an example of PROMOTION?',
      options: [
        'A sponsored post on Instagram aimed at 16–24 year olds',
        'Setting the list price of the product at £9.99',
        'Selling the product only through the business’s own website',
        'Improving how long the product lasts before it wears out',
      ],
      correct: 0,
      explain:
        'Promotion is how a business communicates with customers to persuade them to buy — advertising, social media, sponsorship and special offers. The £9.99 list price is a pricing decision, the website is about how the product reaches customers, and durability is a product decision.',
    },
    {
      id: 'ow14',
      type: 'term',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of the document that sets out a business idea, its target market, the marketing plan, the costs and the cash flow forecast?',
      accept: ['business plan', 'a business plan', 'the business plan'],
      explain:
        'A business plan sets out the idea and the numbers behind it. It helps the owners plan properly — and it persuades lenders and investors to provide finance, which is why banks ask to see one.',
    },
    {
      id: 'ow15',
      type: 'truefalse',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'One purpose of writing down the business idea, its market research and its financial forecasts is to persuade lenders, such as banks, to provide finance to a start-up.',
      answer: true,
      explain:
        'True. A plan shows the bank the idea, the market research and the financial forecasts, reducing the lender’s uncertainty. A poor or missing plan is a common cause of start-up failure.',
    },
    {
      id: 'ow16',
      type: 'mcq',
      topic: '1.4',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which pair of stakeholders has the clearest CONFLICT of interest over the new superstore?',
      extract: {
        title: 'Hallam Supermarkets comes to Brompton Falls',
        text: 'Hallam Supermarkets, a large chain, has planning permission to open a new superstore on the edge of Brompton Falls, a small market town. The store will create around 120 full- and part-time jobs. The town’s independent traders say the new store will take their customers, and some residents are unhappy about the extra traffic and lorry deliveries it will bring.',
      },
      options: [
        'The town’s independent traders, who fear losing customers, versus shoppers who want lower prices',
        'The store’s future employees and local jobseekers — two groups who both want the store to open',
        'A franchisor and one of its outlet managers, who are arguing over royalty payments',
        'The store’s owners and its shareholders — because shareholders are not stakeholders',
      ],
      correct: 0,
      explain:
        'The independent traders stand to lose sales to the new superstore, while many shoppers gain lower prices, jobs and choice — directly opposing interests. Future employees and jobseekers both want the store, and shareholders ARE stakeholders, alongside owners, employees, customers, suppliers, lenders, the community and the government.',
    },
  ],
};

export default ownership;

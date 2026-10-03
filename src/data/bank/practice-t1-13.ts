// gcsebusiness question bank — PRACTICE pool, Topic 1.3 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-1-3',
  title: 'Objectives, Break-even & Finance',
  blurb: 'Fifteen mixed questions on targets, costs, break-even, cash-flow risk and finance for a start-up — with a food truck and a brownie stall.',
  theme: 1,
  topics: ['1.3'],
  audience: 'practice',
  questions: [
    {
      id: 'p13a',
      type: 'mcq',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following is a fixed cost for a market stall?',
      options: [
        'The daily pitch fee, paid whatever the stall sells',
        'The carrier bags, used only when a sale is made',
        'The fruit bought each morning, rising on busy days',
        'The bonus paid per basket sold to the assistant',
      ],
      correct: 0,
      explain:
        'Fixed costs stay the same however much is sold — the pitch fee is due on a quiet day and a busy one alike. Bags, fruit and per-sale bonuses all rise and fall with trade, so they are variable costs.',
    },
    {
      id: 'p13b',
      type: 'mcq',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following is the best example of a well-set objective for a new coffee shop?',
      options: [
        'Sell a lot more drinks every month than we sold last month',
        'Sell 300 drinks every day by the end of March',
        'Become the best-loved coffee shop anywhere in the region',
        'Make our customers feel happier than any rival does',
      ],
      correct: 1,
      explain:
        'A good objective is specific, measurable, achievable, realistic and time-bound — “300 drinks a day by the end of March” has a number and a deadline. The others are wishes that cannot be checked.',
    },
    {
      id: 'p13c',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following would make a cash shortage MORE likely for a market trader?',
      options: [
        'Buying far more stock than the quiet month needs',
        'Chasing late payers so the cash arrives quickly',
        'Waiting until spring to buy the new oven',
        'Postponing a big equipment purchase until trade picks up',
      ],
      correct: 0,
      explain:
        'Cash leaves the business when stock is bought and returns only when customers pay. Tying money up in unsold stock is a classic way to run short — even while the business is trading profitably.',
    },
    {
      id: 'p13d',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Instead of buying a £25,000 van, a florist leases one for £120 a week. Which of the following is the main advantage of leasing?',
      options: [
        'The florist owns the van once the lease ends',
        'The weekly cost soon exceeds the purchase price',
        'It avoids a huge up-front payment and allows upgrades',
        'The lease makes the florist the van’s legal owner',
      ],
      correct: 2,
      explain:
        'Leasing rents the equipment instead of buying it, so the florist keeps her cash and can move to a newer van later. The price is paying week after week — and at the end she owns nothing.',
    },
    {
      id: 'p13e',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the main reason a start-up should prepare a cash flow forecast?',
      options: [
        'It guarantees the business will make a profit every single month',
        'It removes the need to keep any sales records at all',
        'It is a legal requirement before a business hires any staff',
        'It flags short months early enough to arrange more borrowing',
      ],
      correct: 3,
      explain:
        'A month-by-month forecast shows when the account will run low, while there is still time to act — arranging borrowing, chasing payments or delaying a purchase. It predicts cash, not profit, and it guarantees nothing.',
    },
    {
      id: 'p13f',
      type: 'term',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for raising small amounts of money from a very large number of people online, usually through a platform such as Kickstarter?',
      accept: ['crowdfunding', 'crowdfund', 'crowd-funding'],
      explain:
        'Crowdfunding gathers many tiny contributions — often in exchange for early products or rewards — to fund one venture. It tests demand at the same time, but the public targets are visible and a failed campaign is public too.',
    },
    {
      id: 'p13g',
      type: 'term',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for a facility that lets a business’s current account go below zero up to an agreed limit, used to cover small short-term gaps?',
      accept: ['overdraft', 'an overdraft', 'bank overdraft', 'overdrafts'],
      explain:
        'An overdraft lets the account dip below zero to an agreed limit: flexible for small gaps, but interest is charged daily and the bank can withdraw the facility. Loans suit bigger, longer-term needs.',
    },
    {
      id: 'p13h',
      type: 'term',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for an arrangement in which a supplier allows the buyer several weeks to pay, after the goods have already been delivered?',
      accept: ['trade credit'],
      explain:
        'Trade credit means “buy now, pay later” with a supplier: the stock can be sold and turned into cash before the bill falls due. It is free short-term finance — unless the payment period is missed.',
    },
    {
      id: 'p13i',
      type: 'fib',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Objectives should be specific, measurable, achievable, realistic and time-bound. What acronym completes the sentence: objectives should be ________?',
      accept: ['smart'],
      explain:
        'SMART stands for Specific, Measurable, Achievable, Realistic and Time-bound. SMART objectives let a business measure progress — and know for certain when a target has been missed.',
    },
    {
      id: 'p13j',
      type: 'fib',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Spending on assets that will be used for years — premises, machinery, vehicles — rather than on day-to-day running, is called ________. What two-word term completes the sentence?',
      accept: ['capital expenditure', 'capital spending'],
      explain:
        'Capital expenditure buys long-lasting assets: premises, machinery, vans. Spending on day-to-day running — wages, materials, energy — is revenue expenditure, and the two are financed quite differently.',
    },
    {
      id: 'p13k',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, calculate Sundara’s profit for last year. Give your answer in pounds to the nearest pound.',
      extract: {
        title: 'Sundara’s Street Food',
        text: 'Sundara trades from a food truck at weekend markets. Last year her revenue was £46,000; ingredients and packaging came to £19,000, and the fixed costs — pitch fees, insurance and the loan repayment — were £21,000.',
      },
      value: 6000,
      tol: 0.5,
      unit: '£',
      dp: 0,
      explain:
        'Total costs = £19,000 + £21,000 = £40,000. Profit = revenue − total costs = £46,000 − £40,000 = £6000.',
    },
    {
      id: 'p13l',
      type: 'numeric',
      topic: '1.3',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, calculate the number of brownies Bella must sell each week to break even. Give your answer as a whole number of brownies.',
      extract: {
        title: 'Bella’s Brownies',
        text: 'Bella sells brownies at £3.00 each from a market stall. Each brownie costs £1.00 in ingredients and packaging, and the stall’s fixed costs are £210 per week.',
      },
      value: 105,
      tol: 0.5,
      unit: 'brownies',
      dp: 0,
      explain:
        'Contribution per brownie = £3.00 − £1.00 = £2.00. Break-even output = fixed costs ÷ contribution per unit = £210 ÷ £2.00 = 105 brownies a week.',
    },
    {
      id: 'p13m',
      type: 'truefalse',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'A business can be profitable on paper and still find itself unable to pay its bills.',
      answer: true,
      explain:
        'True. Profit is earned over time, but bills fall due on particular dates: if cash is tied up in stock, or customers pay late, a profitable firm can still miss a payment.',
    },
    {
      id: 'p13n',
      type: 'truefalse',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'A bank loan is a source of finance that never has to be repaid.',
      answer: false,
      explain:
        'False. A loan must be repaid in instalments, with interest, whether the business thrives or struggles. That is why banks scrutinise forecasts before agreeing one.',
    },
    {
      id: 'p13o',
      type: 'written',
      topic: '1.3',
      difficulty: 3,
      marks: 3,
      stem: 'To what extent does preparing financial forecasts reduce the risk of a start-up failing?',
      explain:
        'Forecasts reduce risk substantially but cannot remove it. Preparing them forces the founder to research real costs, prices and likely sales, exposing problems while they are still fixable; a forecast also persuades lenders and warns of cash-short months early enough to arrange borrowing. Yet the numbers are only assumptions: if demand is overestimated or a key cost jumps, reality will still diverge from the plan. So forecasts are a tool for spotting and managing risk, not a shield against it.',
      points: [
        { text: 'Forecasts force the founder to research real costs, prices and likely sales, exposing weak assumptions while they are still fixable.', marks: 1 },
        { text: 'A forecast persuades lenders and warns of cash-short months early enough to arrange borrowing or delay spending.', marks: 1 },
        { text: 'Judgement: forecasts reduce risk but cannot remove it — overestimated demand, rivals or cost rises can still sink the business, so the quality of the assumptions decides how much protection they give.', marks: 1 },
      ],
    },
  ],
};
export default def;

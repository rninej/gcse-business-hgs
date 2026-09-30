// gcsebusiness question bank — Cash Flow & Sources of Finance (Topic 1.3)
// Author: gcsebusiness content team. Rise & Shine figures match the cashflow diagram exactly.

import type { QuizDef } from '@/lib/bank';

const financesources: QuizDef = {
  id: 'financesources',
  title: 'Cash Flow & Sources of Finance',
  blurb: 'SMART objectives, revenue, costs and profit, cash flow forecasts and sources of finance for a small business.',
  theme: 1,
  topics: ['1.3'],
  questions: [
    {
      id: 'c1',
      type: 'mcq',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following is a SMART objective for a new sandwich shop?',
      options: [
        'Increase sales revenue by 5% within the next six months',
        'Become the best sandwich shop in the country',
        'Sell more sandwiches soon',
        'Make customers happier than before',
      ],
      correct: 0,
      explain:
        'SMART objectives are Specific, Measurable, Achievable, Relevant and Time-bound. ‘Increase sales revenue by 5% within the next six months’ ticks every letter — the others are vague wishes that cannot be measured or timed.',
    },
    {
      id: 'c2',
      type: 'term',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'In a SMART objective, what does the letter M stand for?',
      accept: ['measurable', 'measure', 'measured'],
      explain:
        'M stands for Measurable — an objective must include a number so the business can tell whether it has been achieved, such as ‘increase sales revenue by 5%’.',
    },
    {
      id: 'c3',
      type: 'fib',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Profit = total revenue − total ________. What one word completes the formula?',
      accept: ['costs', 'total costs', 'cost', 'the costs'],
      explain:
        'Profit = total revenue − total costs. If total costs are bigger than total revenue, the result is negative and the business makes a loss instead.',
    },
    {
      id: 'c4',
      type: 'mcq',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following is most likely to be the MAIN aim of a brand-new sole trader business in its first year?',
      options: [
        'Survival — getting through the risky first year of trading',
        'Flotation on the London Stock Exchange',
        'Paying dividends to its shareholders',
        'Becoming the market leader straight away',
      ],
      correct: 0,
      explain:
        'For most start-ups the first-year aim is survival — simply covering costs and keeping trading. Flotation and dividends belong to big companies with shareholders, and market leadership is not realistic at launch.',
    },
    {
      id: 'c5',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'A business can be profitable on paper yet still run out of cash. Which of the following best explains how this happens?',
      options: [
        'It pays for stock and wages now, but customers pay their invoices weeks later — so cash flows out before it flows in',
        'Profit and cash are exactly the same thing, so this is impossible',
        'The bank automatically converts profit into cash every month',
        'Customers always pay in advance, which drains the business’s cash',
      ],
      correct: 0,
      explain:
        'Profit is revenue minus costs over a period, but cash is the money actually available now. Paying for stock and wages up front while customers pay late can leave a profitable business unable to pay its own bills on time.',
    },
    {
      id: 'c6',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 2,
      stem: 'The diagram shows Rise & Shine Ltd’s six-month cash flow forecast in £000s. Calculate the NET CASH FLOW for March. Give your answer in £000s to 1 decimal place (for example, an answer of 2 means £2,000).',
      diagram: 'cashflow',
      value: 1.5,
      tol: 0.05,
      dp: 1,
      explain:
        'Net cash flow = total inflows − total outflows. In March, inflows were £10.5k and outflows were £9.0k, so net cash flow = 10.5 − 9.0 = +1.5 (£000s) — that is, £1,500 more flowed in than flowed out.',
    },
    {
      id: 'c7',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the diagram, state Rise & Shine Ltd’s CLOSING BALANCE at the end of June. Give your answer in £000s to 1 decimal place.',
      diagram: 'cashflow',
      value: 3.5,
      tol: 0.05,
      dp: 1,
      explain:
        'The closing balance at the end of June is £3.5k — the last point on the dashed line. You can check it with the formula: closing balance = opening balance + net cash flow = £3.0k (May’s closing balance) + (£10.0k inflows − £9.5k outflows) = £3.5k.',
    },
    {
      id: 'c8',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the diagram, in which month was Rise & Shine Ltd’s NET CASH FLOW at its lowest?',
      diagram: 'cashflow',
      options: ['January', 'February', 'April', 'June'],
      correct: 0,
      explain:
        'January is the only month with negative net cash flow: inflows £9.0k − outflows £10.5k = −£1.5k. In every other month inflows matched or exceeded outflows, so January was the tightest month for cash.',
    },
    {
      id: 'c9',
      type: 'mcq',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'A small business forecasts a temporary cash gap lasting about three weeks, until a large customer pays its bill. Which source of finance is most suitable for covering it?',
      options: [
        'A bank overdraft',
        'A ten-year bank loan',
        'Floating on the stock exchange',
        'Retained profit from earlier years of trading',
      ],
      correct: 0,
      explain:
        'An overdraft is designed for exactly this: a small, short-term gap, with interest charged only on the amount used and for the days it is used. A ten-year loan would still be being repaid long after the problem disappeared.',
    },
    {
      id: 'c10',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'A board-game designer raises £20,000 by collecting small pledges from thousands of supporters through an online platform such as Kickstarter. What is this source of finance called?',
      options: ['Crowdfunding', 'Trade credit', 'Leasing', 'A bank overdraft'],
      correct: 0,
      explain:
        'Crowdfunding raises finance in small amounts from a large number of people, usually via an online platform. It suits creative projects with a fan base, and supporters typically receive the product or a reward rather than interest payments.',
    },
    {
      id: 'c11',
      type: 'term',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for an arrangement in which a supplier allows a business to pay for goods weeks after they have been delivered?',
      accept: ['trade credit', 'supplier credit', 'credit from suppliers', 'trade credit agreement'],
      explain:
        'Trade credit means buying now and paying the supplier later — often 30 or 60 days afterwards. It is interest-free short-term finance, but a supplier may withdraw it if payments are late.',
    },
    {
      id: 'c12',
      type: 'truefalse',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Leasing a piece of equipment means buying it outright with a bank loan.',
      answer: false,
      explain:
        'False. Leasing is renting equipment for a fixed period: the business pays a regular fee but never owns the asset. It avoids a large upfront cost, though the total payments usually cost more than buying would.',
    },
    {
      id: 'c13',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is CAPITAL expenditure for a new bakery?',
      options: [
        'Buying ovens and paying for the shop refit',
        'Buying flour, butter and eggs each week',
        'Paying the monthly wages bill',
        'Paying the quarterly electricity bill',
      ],
      correct: 0,
      explain:
        'Capital expenditure is spending on fixed, long-lasting assets such as premises, machinery and equipment — the ovens and refit will be used for years. Ingredients, wages and electricity are revenue expenditure: day-to-day running costs.',
    },
    {
      id: 'c14',
      type: 'term',
      topic: '1.3',
      difficulty: 3,
      marks: 1,
      stem: 'What is the term for spending on fixed assets that will be used by the business for more than a year, such as premises, vehicles and machinery?',
      accept: ['capital expenditure', 'capital spending', 'capex', 'capital expenses'],
      explain:
        'Capital expenditure buys long-lived fixed assets. It is different from revenue expenditure — the day-to-day running costs of the business, such as wages, materials and bills.',
    },
    {
      id: 'c15',
      type: 'numeric',
      topic: '1.3',
      difficulty: 3,
      marks: 3,
      stem: 'Sam’s Sandwich Bar sells 400 sandwiches a month at £3.50 each. Fixed costs (rent, insurance and utilities) are £600 a month, and the ingredients (variable cost) work out at £0.50 per sandwich. Calculate the shop’s total PROFIT for a typical month. Give your answer in pounds to the nearest pound.',
      value: 600,
      tol: 0.5,
      unit: '£',
      dp: 0,
      explain:
        'Revenue = 400 × £3.50 = £1,400. Variable costs = 400 × £0.50 = £200, so total costs = £600 + £200 = £800. Profit = total revenue − total costs = £1,400 − £800 = £600 per month.',
    },
    {
      id: 'c16',
      type: 'truefalse',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Retained profit is an external source of finance.',
      answer: false,
      explain:
        'False. Retained profit is profit the business has kept back from previous years — it comes from inside the business, which makes it an internal source, with no interest or repayments to find.',
    },
  ],
};

export default financesources;

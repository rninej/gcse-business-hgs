// gcsebusiness question bank — PRACTICE pool, Topic 2.4 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-2-4',
  title: 'Financial Decisions: Practice',
  blurb: 'Profit margins, break-even, average rate of return, cash flow forecasts, finance for growth and financial documents — featuring Wise’s stock-exchange flotation.',
  theme: 2,
  topics: ['2.4'],
  audience: 'practice',
  questions: [
    {
      id: 'p24a',
      type: 'mcq',
      topic: '2.4',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following is a benefit of preparing a cash flow forecast?',
      options: [
        'It guarantees the business will make a profit',
        'It warns the business in advance of months when cash may run short, so it can arrange an overdraft or delay spending',
        'It removes all risk from the business',
        'It makes customers pay their bills earlier',
      ],
      correct: 1,
      explain:
        'A cash flow forecast is an early-warning system: it predicts the months when outflows will beat inflows before they happen, giving the business time to act — arranging an overdraft, chasing debtors or postponing spending. It is a prediction, not a guarantee, so it should be checked against what actually happens.',
    },
    {
      id: 'p24b',
      type: 'mcq',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'A business needs £500,000 to expand. Which of the following is a drawback of raising the money with a bank loan rather than by issuing new shares?',
      options: [
        'Shareholders must legally be paid a dividend every quarter',
        'Issuing shares makes the business’s debts larger',
        'A loan can never be repaid early',
        'Interest must be paid and the loan repaid on a fixed schedule, even in a bad year',
      ],
      correct: 3,
      explain:
        'A loan is a legal obligation: interest and repayments are due whatever happens to profit. Dividends on ordinary shares, by contrast, can be reduced in a hard year. The trade-off is that new shares dilute the original owners’ control — which is why growing businesses weigh the two carefully.',
    },
    {
      id: 'p24c',
      type: 'mcq',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, what is the process of a company’s shares being admitted to a stock exchange for the public to buy called?',
      extract: {
        title: 'Wise joins the stock exchange',
        text: 'Wise, the London-based fintech company that lets customers move money between countries at low fees, joined the London Stock Exchange in July 2021. The listing valued the company at around $11 billion. Wise was founded in Estonia in 2011 by two friends, Kristo Käärmann and Taavet Hinrikus.',
      },
      options: [
        'Flotation',
        'Liquidation',
        'Nationalisation',
        'Incorporation',
      ],
      correct: 0,
      explain:
        'Flotation (floating) means a company’s shares are offered to the public on a stock exchange. It raises large sums for growth without immediately increasing debt — the trade-offs are that the founders’ ownership is diluted and the company takes on new shareholders to keep happy.',
    },
    {
      id: 'p24d',
      type: 'mcq',
      topic: '2.4',
      difficulty: 3,
      marks: 1,
      stem: 'The diagram shows a break-even chart. A business has fixed costs of £8,000 a month. Each unit sells for £6, and the variable cost per unit is £2. Using the formula, what is the monthly break-even output?',
      diagram: 'breakeven',
      options: [
        '1,333 units',
        '4,000 units',
        '2,000 units',
        '8,000 units',
      ],
      correct: 2,
      explain:
        'Contribution per unit = £6 − £2 = £4. Break-even output = fixed costs ÷ contribution = £8,000 ÷ £4 = 2,000 units. The traps: dividing by the £6 price gives 1,333, and dividing by the £2 variable cost gives 4,000 — always subtract the variable cost first.',
    },
    {
      id: 'p24e',
      type: 'mcq',
      topic: '2.4',
      difficulty: 3,
      marks: 1,
      stem: 'A business’s gross profit margin has stayed at 55% this year, but its net profit margin has fallen from 8% to 3%. Which of the following is the best explanation?',
      options: [
        'The cost of making the products has risen sharply',
        'Overheads — such as rent, salaries and marketing — have grown faster than revenue',
        'The business has stopped selling anything',
        'Revenue has risen to record levels',
      ],
      correct: 1,
      explain:
        'The gross margin is unchanged, so the cost of making the products is still the same share of sales. The gap between gross and net profit is overheads — and with net margin falling, that gap has grown. Overheads must be growing faster than revenue, quietly eating the profit.',
    },
    {
      id: 'p24f',
      type: 'mcq',
      topic: '2.4',
      difficulty: 1,
      marks: 1,
      stem: 'Which document summarises all the transactions between a business and one customer over a period — the invoices sent, the payments received and the balance still owed?',
      options: [
        'A receipt',
        'An invoice',
        'A statement of account',
        'A cash flow forecast',
      ],
      correct: 2,
      explain:
        'A statement of account, sent regularly by the seller, lets the buyer check what has been bought, what has been paid and what is still owed. An invoice bills a single transaction, and a receipt is proof that a payment has been made.',
    },
    {
      id: 'p24g',
      type: 'term',
      topic: '2.4',
      difficulty: 1,
      marks: 1,
      stem: 'What is the name of the document a seller sends to a buyer listing the goods supplied and the amount owed for them?',
      accept: ['invoice', 'an invoice', 'invoices', 'a bill', 'bill'],
      explain:
        'An invoice is the bill for a specific sale: what was supplied, how much is owed and when payment is due. If it goes unpaid, the seller’s next statement of account will show it as an outstanding balance.',
    },
    {
      id: 'p24h',
      type: 'term',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the selling price per unit minus the variable cost per unit?',
      accept: ['contribution', 'contribution per unit', 'unit contribution', 'the contribution'],
      explain:
        'Contribution is what each unit “contributes” towards fixed costs — and once fixed costs are covered, towards profit. That is why break-even output = fixed costs ÷ contribution per unit.',
    },
    {
      id: 'p24i',
      type: 'term',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for revenue minus the cost of sales?',
      accept: ['gross profit', 'the gross profit', 'Gross profit'],
      explain:
        'Gross profit is what is left after paying for the goods that were sold — the coffee beans and food, for a café. It has to cover all the overheads (rent, wages, marketing) before anything remains as net profit.',
    },
    {
      id: 'p24j',
      type: 'term',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of the calculation that expresses a project’s average annual profit as a percentage of the cost of the investment?',
      accept: ['average rate of return', 'arr', 'the average rate of return', 'average rate of return (arr)'],
      explain:
        'The average rate of return (ARR) = (average annual profit ÷ cost of investment) × 100. The higher the percentage, the better the project looks — and it lets a business compare projects of different sizes, or check an investment against the interest the money could earn in the bank.',
    },
    {
      id: 'p24k',
      type: 'fib',
      topic: '2.4',
      difficulty: 1,
      marks: 1,
      stem: 'Net profit margin = (net profit ÷ ________) × 100. What one word completes the formula?',
      accept: ['revenue', 'sales', 'sales revenue', 'turnover'],
      explain:
        'Both margins are percentages of revenue. Comparing them is powerful: if the gross margin is steady but the net margin is falling, the problem lies in the overheads sandwiched between the two.',
    },
    {
      id: 'p24l',
      type: 'fib',
      topic: '2.4',
      difficulty: 1,
      marks: 1,
      stem: 'Opening balance + net cash flow = the ________ balance. What one word completes the formula?',
      accept: ['closing', 'Closing', 'end'],
      explain:
        'The closing balance is what is left at the end of the month — and it becomes next month’s opening balance. A forecast showing a negative closing balance is flashing a warning: the business is heading for trouble unless it acts.',
    },
    {
      id: 'p24m',
      type: 'fib',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'A facility agreed with a bank that lets a business’s current account go below zero, up to a limit, to cover short-term cash gaps is called an ________. What one word completes the term?',
      accept: ['overdraft', 'Overdraft', 'overdraft facility', 'bank overdraft'],
      explain:
        'An overdraft is flexible, short-term borrowing — interest is charged only on the overdrawn amount, and only while it is used. But the bank can withdraw the facility, and it is not meant for large, long-term spending like expansion: that is what loans are for.',
    },
    {
      id: 'p24n',
      type: 'numeric',
      topic: '2.4',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate Orchard & Oak’s gross profit margin for last year. Give your answer to 1 decimal place.',
      extract: {
        title: 'Orchard & Oak',
        text: 'Orchard & Oak runs three coffee shops in Bristol. Last year its revenue was £240,000. The cost of sales — coffee beans, food and other items sold — came to £150,000. The remaining money has to cover the cafés’ overheads: rent, staff wages, marketing and utilities.',
      },
      value: 37.5,
      tol: 0.25,
      unit: '%',
      dp: 1,
      explain:
        'Gross profit = revenue − cost of sales = £240,000 − £150,000 = £90,000. Gross profit margin = (£90,000 ÷ £240,000) × 100 = 37.5%. Every £1 of sales leaves about 37.5p to pay the overheads — whatever survives that is net profit.',
    },
    {
      id: 'p24o',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate the average rate of return (ARR) on the new workshop equipment, as a percentage. Give your answer as a whole number.',
      extract: {
        title: 'Sable & Stone',
        text: 'Sable & Stone is a silversmith workshop planning to buy new equipment costing £100,000. The owners expect the investment to generate total profit of £150,000 over its 5-year life. They will compare the ARR with the 4% return they could earn by leaving the money in the bank.',
      },
      value: 30,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'Average annual profit = £150,000 ÷ 5 years = £30,000. ARR = (£30,000 ÷ £100,000) × 100 = 30%. A 30% return comfortably beats the 4% the bank offers — but remember the £150,000 is only a forecast, and the money arrives over five years, not on day one.',
    },
    {
      id: 'p24p',
      type: 'truefalse',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'In a cash flow forecast, money received from a bank loan is recorded as a cash INFLOW.',
      answer: true,
      explain:
        'True. The loan brings cash INTO the business, so it is an inflow — even though it creates a debt. A cash flow forecast tracks the movement of cash, not profit, so financing counts; the loan repayments themselves will appear as outflows in later months.',
    },
  ],
};

export default def;

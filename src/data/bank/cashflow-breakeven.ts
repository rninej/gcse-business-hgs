// gcsebusiness question bank — Cash Flow & Break-even (Topic 1.3)
// Author: gcsebusiness content team. Real cases (Wilko, Card Factory, Butlin's,
// Go Ape) are verifiable; Oak & Ember and Clover & Cart have clean, consistent figures.

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'cashflow-breakeven',
  title: 'Cash Flow & Break-even',
  blurb:
    'Break-even, margin of safety and cash-flow forecasting with Wilko, Card Factory and Butlin’s — plus chart practice on a break-even diagram and a six-month cash flow forecast.',
  theme: 1,
  topics: ['1.3'],
  questions: [
    {
      id: 'cb1',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which lesson about cash flow does the fall of Wilko best illustrate?',
      extract: {
        title: 'Wilko — from high street giant to administration',
        text: 'Wilko was a family-owned homeware chain founded in Leicester in 1930. For more than 90 years it sold household goods from hundreds of stores, with sales of over £1 billion a year. But in August 2023 it collapsed into administration after running short of cash, and around 12,000 people lost their jobs.',
      },
      options: [
        'Even a long-established business with sales of over £1 billion can fail if it runs out of cash to pay its bills',
        'Cash flow only matters for businesses less than a year old',
        'Profit and cash are two words for exactly the same thing',
        'A business with hundreds of stores can never run out of cash',
      ],
      correct: 0,
      explain:
        'Wilko traded for over 90 years and had huge sales, yet it still collapsed when it could no longer pay its bills on time. Cash is not the same as profit — a business that cannot pay suppliers, wages and rent this month cannot keep trading, however big it is.',
    },
    {
      id: 'cb2',
      type: 'term',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for money coming INTO a business — for example from cash sales, loans received, or capital the owner pays in?',
      accept: ['cash inflow', 'a cash inflow', 'inflow', 'inflows', 'cash inflows'],
      explain:
        'A cash inflow is money entering the business: cash sales, a loan received, or capital paid in by the owner. Money leaving the business — wages, rent, supplier bills — consists of cash outflows, and inflows minus outflows give the net cash flow.',
    },
    {
      id: 'cb3',
      type: 'fib',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Contribution per unit = selling price per unit − ________ cost per unit. What one word completes the formula?',
      accept: ['variable', 'the variable', 'Variable', 'variable cost'],
      explain:
        'Contribution is what each unit contributes towards fixed costs: the selling price minus the variable cost per unit. Break-even output is then fixed costs ÷ contribution per unit — so a weak contribution pushes break-even output up.',
    },
    {
      id: 'cb4',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate Oak & Ember’s monthly break-even output in pizzas. Give your answer as a whole number of pizzas.',
      extract: {
        title: 'Oak & Ember — a wood-fired pizza van',
        text: 'Oak & Ember sells wood-fired pizzas from a converted van at markets and festivals. Each pizza sells for £6.00. The variable cost per pizza — dough, toppings, fuel and the box — is £3.50. Fixed costs (the van loan, insurance, market pitch fees and licences) come to £2,100 a month.',
      },
      value: 840,
      tol: 0.5,
      unit: 'pizzas',
      explain:
        'Contribution per pizza = £6.00 − £3.50 = £2.50. Break-even output = fixed costs ÷ contribution = £2,100 ÷ £2.50 = 840 pizzas a month. Every pizza beyond the 840th adds £2.50 of profit.',
    },
    {
      id: 'cb5',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study figures, calculate Oak & Ember’s monthly margin of safety in pizzas. Give your answer as a whole number of pizzas.',
      extract: {
        title: 'Oak & Ember — current sales',
        text: 'Each pizza sells for £6.00 and the variable cost per pizza is £3.50. Fixed costs are £2,100 a month, and Oak & Ember currently sells 1,150 pizzas a month. Remember: margin of safety = current output − break-even output.',
      },
      value: 310,
      tol: 0.5,
      unit: 'pizzas',
      explain:
        'Break-even output = £2,100 ÷ (£6.00 − £3.50) = 840 pizzas. Margin of safety = current output − break-even output = 1,150 − 840 = 310 pizzas. Sales could fall by 310 pizzas a month before Oak & Ember starts making a loss.',
    },
    {
      id: 'cb6',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'A business’s cash flow forecast predicts a negative closing balance in March. Which action is most sensible to take IN ADVANCE?',
      options: [
        'Ignore the forecast and hope March turns out better',
        'Arrange an overdraft facility with the bank to cover the shortfall',
        'Pay supplier bills even earlier than usual',
        'Take extra money out of the business for the owner’s own use',
      ],
      correct: 1,
      explain:
        'A forecast is an early-warning system: arranging an overdraft in advance covers the gap, with interest charged only on the amount used and only while it is used. Ignoring the warning risks unpaid bills, while paying out even more cash would make the shortage worse.',
    },
    {
      id: 'cb7',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate Clover & Cart’s CLOSING BALANCE at the end of March. Give your answer in pounds.',
      extract: {
        title: 'Clover & Cart — a flower stall',
        text: 'Clover & Cart runs a flower stall at a city-centre market. At the start of March the business had £850 in the bank (its opening balance). During March, cash inflows from market sales and a small wedding contract came to £6,400, while cash outflows — stock, pitch fees, van costs and wages — came to £7,150.',
      },
      value: 100,
      tol: 1,
      unit: '£',
      explain:
        'Net cash flow = inflows − outflows = £6,400 − £7,150 = −£750. Closing balance = opening balance + net cash flow = £850 − £750 = £100. The stall ends March with only £100 in the bank — a warning sign for April.',
    },
    {
      id: 'cb8',
      type: 'numeric',
      topic: '1.3',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study figures, calculate Oak & Ember’s total profit for a month in which it sells exactly 1,000 pizzas. Give your answer in pounds.',
      extract: {
        title: 'Oak & Ember — festival month',
        text: 'Each pizza sells for £6.00; the variable cost per pizza is £3.50; fixed costs are £2,100 a month. A big festival weekend means Oak & Ember expects to sell 1,000 pizzas during the month.',
      },
      value: 400,
      tol: 1,
      unit: '£',
      explain:
        'Contribution per pizza = £2.50, so total contribution = 1,000 × £2.50 = £2,500. Profit = total contribution − fixed costs = £2,500 − £2,100 = £400. Break-even is 840 pizzas, so each of the 160 extra pizzas added £2.50 straight to profit.',
    },
    {
      id: 'cb9',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 2,
      stem: 'The diagram shows a six-month cash flow forecast for Rise & Shine Ltd, in £000s. Using the diagram, calculate the NET CASH FLOW for May. Give your answer in £000s to 1 decimal place (an answer of 2 would mean £2,000).',
      diagram: 'cashflow',
      value: 0.5,
      tol: 0.05,
      dp: 1,
      explain:
        'Net cash flow = total inflows − total outflows. In May, inflows were £11.0k and outflows were £10.5k, so net cash flow = 11.0 − 10.5 = +0.5 (£000s) — £500 more flowed in than flowed out that month.',
    },
    {
      id: 'cb10',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'The diagram shows The Dough House’s monthly break-even chart. At any output to the LEFT of the break-even point, what does the vertical gap between the total costs line and the total revenue line represent?',
      diagram: 'breakeven',
      options: [
        'The profit made at that level of output',
        'The margin of safety, measured in loaves',
        'The loss made at that level of output',
        'The fixed costs of the business',
      ],
      correct: 2,
      explain:
        'To the left of break-even, the total costs line sits ABOVE the revenue line, so the business is making a loss — and the vertical gap between the lines measures exactly how big that loss is. To the right of the break-even point, the same gap measures profit instead.',
    },
    {
      id: 'cb11',
      type: 'term',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'What is the name of the month-by-month prediction of the cash a business expects to receive and pay out, used to spot shortages before they happen?',
      accept: [
        'cash flow forecast',
        'a cash flow forecast',
        'cashflow forecast',
        'cash-flow forecast',
        'cash flow prediction',
      ],
      explain:
        'A cash flow forecast sets out expected inflows and outflows month by month, with each month’s closing balance carried forward. It warns a business in advance when cash may run short, so it can arrange an overdraft or delay spending before trouble arrives.',
    },
    {
      id: 'cb12',
      type: 'truefalse',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Butlin’s runs seaside holiday resorts where bookings peak during the school holidays. For a seasonal business like this, a month-by-month cash flow forecast is especially useful.',
      answer: true,
      explain:
        'True. Seasonal businesses face lumpy income — cash pours in during the peak season, but wages, maintenance and bills must be paid all year round. A monthly forecast reveals the quiet months when cash runs short, so the business can plan ahead.',
    },
    {
      id: 'cb13',
      type: 'mcq',
      topic: '1.3',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, why does a strong December NOT remove Card Factory’s need for a cash flow forecast?',
      extract: {
        title: 'Card Factory — Christmas in July',
        text: 'Card Factory sells greetings cards and gifts through around 1,000 shops in the UK. Christmas is its biggest selling season by far — yet the cards, wrapping paper and gifts must be bought from suppliers months before December, with much of the stock arriving in shops during the summer.',
      },
      options: [
        'Christmas sales are automatically recorded as profit rather than cash',
        'Customers stop buying cards once the festive period begins',
        'Cash flow forecasts are only allowed to cover the month of December',
        'The business must pay for its Christmas stock months before customers buy it, so cash flows out long before it flows back in',
      ],
      correct: 3,
      explain:
        'Seasonal stock must be bought in advance, so cash leaves the business in summer and autumn while the inflows arrive concentrated in December. A cash flow forecast shows whether the business can bridge that gap — and how the January quiet spell will feel afterwards.',
    },
    {
      id: 'cb14',
      type: 'term',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'In a cash flow forecast, what is the name for the amount of cash the business has at the START of a month, carried forward from the previous month?',
      accept: ['opening balance', 'the opening balance', 'opening', 'opening cash balance'],
      explain:
        'The opening balance is the cash carried into the month — it equals the previous month’s closing balance. Opening balance + net cash flow = closing balance, and a forecast showing a negative closing balance is flashing a warning light.',
    },
    {
      id: 'cb15',
      type: 'truefalse',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'The larger a business’s margin of safety, the further sales can fall before the business starts making a loss.',
      answer: true,
      explain:
        'True. The margin of safety is the gap between current output and break-even output, so a bigger cushion means sales can fall further before losses begin. A small margin of safety means even a modest fall in demand could tip the business into loss.',
    },
    {
      id: 'cb16',
      type: 'fib',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'In a cash flow forecast, money leaving the business — wages, rent and payments to suppliers — is recorded as cash ________. What one word completes the sentence?',
      accept: ['outflows', 'outflow', 'the outflows', 'outgoings'],
      explain:
        'Cash outflows are the payments a business makes: wages, rent, bills and supplier invoices. Net cash flow = total inflows − total outflows, and it is outflows arriving before inflows that causes cash-flow trouble for so many businesses.',
    },
  ],
};
export default def;

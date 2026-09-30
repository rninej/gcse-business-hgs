// gcsebusiness question bank — PRACTICE pool, Topic 1.3 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-1-3',
  title: 'Costs, Cash & Break-even',
  blurb: 'Self-study practice on SMART objectives, profit, break-even and sources of finance, with case studies on LEGO and Monzo.',
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
      stem: 'Duke’s Dog Grooming is a new start-up. Which of the following objectives is SMART?',
      options: [
        'Increase weekly sales from £400 to £500 by the end of March',
        'Get lots more customers as soon as possible',
        'Become the country’s best-loved dog groomer',
        'Try really hard to sell more this year',
      ],
      correct: 0,
      explain:
        'SMART means Specific, Measurable, Achievable, Relevant and Time-bound. ‘From £400 to £500 by the end of March’ ticks all five letters; the others are wishes with no number, no deadline or no realistic focus.',
    },
    {
      id: 'p13b',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which statement best describes the difference between a business aim and a business objective?',
      options: [
        'Aims are set by employees, while customers set objectives',
        'There is no difference — the two words mean exactly the same thing',
        'An aim is a long-term goal; objectives are specific, measurable targets that show progress towards it',
        'An aim is always about profit, while an objective is always about survival',
      ],
      correct: 2,
      explain:
        'Aims are the long-term destinations — survival, growth, profit, market share. Objectives break each aim into SMART steps so the business can check whether it is on track, such as ‘reach £500 of weekly sales by the end of March’.',
    },
    {
      id: 'p13c',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, what was LEGO’s most likely MAIN aim in the early 2000s?',
      extract: {
        title: 'LEGO’s great escape',
        text: 'The LEGO Group, the Danish maker of the famous plastic building bricks, came close to bankruptcy in the early 2000s after years of losses. It sold off its theme parks, cut costs and focused again on the bricks themselves. By the mid-2000s the company was back in profit — and today LEGO is one of the world’s biggest toy firms.',
      },
      options: [
        'Paying large dividends to shareholders',
        'Survival — restructuring the business so it could keep trading',
        'Immediately becoming the world’s biggest toy company',
        'Opening as many new shops as possible',
      ],
      correct: 1,
      explain:
        'When a business is losing money and close to bankruptcy, survival comes first: cut costs, refocus on what you do best, keep trading. Growth, dividends and expansion only become priorities once survival is secure.',
    },
    {
      id: 'p13d',
      type: 'mcq',
      topic: '1.3',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which was an extra benefit of crowdfunding for Monzo, BEYOND raising the money itself?',
      extract: {
        title: 'Monzo — funded by the crowd',
        text: 'Monzo, now one of Britain’s best-known digital banks, started in 2015. Before it even had a banking licence it raised money through crowdfunding: thousands of small investors each put in as little as £10. Those early investors became some of the app’s most devoted users, spreading the word while the bank was still tiny.',
      },
      options: [
        'It guaranteed Monzo would never make a loss',
        'It removed the need to follow banking regulations',
        'It meant Monzo never needed any customers',
        'Thousands of small investors became loyal customers who promoted the app for free',
      ],
      correct: 3,
      explain:
        'Crowdfunding raised finance — and created a community. Early investors had a stake in Monzo’s success, so they used the app and told their friends: publicity no advertising budget could buy. No source of finance can guarantee profits or remove regulation, however.',
    },
    {
      id: 'p13e',
      type: 'mcq',
      topic: '1.3',
      difficulty: 3,
      marks: 1,
      stem: 'The diagram shows a break-even chart for a bakery. At any output to the RIGHT of the break-even point, what does the vertical gap between the revenue line and the total costs line represent?',
      diagram: 'breakeven',
      options: [
        'The fixed costs of the business',
        'The profit made at that level of output',
        'The margin of safety, measured in loaves',
        'The variable cost per loaf',
      ],
      correct: 1,
      explain:
        'Past break-even, revenue sits above total costs, and the vertical distance between the two lines is the profit at that output — it widens as output rises. The margin of safety is the horizontal distance along the output axis instead, and fixed costs are shown by the flat dashed line.',
    },
    {
      id: 'p13f',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'A self-employed kitchen fitter needs £9,000 of cabinets and worktops now, but her customer will not pay for the finished job for another six weeks. Which source of finance best fits this gap?',
      options: [
        'Trade credit — arranging with the supplier to pay for the materials in 60 days',
        'A 25-year mortgage on her workshop',
        'Selling shares in the business on the stock exchange',
        'Retained profit from previous years of trading',
      ],
      correct: 0,
      explain:
        'Trade credit means buying now and paying the supplier later — often after 30 or 60 days — which bridges exactly this kind of short gap, interest-free. A mortgage is for property over decades, a sole trader cannot float on the stock exchange, and a new business has no past profits to retain.',
    },
    {
      id: 'p13g',
      type: 'term',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for all the money a business receives from selling its products or services — price × quantity sold?',
      accept: ['revenue', 'sales revenue', 'turnover', 'total revenue', 'the revenue', 'revenues'],
      explain:
        'Revenue (turnover) is the money coming in from sales: price × quantity. It is not profit — the business still has to pay all its costs out of that revenue before anything is left over.',
    },
    {
      id: 'p13h',
      type: 'term',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for costs such as rent and insurance, which stay the same no matter how much the business produces?',
      accept: ['fixed costs', 'fixed cost', 'the fixed costs', 'overheads', 'indirect costs'],
      explain:
        'Fixed costs do not change with output: the rent is the same whether the bakery makes 100 loaves or 4,000. Variable costs — like flour and packaging — rise and fall with production instead.',
    },
    {
      id: 'p13i',
      type: 'term',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name for the level of output at which total revenue exactly equals total costs?',
      accept: ['break-even', 'break even', 'break-even point', 'break even point', 'the break-even point'],
      explain:
        'At break-even the business makes neither profit nor loss: every pound of revenue exactly covers its costs. It is calculated as fixed costs ÷ (price − variable cost per unit), and shown on a chart where the revenue and total-cost lines cross.',
    },
    {
      id: 'p13j',
      type: 'term',
      topic: '1.3',
      difficulty: 3,
      marks: 1,
      stem: 'What is the term for money raised by selling shares in a company to its owners?',
      accept: ['share capital', 'shareholders capital', 'equity', 'equity capital'],
      explain:
        'Share capital is finance raised by issuing shares: buyers become part-owners and share the profits, but — unlike a loan — the money does not have to be repaid. Only companies can raise it; a sole trader cannot sell shares.',
    },
    {
      id: 'p13k',
      type: 'fib',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Costs that rise and fall directly with output — such as ingredients and packaging — are called ________ costs. What one word completes the sentence?',
      accept: ['variable', 'direct', 'variable cost', 'variable costs'],
      explain:
        'Variable costs change with the number of units made: double the output and you double the ingredient bill. Total costs = fixed costs + variable costs, and it is variable cost per unit that feeds into the break-even formula.',
    },
    {
      id: 'p13l',
      type: 'fib',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'In a cash flow forecast, net cash flow = total inflows − total ________. What one word completes the formula?',
      accept: ['outflows', 'outflow', 'the outflows', 'out flows', 'outgoings'],
      explain:
        'Net cash flow = cash inflows (money coming in) − cash outflows (money going out). Add net cash flow to the opening balance and you get the closing balance — the cash the business expects to have left at month end.',
    },
    {
      id: 'p13m',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate Hattie’s PROFIT for the month. Give your answer in pounds.',
      extract: {
        title: 'Hattie’s Brownies',
        text: 'Hattie’s Brownies trades at weekend food markets. Each brownie sells for £2.50. Last month Hattie sold 900 brownies. Her total costs for the month — ingredients, pitch fees, packaging and fuel — came to £1,575.',
      },
      value: 675,
      tol: 1,
      unit: '£',
      explain:
        'Revenue = price × quantity = 900 × £2.50 = £2,250. Profit = total revenue − total costs = £2,250 − £1,575 = £675. Profit is what is left after every cost is paid — not the £2,250 of sales on its own.',
    },
    {
      id: 'p13n',
      type: 'numeric',
      topic: '1.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the number of tacos Theo must sell each month to break even. Give your answer as a whole number of tacos.',
      extract: {
        title: 'Theo’s Tacos',
        text: 'Theo’s Tacos is a street-food van. Fixed costs — pitch licence, insurance and the loan repayments on the van — come to £2,400 a month. Each taco sells for £4.00, and the variable cost per taco (tortilla, filling, salsa and packaging) is £2.50.',
      },
      value: 1600,
      tol: 0.5,
      unit: 'tacos',
      explain:
        'Contribution per taco = price − variable cost = £4.00 − £2.50 = £1.50. Break-even output = fixed costs ÷ contribution = £2,400 ÷ £1.50 = 1,600 tacos a month. Every taco beyond the 1,600th contributes £1.50 of profit.',
    },
    {
      id: 'p13o',
      type: 'truefalse',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'A bank overdraft is usually the most suitable source of finance for a start-up buying a delivery van that will last five years.',
      answer: false,
      explain:
        'False. Overdrafts are for small, short-term cash gaps — days or weeks — not for buying long-lived assets. A van should be funded by a bank loan spread over several years, or by leasing it, so the payments match the time the van earns money.',
    },
    {
      id: 'p13p',
      type: 'truefalse',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'A business can be making a profit on paper and still run out of cash.',
      answer: true,
      explain:
        'True. Profit is revenue minus costs over a period; cash is the money actually in the bank today. Buying stock and paying wages now while customers pay weeks later can leave a profitable business unable to pay its own bills — the classic cash-flow trap.',
    },
  ],
};
export default def;

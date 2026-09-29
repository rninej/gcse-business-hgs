// HGSBusiness question bank — Finance Case Studies (Topic 2.4)
// Author: HGS Business content team. Dough House figures match the project
// parameter sheet; Brookfield Bikes, Glow Candles and Vale Drinks have
// clean, internally consistent numbers.

import type { QuizDef } from '@/lib/bank';

const casesfinance: QuizDef = {
  id: 'casesfinance',
  title: 'Finance Case Studies',
  blurb:
    'Calculation case studies: gross and net margins, ROCE, break-even, margin of safety and percentage change — every answer with full working.',
  theme: 2,
  topics: ['2.4'],
  questions: [
    {
      id: 'cf1',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 2,
      stem: 'Calculate The Dough House’s NEW monthly break-even output after the rent rise. The price stays at £2.50 and the variable cost stays at £1.00 per loaf.',
      extract: {
        title: 'The Dough House — the rent goes up',
        text: 'The Dough House sells artisan loaves for £2.50 each. The variable cost per loaf is £1.00 and fixed costs are £4,500 per month, giving a break-even output of 3,000 loaves. The landlord has now announced a rent rise that will increase fixed costs by 10% to £4,950 per month.',
      },
      unit: 'loaves',
      value: 3300,
      tol: 0.5,
      explain:
        'Contribution = £2.50 − £1.00 = £1.50. New break-even = fixed costs ÷ contribution = £4,950 ÷ £1.50 = 3,300 loaves. Higher fixed costs push the break-even level up from 3,000 to 3,300 loaves.',
    },
    {
      id: 'cf2',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 2,
      stem: 'Calculate the new monthly break-even output if the price rises to £3.00.',
      extract: {
        title: 'The Dough House — a price rise',
        text: 'The Dough House sells artisan loaves for £2.50 each. The variable cost per loaf is £1.00 and fixed costs are £4,500 per month. The owners are considering raising the price of a loaf to £3.00; variable and fixed costs would not change.',
      },
      unit: 'loaves',
      value: 2250,
      tol: 0.5,
      explain:
        'New contribution = £3.00 − £1.00 = £2.00. New break-even = £4,500 ÷ £2.00 = 2,250 loaves. A higher price means each loaf contributes more towards fixed costs, so the break-even level falls from 3,000 to 2,250.',
    },
    {
      id: 'cf3',
      type: 'numeric',
      topic: '2.4',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study figures, calculate The Dough House’s total revenue per month AT the break-even output, in pounds.',
      extract: {
        title: 'The Dough House — monthly figures',
        text: 'The Dough House sells artisan loaves for £2.50 each. The variable cost per loaf is £1.00 and fixed costs are £4,500 per month.',
      },
      unit: '£',
      value: 7500,
      tol: 0.5,
      explain:
        'Break-even output = £4,500 ÷ (£2.50 − £1.00) = 3,000 loaves. Revenue at break-even = 3,000 × £2.50 = £7,500 — which exactly equals total costs (£4,500 + 3,000 × £1.00 = £7,500), as it must at break-even.',
    },
    {
      id: 'cf4',
      type: 'truefalse',
      topic: '2.4',
      difficulty: 3,
      marks: 1,
      stem: 'After the rent rise, The Dough House’s margin of safety will be smaller than before.',
      extract: {
        title: 'The Dough House — the rent goes up',
        text: 'The landlord’s rent rise will increase The Dough House’s fixed costs by 10%, from £4,500 to £4,950 per month. The selling price stays at £2.50 a loaf, the variable cost stays at £1.00, and the shop continues to sell 4,200 loaves a month.',
      },
      answer: true,
      explain:
        'True. Break-even rises to £4,950 ÷ £1.50 = 3,300 loaves, so the margin of safety falls from 4,200 − 3,000 = 1,200 loaves to 4,200 − 3,300 = 900 loaves. Higher fixed costs squeeze the margin of safety.',
    },
    {
      id: 'cf5',
      type: 'numeric',
      topic: '2.4',
      difficulty: 2,
      marks: 2,
      stem: 'Calculate Brookfield Bikes’ gross profit margin for last year. Give your answer to the nearest whole number.',
      extract: {
        title: 'Brookfield Bikes Ltd',
        text: 'Brookfield Bikes Ltd runs two bike shops. Last year its revenue was £120,000. The cost of the bikes and accessories it sold (cost of sales) was £72,000. Gross profit is revenue minus cost of sales.',
      },
      unit: '%',
      dp: 0,
      value: 40,
      tol: 0.5,
      explain:
        'Gross profit = revenue − cost of sales = £120,000 − £72,000 = £48,000. Gross profit margin = £48,000 ÷ £120,000 × 100 = 40%.',
    },
    {
      id: 'cf6',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 2,
      stem: 'Calculate Brookfield Bikes’ net profit margin for last year. Give your answer to the nearest whole number.',
      extract: {
        title: 'Brookfield Bikes Ltd — key figures',
        text: 'Last year Brookfield Bikes Ltd had revenue of £120,000 and cost of sales of £72,000. It then paid operating expenses — rent, wages and insurance — of £30,000. Net (operating) profit is what remains after all of these costs.',
      },
      unit: '%',
      dp: 0,
      value: 15,
      tol: 0.5,
      explain:
        'Net profit = revenue − cost of sales − operating expenses = £120,000 − £72,000 − £30,000 = £18,000. Net profit margin = £18,000 ÷ £120,000 × 100 = 15%.',
    },
    {
      id: 'cf7',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study figures, calculate Brookfield Bikes’ ROCE for last year. Give your answer to the nearest whole number.',
      extract: {
        title: 'Brookfield Bikes Ltd — key figures',
        text: 'Brookfield Bikes Ltd — results for last year: revenue £120,000; cost of sales £72,000; operating expenses £30,000; operating profit £18,000. The money invested in the business (capital employed) is £150,000.',
      },
      unit: '%',
      dp: 0,
      value: 12,
      tol: 0.5,
      explain:
        'ROCE = operating profit ÷ capital employed × 100 = £18,000 ÷ £150,000 × 100 = 12%. Every £100 invested in the business generated £12 of operating profit.',
    },
    {
      id: 'cf8',
      type: 'mcq',
      topic: '2.4',
      difficulty: 3,
      marks: 1,
      stem: 'Which statement best explains the fall in ROCE from 15% to 12%?',
      extract: {
        title: 'Vale Drinks Ltd — ROCE falls',
        text: 'Vale Drinks Ltd made an operating profit of £240,000 last year on capital employed of £1.6m, giving a ROCE of 15%. This year operating profit was again £240,000, but the company borrowed to buy new bottling equipment, so capital employed rose to £2m and ROCE fell to 12%.',
      },
      options: [
        'Operating profit fell from £240,000 to £200,000',
        'Capital employed fell from £2m to £1.6m',
        'The same operating profit is being earned from a larger amount of capital employed, so the money in the business is working less hard',
        'The directors paid out too much of the profit in dividends',
      ],
      correct: 2,
      explain:
        'ROCE divides operating profit by capital employed. Profit stayed at £240,000 while capital employed rose from £1.6m to £2m (£240,000 ÷ £2m = 12%), so the money invested is now generating a lower return.',
    },
    {
      id: 'cf9',
      type: 'numeric',
      topic: '2.4',
      difficulty: 1,
      marks: 1,
      stem: 'Calculate the contribution per candle, in pounds.',
      extract: {
        title: 'Glow Candles',
        text: 'Glow Candles makes scented candles in a small workshop. Each candle sells for £12. The variable cost of the wax, wick, fragrance and jar is £4 per candle, and the workshop’s fixed costs are £1,600 a month. Glow Candles currently sells 350 candles a month.',
      },
      unit: '£',
      value: 8,
      tol: 0.05,
      explain:
        'Contribution per candle = selling price − variable cost per candle = £12 − £4 = £8. Each candle contributes £8 towards paying the fixed costs — and then towards profit.',
    },
    {
      id: 'cf10',
      type: 'numeric',
      topic: '2.4',
      difficulty: 2,
      marks: 2,
      stem: 'Calculate Glow Candles’ monthly break-even output.',
      extract: {
        title: 'Glow Candles',
        text: 'Glow Candles makes scented candles in a small workshop. Each candle sells for £12 and the variable cost per candle is £4. The workshop’s fixed costs are £1,600 a month.',
      },
      unit: 'units',
      value: 200,
      tol: 0.5,
      explain:
        'Contribution per candle = £12 − £4 = £8. Break-even output = fixed costs ÷ contribution = £1,600 ÷ £8 = 200 candles a month.',
    },
    {
      id: 'cf11',
      type: 'numeric',
      topic: '2.4',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study figures, calculate Glow Candles’ monthly margin of safety in candles.',
      extract: {
        title: 'Glow Candles — reminder',
        text: 'Each candle sells for £12 with a variable cost of £4, and fixed costs are £1,600 a month. Glow Candles currently sells 350 candles a month and breaks even at 200.',
      },
      unit: 'units',
      value: 150,
      tol: 0.5,
      explain:
        'Margin of safety = current output − break-even output = 350 − 200 = 150 candles. Sales could fall by 150 candles a month before Glow Candles starts making a loss.',
    },
    {
      id: 'cf12',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 3,
      stem: 'Calculate how many candles Glow Candles must sell each month to earn a profit of exactly £2,000.',
      extract: {
        title: 'Glow Candles — a profit target',
        text: 'Glow Candles’ owner wants the business to earn a profit of exactly £2,000 a month. Reminder: each candle sells for £12, the variable cost per candle is £4, and fixed costs are £1,600 a month.',
      },
      unit: 'units',
      value: 450,
      tol: 0.5,
      explain:
        'Sales must first cover the £1,600 fixed costs and then leave £2,000 profit — £3,600 in total. Candles needed = £3,600 ÷ contribution of £8 = 450 candles a month (100 more than the current 350).',
    },
    {
      id: 'cf13',
      type: 'fib',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'Break-even output = fixed costs ÷ ________ per unit. What one word completes this formula?',
      extract: {
        title: 'Glow Candles — the planning sheet',
        text: 'Glow Candles is preparing a simple planning sheet for the bank. At the top, the owner writes the break-even formula she will use: break-even output = fixed costs ÷ ________ per unit.',
      },
      accept: ['contribution', 'contribution per unit', 'the contribution'],
      explain:
        'Break-even output = fixed costs ÷ contribution per unit, where contribution = selling price − variable cost per unit. For Glow Candles: £1,600 ÷ (£12 − £4) = 200 candles.',
    },
    {
      id: 'cf14',
      type: 'mcq',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'Which statement best explains the gap between the two margins?',
      extract: {
        title: 'Brookfield Bikes — two margins',
        text: 'Brookfield Bikes’ results for last year: revenue £120,000; cost of sales £72,000; operating expenses £30,000. Its gross profit margin works out at 40%, but its net profit margin is only 15%.',
      },
      options: [
        'The business must have paid £30,000 in income tax before calculating net profit',
        'After paying for the bikes themselves, a further £30,000 of operating expenses such as rent, wages and insurance had to be deducted',
        'Gross profit margin is always smaller than net profit margin',
        'Cost of sales was counted twice by mistake',
      ],
      correct: 1,
      explain:
        'Gross profit (40% of revenue) has the £30,000 of operating expenses deducted from it before net profit: £48,000 − £30,000 = £18,000, which is only 15% of revenue. Tax is charged after net profit, and gross margin can never be smaller than net margin.',
    },
  ],
};

export default casesfinance;

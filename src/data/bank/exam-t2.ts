// Learn Business question bank — Theme 2 Exam Practice (Topics 2.1–2.5)
// Author: Learn Business content team. Real takeover facts are verifiable;
// Dough House figures match the project parameter sheet (price £2.50,
// variable cost £1.00, fixed costs £4,500/month, output 4,200 loaves).

import type { QuizDef } from '@/lib/bank';

const examt2: QuizDef = {
  id: 'examt2',
  title: 'Theme 2 Exam Practice',
  blurb:
    'Exam-style questions across all five Theme 2 topics: real takeovers, the marketing mix, operations, financial calculations and HR — with case studies throughout.',
  theme: 2,
  topics: ['2.1', '2.2', '2.3', '2.4', '2.5'],
  questions: [
    {
      id: 'y1',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which advantage of inorganic (external) growth does the McColl’s takeover best illustrate?',
      extract: {
        title: 'Morrisons buys McColl’s',
        text: 'In 2022 Morrisons bought the convenience store chain McColl’s out of administration for £190m. The deal gave Morrisons a ready-made chain of convenience shops selling Morrisons groceries — something it would have taken years to build from scratch.',
      },
      options: [
        'Guaranteed profit — any business bought out of administration always succeeds',
        'Speed — Morrisons gained an established chain of shops straight away instead of opening them one by one',
        'Zero cost — Morrisons paid nothing at all for McColl’s',
        'Low risk — buying a struggling chain never creates problems for the buyer',
      ],
      correct: 1,
      explain:
        'Takeovers deliver instant growth: the shops, staff and customers are already there on day one, whereas organic growth (opening shops one by one) is slow. The other options are wrong — Morrisons paid £190m, and buying a struggling chain carries real risk.',
    },
    {
      id: 'y2',
      type: 'term',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for a takeover made against the wishes of the target company’s board of directors?',
      extract: {
        title: 'Kraft takes over Cadbury',
        text: 'In 2010 the food giant Kraft took over Cadbury in a deal worth around £11.5bn. Cadbury’s board rejected Kraft’s early offers and urged shareholders to refuse, until a higher final bid won the board’s recommendation.',
      },
      accept: ['hostile takeover', 'hostile bid', 'hostile', 'hostile take-over', 'a hostile takeover'],
      explain:
        'A hostile takeover is one the target company’s board tries to resist — as Cadbury’s board did before finally accepting Kraft’s higher offer.',
    },
    {
      id: 'y3',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Facebook and Instagram both made social media apps for similar users. What type of integration was Facebook’s takeover of Instagram?',
      extract: {
        title: 'Facebook buys Instagram',
        text: 'In 2012 Facebook bought Instagram, a fast-growing photo-sharing app, for about $1bn. Both businesses made social media apps used by millions of people.',
      },
      options: [
        'Backward vertical integration — buying a supplier of raw materials',
        'Forward vertical integration — buying a distributor or retailer',
        'Horizontal integration — combining two businesses at the same stage of the same industry',
        'Diversification — moving into a completely unrelated industry',
      ],
      correct: 2,
      explain:
        'Both firms operated at the same stage of the same industry (social media apps), so combining them is horizontal integration. Vertical integration would mean buying a supplier or distributor, which did not happen here.',
    },
    {
      id: 'y4',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which type of economy of scale is Rise & Shine benefiting from when it buys beans in bulk?',
      extract: {
        title: 'Rise & Shine — bulk buying',
        text: 'Rise & Shine Ltd has grown from one market stall into six cafés and a small roastery. The buying manager now orders coffee beans for all six cafés in a single bulk order and pays less per kilogram than when the company ran a single stall.',
      },
      diagram: 'economies',
      options: [
        'Purchasing economy — a bulk discount for ordering materials in large quantities',
        'Technical economy — using larger, more efficient machines',
        'Managerial economy — hiring specialist managers',
        'Financial economy — borrowing money at a lower interest rate',
      ],
      correct: 0,
      explain:
        'A purchasing economy of scale is the bulk-buying discount a large order wins from a supplier. Because Rise & Shine now orders for six cafés at once, its cost per kilogram of beans falls.',
    },
    {
      id: 'y5',
      type: 'mcq',
      topic: '2.1',
      difficulty: 3,
      marks: 1,
      stem: 'The £15bn investment programme is best described as which type of growth for JLR?',
      extract: {
        title: 'Jaguar Land Rover invests in electric vehicles',
        text: 'Jaguar Land Rover (JLR) has been owned by India’s Tata Motors since 2008. In 2023 JLR announced plans to invest £15bn in electric vehicles over the following five years, upgrading its own factories and developing new electric models.',
      },
      options: [
        'Inorganic growth — JLR is buying another carmaker',
        'A merger — JLR is combining with Tata Motors as equals',
        'Backward vertical integration — JLR is buying a supplier',
        'Organic (internal) growth — JLR is investing in its own factories, technology and models',
      ],
      correct: 3,
      explain:
        'Investing in your own factories, technology and products is organic (internal) growth — no other business is bought or combined. The size of the sum does not change the type of growth.',
    },
    {
      id: 'y6',
      type: 'fib',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'The cans are in the ________ stage of the product life cycle. What one word completes this sentence?',
      extract: {
        title: 'Rise & Shine — cold brew cans',
        text: 'Two years ago Rise & Shine launched a range of ready-to-drink cold brew cans. Sales have risen quickly every quarter since launch, and rival brands have now started launching their own canned coffees.',
      },
      accept: ['growth', 'the growth stage', 'growth stage'],
      explain:
        'Rising sales quarter after quarter, with profits improving and competitors piling in, is the growth stage — after introduction and before maturity.',
    },
    {
      id: 'y7',
      type: 'mcq',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'Which pricing strategy did Rise & Shine use when it launched the cans at 99p?',
      extract: {
        title: 'Rise & Shine — cold brew cans',
        text: 'The cans launched at 99p — well below the £1.50 charged by established brands — to persuade shoppers to try them. Rise & Shine plans to raise the price once the range is established and it has won a loyal following.',
      },
      options: [
        'Price skimming — a high launch price that falls over time',
        'Penetration pricing — a low launch price to win market share, raised later',
        'Cost-plus pricing — adding a fixed markup to the unit cost',
        'Dynamic pricing — prices that change with demand',
      ],
      correct: 1,
      explain:
        'A deliberately low launch price to break into a market, followed by higher prices once customers are won, is penetration pricing. Skimming is the opposite: starting high and falling later.',
    },
    {
      id: 'y8',
      type: 'term',
      topic: '2.2',
      difficulty: 1,
      marks: 1,
      stem: 'Read the case study. Rise & Shine’s plan covers the recipe, the 99p launch price, the social campaign and the shops that will stock the cans. What is the collective name for these four elements?',
      extract: {
        title: 'Rise & Shine — planning the cans',
        text: 'Rise & Shine decides every detail of the cold brew cans: the recipe and packaging (what the product is), the 99p launch price, the social media campaign that promotes it, and the shops and website that sell it.',
      },
      accept: ['marketing mix', 'the marketing mix', '4ps', '4 ps', 'the 4ps'],
      explain:
        'The marketing mix is the combination of the 4Ps — product, price, promotion and place. The elements must work together for the target market: a premium product needs a premium price, quality promotion and upmarket outlets.',
    },
    {
      id: 'y9',
      type: 'term',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of this approach to managing stock, in which materials arrive exactly when they are needed and almost nothing is stored?',
      extract: {
        title: 'Rise & Shine — fresh milk',
        text: 'Rise & Shine’s cafés take delivery of fresh milk six mornings a week. The company keeps almost no milk in storage: each delivery is used within a day, freeing up space and cutting waste.',
      },
      accept: ['just in time', 'just-in-time', 'jit'],
      explain:
        'Just-in-time (JIT) stock control keeps stock levels close to zero by having materials arrive exactly when needed. It cuts storage costs and waste — but a single late delivery can stop sales.',
    },
    {
      id: 'y10',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which approach to managing quality is this?',
      extract: {
        title: 'The Dough House — checking the loaves',
        text: 'At The Dough House, the head baker inspects every finished loaf just before it goes on sale. Loaves that fail the check are sold at a discount at the end of the day.',
      },
      diagram: 'qcflow',
      options: [
        'Quality assurance — checking quality at every stage of production',
        'Total Quality Management — making every employee responsible for quality',
        'Quality control — inspecting finished products at the end of the process',
        'Kaizen — continuous improvement in small steps',
      ],
      correct: 2,
      explain:
        'Inspecting finished products at the end is quality control. The weakness is that faults are found late, after the money has been spent making the loaf — quality assurance checks at every stage instead.',
    },
    {
      id: 'y11',
      type: 'numeric',
      topic: '2.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the figures in the case study, calculate the productivity of the baking team in loaves per baker per month.',
      extract: {
        title: 'The Dough House — productivity',
        text: 'The Dough House employs six bakers in its Southampton shop. Between them they bake and sell 4,200 loaves a month. The owner wants to measure productivity before and after a new oven is installed.',
      },
      unit: 'loaves',
      value: 700,
      tol: 0.5,
      explain:
        'Productivity = output ÷ number of employees = 4,200 ÷ 6 = 700 loaves per baker per month. Raising productivity means making more output from the same number of staff.',
    },
    {
      id: 'y12',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 3,
      stem: 'Using the case study figures, calculate The Dough House’s net profit margin for a typical month. Give your answer to 1 decimal place.',
      extract: {
        title: 'The Dough House — monthly figures',
        text: 'The Dough House sells artisan loaves for £2.50 each. The variable cost per loaf is £1.00 and fixed costs (rent, the head baker’s salary, equipment leases) are £4,500 per month. In a typical month the shop sells 4,200 loaves. Net profit is what remains after variable costs AND fixed costs are paid.',
      },
      unit: '%',
      dp: 1,
      value: 17.1,
      tol: 0.06,
      explain:
        'Revenue = 4,200 × £2.50 = £10,500; total costs = (4,200 × £1.00) + £4,500 = £8,700; net profit = £10,500 − £8,700 = £1,800. Net profit margin = £1,800 ÷ £10,500 × 100 = 17.1% (1 d.p.).',
    },
    {
      id: 'y13',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study figures, calculate Fernfield Foods’ ROCE for last year. Give your answer to the nearest whole number.',
      extract: {
        title: 'Fernfield Foods Ltd — results',
        text: 'Fernfield Foods Ltd makes jams and pickles at a small factory. Last year it made an operating profit of £96,000. The long-term money invested in the business (capital employed) was £600,000.',
      },
      unit: '%',
      dp: 0,
      value: 16,
      tol: 0.5,
      explain:
        'ROCE = operating profit ÷ capital employed × 100 = £96,000 ÷ £600,000 × 100 = 16%. ROCE shows how hard the money invested in the business is working.',
    },
    {
      id: 'y14',
      type: 'numeric',
      topic: '2.4',
      difficulty: 3,
      marks: 2,
      stem: 'The chart shows break-even at 3,000 loaves and current output of 4,200 loaves a month. Calculate the margin of safety as a percentage of current output. Give your answer to 1 decimal place.',
      extract: {
        title: 'The Dough House — break-even chart',
        text: 'The chart shows The Dough House’s monthly break-even position. The shop breaks even at 3,000 loaves a month and currently sells 4,200 loaves a month.',
      },
      diagram: 'breakeven',
      unit: '%',
      dp: 1,
      value: 28.6,
      tol: 0.06,
      explain:
        'Margin of safety = current output − break-even output = 4,200 − 3,000 = 1,200 loaves. As a percentage of current output: 1,200 ÷ 4,200 × 100 = 28.6% (1 d.p.) — sales could fall by more than a quarter before losses begin.',
    },
    {
      id: 'y15',
      type: 'truefalse',
      topic: '2.4',
      difficulty: 2,
      marks: 1,
      stem: 'A business can make a profit and still run out of cash.',
      extract: {
        title: 'Rise & Shine — a profitable year, a tight month',
        text: 'Rise & Shine Ltd made a profit last year, but in January it had to arrange an overdraft. A big wholesale customer had paid its invoice late, while wages, rent and supplier bills still had to be paid on time.',
      },
      answer: true,
      explain:
        'True. Profit is revenue minus costs over a period, but cash is the money actually available now. Late-paying customers or money tied up in stock can leave a profitable business unable to pay this month’s bills — which is why cash flow forecasts matter.',
    },
    {
      id: 'y16',
      type: 'mcq',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'According to the organisation chart, to whom does the Production Manager report?',
      extract: {
        title: 'Fernfield Foods Ltd — structure',
        text: 'Fernfield Foods Ltd organises its staff into functions such as operations, marketing and finance. The chart shows who reports to whom.',
      },
      diagram: 'orgchart',
      options: [
        'The Managing Director',
        'The Marketing Director',
        'The Quality Manager',
        'The Operations Director',
      ],
      correct: 3,
      explain:
        'The chart connects the Production Manager to the Operations Director, alongside the Quality Manager, who reports to the same director. The Managing Director sits above the three directors, and the Quality Manager is a colleague, not a boss.',
    },
    {
      id: 'y17',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the number of employees one manager is directly responsible for?',
      extract: {
        title: 'Fernfield Foods Ltd — the top job',
        text: 'Fernfield Foods’ Managing Director directly manages three people: the Operations Director, the Marketing Director and the Finance Director. Below them, most managers supervise only one or two staff each.',
      },
      accept: ['span of control', 'the span of control', 'span'],
      explain:
        'The span of control is the number of subordinates one manager directly supervises. Tall structures like Fernfield’s have narrow spans of control, which means close supervision but slower communication.',
    },
    {
      id: 'y18',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Which ONE of the four ideas is a non-financial method of motivation?',
      extract: {
        title: 'Fernfield Foods — cutting absenteeism',
        text: 'Fernfield Foods wants to cut absenteeism on its production line. Managers are considering four ideas: a small pay rise, a bonus for good attendance, piece rates (pay per jar produced), and rotating staff between different tasks each week.',
      },
      options: [
        'The pay rise',
        'The attendance bonus',
        'Job rotation — swapping between tasks for variety',
        'Piece rates — pay per jar produced',
      ],
      correct: 2,
      explain:
        'Job rotation adds variety and interest without changing pay, so it is non-financial. The pay rise, bonus and piece rates all reward staff with money, making them financial methods.',
    },
  ],
};

export default examt2;

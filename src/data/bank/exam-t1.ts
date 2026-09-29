// Learn Business question bank — Theme 1 Exam Practice (Topics 1.1–1.5)
// Author: Learn Business content team. Fictional start-ups (Crumb & Craft,
// Style on Wheels, Rise & Shine) have clean, internally consistent figures.

import type { QuizDef } from '@/lib/bank';

const examt1: QuizDef = {
  id: 'examt1',
  title: 'Theme 1 Exam Practice',
  blurb:
    'Exam-style questions across all five Theme 1 topics, built around realistic UK start-ups: a bakery, a mobile hairdresser and a market-stall coffee brand.',
  theme: 1,
  topics: ['1.1', '1.2', '1.3', '1.4', '1.5'],
  questions: [
    {
      id: 'x1',
      type: 'mcq',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following is a risk Nadia has taken by starting her own business?',
      extract: {
        title: 'Crumb & Craft',
        text: 'Crumb & Craft is a new craft bakery in Hertford. Its founder, Nadia, left a secure £28,000-a-year job at a bank to open it, investing £9,000 of her own savings. The bakery’s hand-made sourdough loaves sell for £3.20 each.',
      },
      options: [
        'The bakery is certain to fail in its first year',
        'She is guaranteed a steady wage from the bakery from the first month',
        'She could lose her £9,000 savings and her secure salary if the bakery fails',
        'She no longer has to make any business decisions herself',
      ],
      correct: 2,
      explain:
        'Entrepreneurs risk their own money and give up secure wages; nothing is guaranteed, and if the business fails she can lose both. The other options describe certainty — the opposite of risk.',
    },
    {
      id: 'x2',
      type: 'numeric',
      topic: '1.1',
      difficulty: 2,
      marks: 2,
      stem: 'Using the figures in the case study, calculate the value added to each loaf, in pounds.',
      extract: {
        title: 'Crumb & Craft — the loaf',
        text: 'A Crumb & Craft sourdough loaf sells for £3.20. The flour, yeast and salt used to make one loaf cost Nadia £1.20. Value added is the difference between the selling price and the cost of the bought-in materials.',
      },
      unit: '£',
      value: 2,
      tol: 0.05,
      explain:
        'Value added = selling price − cost of bought-in materials = £3.20 − £1.20 = £2.00. Nadia adds £2.00 of value to the raw ingredients through her baking skill, branding and service.',
    },
    {
      id: 'x3',
      type: 'term',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for a person who takes a financial risk by setting up and running their own business?',
      extract: {
        title: 'Crumb & Craft',
        text: 'Nadia had no business experience, but she spotted that no bakery in her town sold hand-made sourdough, and she was determined to fill the gap herself.',
      },
      accept: ['entrepreneur', 'an entrepreneur', 'entrepreneurs'],
      explain:
        'An entrepreneur is someone who takes a financial risk by setting up a business, in the hope of rewards such as profit and independence.',
    },
    {
      id: 'x4',
      type: 'mcq',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the chart, what is the combined market share of the four largest supermarket chains — Tesco, Sainsbury’s, Asda and Aldi?',
      extract: {
        title: 'The UK grocery market',
        text: 'The UK grocery market is an oligopoly: a few very large chains dominate it, which makes it very hard for new rivals to enter. The chart shows illustrative shares of this market. A start-up planning to open a village shop must work out how it can survive alongside these giants.',
      },
      diagram: 'marketshare',
      options: ['28%', '54%', '64%', '72%'],
      correct: 2,
      explain:
        'Tesco 25% + Sainsbury’s 15% + Asda 14% + Aldi 10% = 64%. The four largest chains together control almost two-thirds of the market. (The three largest alone give 54%; adding Lidl as well would give 72%.)',
    },
    {
      id: 'x5',
      type: 'term',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'What type of market research is Priya carrying out when she collects answers from her own questionnaire?',
      extract: {
        title: 'Style on Wheels',
        text: 'Before adding new treatments to her price list, Priya asked 60 of her regular clients to complete a short questionnaire about which treatments they would like. She also read a free government report on the hairdressing industry.',
      },
      accept: ['primary research', 'primary', 'field research', 'fieldwork'],
      explain:
        'Primary (field) research gathers new, first-hand data for the specific purpose — here, Priya’s own questionnaire. The government report is secondary research: data that already existed, collected by someone else.',
    },
    {
      id: 'x6',
      type: 'fib',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A market map helped the founders spot a ________ in the market. What one word completes this sentence?',
      extract: {
        title: 'Rise & Shine — finding the gap',
        text: 'Before launching, the founders of Rise & Shine drew a market map of the coffee market, plotting brands by price and by ethical sourcing. Most ethical brands were expensive, and most cheap coffees made no ethical claims. The map showed an empty space for affordable, ethically sourced coffee.',
      },
      accept: ['gap', 'gaps', 'niche'],
      explain:
        'A market map plots businesses on two axes (here price and ethical sourcing) and reveals where the market is crowded and where the gaps are — spaces no business is yet filling.',
    },
    {
      id: 'x7',
      type: 'mcq',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'Which customer need does the mobile hairdressing service mainly satisfy?',
      extract: {
        title: 'Style on Wheels',
        text: 'Priya’s mobile hairdressing service, Style on Wheels, visits clients in their own homes, including evenings and weekends. Her prices are similar to those of other local hairdressers. Clients book through a simple online form.',
      },
      options: [
        'Price — it is by far the cheapest hairdresser in the area',
        'Convenience — the salon comes to the customer at a time that suits them',
        'Choice — clients can have any treatment free of charge',
        'Quality — home visits always give a better haircut',
      ],
      correct: 1,
      explain:
        'Convenience means making it easy for the customer. Coming to their home at a time that suits them — including evenings and weekends — is mainly about convenience. The extract says her prices are similar to rivals, so price is not the answer.',
    },
    {
      id: 'x8',
      type: 'numeric',
      topic: '1.3',
      difficulty: 3,
      marks: 2,
      stem: 'Using the figures in the case study, calculate the profit made by the market stall in its first month, in pounds.',
      extract: {
        title: 'Rise & Shine — the first month',
        text: 'Rise & Shine began as a single market stall selling fresh coffee. In its first month the stall sold 600 cups at £2.50 each. The total costs for the month — pitch fees, milk, beans, cups and wages — came to £1,050.',
      },
      unit: '£',
      value: 450,
      tol: 0.5,
      explain:
        'Revenue = price × quantity = 600 × £2.50 = £1,500. Profit = total revenue − total costs = £1,500 − £1,050 = £450.',
    },
    {
      id: 'x9',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'In which month does the forecast show a negative net cash flow — outflows greater than inflows?',
      extract: {
        title: 'Rise & Shine Ltd — cash flow',
        text: 'Rise & Shine Ltd began as a single market stall and now supplies coffee to cafés and offices as well as selling at markets. Careful cash management has been central to its survival. The chart shows the company’s cash flow forecast for six months, January to June, in £000s (thousands of pounds).',
      },
      diagram: 'cashflow',
      options: ['January', 'February', 'April', 'June'],
      correct: 0,
      explain:
        'Net cash flow = inflows − outflows. In January inflows were £9,000 but outflows were £10,500, giving a net cash flow of −£1,500 — the only month in the forecast where more cash left the business than arrived.',
    },
    {
      id: 'x10',
      type: 'mcq',
      topic: '1.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which source of finance is designed to cover a small, short-term cash gap like this?',
      extract: {
        title: 'Style on Wheels — a cash gap',
        text: 'In February, £400 of supplier bills fall due a few weeks before several large wedding-party bookings are due to pay. Priya needs to bridge the gap for a short time.',
      },
      options: [
        'A mortgage on her home',
        'A five-year bank loan',
        'Selling shares on the stock exchange',
        'A bank overdraft',
      ],
      correct: 3,
      explain:
        'An overdraft lets a business spend slightly more than is in its account for a short period — ideal for small, temporary gaps. Long-term loans and mortgages are for big purchases over years, and a sole trader cannot sell shares on the stock exchange.',
    },
    {
      id: 'x11',
      type: 'mcq',
      topic: '1.3',
      difficulty: 1,
      marks: 1,
      stem: 'Which aim is MOST likely to be Crumb & Craft’s main aim at this stage?',
      extract: {
        title: 'Crumb & Craft — three months in',
        text: 'Three months after opening, Crumb & Craft’s sales are growing slowly. The bakery is only just covering its costs each month, and Nadia still has £5,500 of her savings left.',
      },
      options: [
        'Paying dividends to thousands of shareholders',
        'Survival — covering its costs and keeping the business trading',
        'Growing into a multinational chain within a year',
        'Charging the highest bread prices in the country',
      ],
      correct: 1,
      explain:
        'For most new businesses the first aim is survival — reaching the point where revenue reliably covers costs. Growth and dividends come later, once the business is secure.',
    },
    {
      id: 'x12',
      type: 'mcq',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'As a sole trader, what does unlimited liability mean for Priya if the business cannot pay its debts?',
      extract: {
        title: 'Style on Wheels — a difficult winter',
        text: 'Priya runs Style on Wheels as a sole trader. After a quiet winter the business owes suppliers £3,000. Priya also has £5,000 in a personal savings account.',
      },
      options: [
        'She can only lose the money she spent buying the van',
        'The suppliers must simply write off the debt',
        'She is personally responsible — she could have to use her own savings and assets to pay the £3,000',
        'The government will pay the £3,000 on her behalf',
      ],
      correct: 2,
      explain:
        'Sole traders have unlimited liability: there is no legal separation between the business and its owner, so personal savings and assets are at risk if the business cannot pay what it owes.',
    },
    {
      id: 'x13',
      type: 'fib',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'This document is called a business ________. What one word completes this sentence?',
      extract: {
        title: 'Crumb & Craft — the bank meeting',
        text: 'Before asking the bank for a loan, Nadia wrote a document describing her business idea, the target market, her marketing plan, her predicted costs and revenues, and a month-by-month cash flow forecast.',
      },
      accept: ['plan', 'plans'],
      explain:
        'A business plan sets out the idea, target market, marketing plan, costs, revenues and cash flow forecast. It persuades lenders and investors, and helps the owner spot problems before they happen.',
    },
    {
      id: 'x14',
      type: 'mcq',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'Which factor was most important in the founders’ choice of market pitch?',
      extract: {
        title: 'Rise & Shine — choosing a pitch',
        text: 'When Rise & Shine chose its first pitch, the founders compared two options: the town square, which costs £60 for a Saturday and attracts hundreds of shoppers, and a quiet industrial estate, which costs £15 but sees few visitors at weekends. They chose the town square.',
      },
      options: [
        'The lowest possible pitch fee',
        'Footfall — the number of potential customers walking past',
        'Being close to the coffee bean roastery',
        'Free parking for staff',
      ],
      correct: 1,
      explain:
        'For a retail or food stall, footfall is usually the key location factor: hundreds of passing shoppers mean hundreds of potential customers. The cheaper pitch would have saved £45 a day but brought very few customers.',
    },
    {
      id: 'x15',
      type: 'term',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'What is the collective term for all the individuals and groups that have an interest in a business?',
      extract: {
        title: 'Rise & Shine — who is affected?',
        text: 'Rise & Shine now affects many groups: its owners, its staff, its customers, the market operator that rents it a pitch, the suppliers of beans and milk, and the town council that licenses the market.',
      },
      accept: ['stakeholders', 'stakeholder', 'stake holders'],
      explain:
        'Stakeholders are any individuals or groups affected by, or with an interest in, the business — owners, employees, customers, suppliers, lenders, the local community and government.',
    },
    {
      id: 'x16',
      type: 'numeric',
      topic: '1.5',
      difficulty: 2,
      marks: 2,
      stem: 'Calculate the percentage increase in the price of coffee beans. Give your answer to the nearest whole number.',
      extract: {
        title: 'Rising bean prices',
        text: 'Poor harvests and rising shipping costs have pushed up the world price of coffee beans. Last year Rise & Shine paid £8.00 per kilogram for its beans. This year it expects to pay £10.00 per kilogram.',
      },
      unit: '%',
      dp: 0,
      value: 25,
      tol: 0.5,
      explain:
        'Percentage change = (new − original) ÷ original × 100 = (£10.00 − £8.00) ÷ £8.00 × 100 = £2.00 ÷ £8.00 × 100 = 25%.',
    },
    {
      id: 'x17',
      type: 'mcq',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'Which law has Priya most likely broken?',
      extract: {
        title: 'Style on Wheels — refusing a booking',
        text: 'Priya is fully booked on Saturdays. When a new customer aged 17 tried to book a Saturday appointment, Priya refused, telling her: “I don’t take Saturday bookings from under-21s.”',
      },
      options: [
        'The Consumer Rights Act 2015',
        'The Health and Safety at Work Act 1974',
        'The National Minimum Wage Act 1998',
        'The Equality Act 2010',
      ],
      correct: 3,
      explain:
        'The Equality Act 2010 makes it illegal to discriminate against customers on grounds such as age, gender, race, religion, sexuality or disability. Refusing service because of a customer’s age breaks this law.',
    },
    {
      id: 'x18',
      type: 'truefalse',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'The Bank of England raises interest rates. This makes it CHEAPER for Priya to borrow money to buy a second van.',
      answer: false,
      explain:
        'False. Higher interest rates make borrowing more expensive, not cheaper — the monthly repayments on a loan or overdraft would rise. Higher rates can also reduce customers’ spending, hitting sales.',
    },
  ],
};

export default examt1;

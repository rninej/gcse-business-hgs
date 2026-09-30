// gcsebusiness question bank — PRACTICE pool, Topic 1.2 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-1-2',
  title: 'Market Research & Segmentation',
  blurb: 'Self-study practice on customer needs, research, segmentation and market mapping, with Greggs, Deliveroo, TikTok and Costa Coffee.',
  theme: 1,
  topics: ['1.2'],
  audience: 'practice',
  questions: [
    {
      id: 'p12a',
      type: 'mcq',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, adding a vegan sausage roll to its range mainly met which customer need?',
      extract: {
        title: 'Greggs goes vegan',
        text: 'In January 2019 the bakery chain Greggs launched a vegan sausage roll — a meat-free version of its bestseller. The launch made national news, queues formed, and many shops sold out on the first day. Greggs had spotted that growing numbers of customers wanted plant-based versions of everyday food.',
      },
      options: [
        'Price — it made every product in the shop cheaper',
        'Choice — customers who avoid meat could now buy a Greggs sausage roll too',
        'Convenience — it made the shops quicker to visit',
        'Quality — it meant all the other food was better made',
      ],
      correct: 1,
      explain:
        'Choice is one of the four main customer needs, alongside price, quality and convenience. Extending the range gave new groups of customers — vegans and people cutting down on meat — something to buy, and the first-day queues showed the demand was real.',
    },
    {
      id: 'p12b',
      type: 'mcq',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following would be PRIMARY market research for the launch?',
      extract: {
        title: 'Deliveroo comes to town',
        text: 'Deliveroo was founded in London in 2013 by Will Shu and delivers restaurant meals to customers’ doors through an app. Imagine a food-delivery company planning to launch in a new town: before starting, it wants to understand local eating habits, which restaurants already deliver, and what people would be willing to pay.',
      },
      options: [
        'Surveying 200 local residents about which cuisines they would order',
        'Reading a free government report on the UK restaurant industry',
        'Looking up rival delivery firms’ prices on their websites',
        'Studying last year’s published statistics on food delivery',
      ],
      correct: 0,
      explain:
        'Primary research gathers brand-new data for the business’s own purpose — here, a survey of local residents. The government report, the rivals’ websites and the published statistics all already exist, so using them would be secondary research.',
    },
    {
      id: 'p12c',
      type: 'mcq',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, what type of market research data do the TikTok comments produce?',
      extract: {
        title: 'TikTok buzz',
        text: 'A soft-drinks brand is planning a new flavour. Its marketers read thousands of TikTok comments and watch which videos teenagers share, to understand WHY they love or dislike certain drinks — the flavours, the packaging and the adverts.',
      },
      options: [
        'Quantitative — it counts how many people bought each drink',
        'Demographic — it records customers’ ages and incomes',
        'Qualitative — it reveals opinions and the reasons behind them',
        'Secondary — it was published by the government',
      ],
      correct: 2,
      explain:
        'Comments explaining why people like or dislike a product are qualitative data: opinions, motivations and feelings. If the brand instead counted how many teenagers bought each flavour, that would be quantitative data.',
    },
    {
      id: 'p12d',
      type: 'mcq',
      topic: '1.2',
      difficulty: 3,
      marks: 1,
      stem: 'Using the market map in the case study, where is the clearest GAP in this market?',
      extract: {
        title: 'A market map of pizza takeaways',
        text: 'Ashford has three takeaway pizza businesses. Slice City charges low prices and delivers in 60–75 minutes. Pizza Presto charges mid-range prices and delivers in 30–40 minutes. Forno Rossa charges high prices and delivers in 40–50 minutes. A student plots the three on a market map, with price (low to high) on one axis and delivery speed (slow to fast) on the other.',
      },
      options: [
        'Mid prices and medium delivery speed — already taken by Pizza Presto',
        'High prices and medium speed — already taken by Forno Rossa',
        'Low prices and slow delivery — already taken by Slice City',
        'Low prices and fast delivery — no existing business offers this combination',
      ],
      correct: 3,
      explain:
        'The occupied positions are cheap-and-slow (Slice City), mid-and-medium (Pizza Presto) and expensive-and-medium (Forno Rossa). Cheap-and-fast is empty — a possible gap a new entrant could target, if it could find a way to deliver quickly at low cost.',
    },
    {
      id: 'p12e',
      type: 'mcq',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which strategy gives the independent coffee shop the best chance of surviving alongside Costa?',
      extract: {
        title: 'Costa and the independents',
        text: 'Costa Coffee runs thousands of coffee shops across the UK, from high streets to drive-throughs. A married couple is planning to open their own small coffee shop on a street that already has a Costa and one other café.',
      },
      options: [
        'Copying Costa’s menu exactly, item for item',
        'Differentiating — speciality, locally roasted coffee and personal service the chain cannot copy',
        'Outspending Costa on national television adverts',
        'Matching Costa’s bulk-buying discounts from suppliers',
      ],
      correct: 1,
      explain:
        'A market with strong competitors is hard to enter, so a small business must stand out rather than fight on the giant’s terms. It cannot win a price war, an advertising war or a buying war — but local character and personal service give customers a genuine reason to choose it.',
    },
    {
      id: 'p12f',
      type: 'mcq',
      topic: '1.2',
      difficulty: 3,
      marks: 1,
      stem: 'A student wants to find out, as cheaply and quickly as possible, roughly how much UK households spend on eating out each year. Which of the following is the BEST example of secondary research for this?',
      options: [
        'Downloading free government statistics on household spending in restaurants',
        'Paying an agency to run a brand-new survey of 1,000 diners',
        'Interviewing twenty friends about their favourite restaurants',
        'Observing customers in a rival café for a week',
      ],
      correct: 0,
      explain:
        'Secondary research uses data that already exists — and government statistics are free, instant and vast, perfect for sizing a market. Surveys, interviews and observation all create new data, so they are primary research: slower and dearer, though more specific.',
    },
    {
      id: 'p12g',
      type: 'term',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for gathering and analysing information about customers, competitors and the market, so a business can make decisions with less risk?',
      accept: ['market research', 'marketing research', 'doing market research'],
      explain:
        'Market research finds out what customers want and what rivals are doing, before the business commits money. It reduces risk and uncertainty — the cheaper it is to be wrong on paper, the better.',
    },
    {
      id: 'p12h',
      type: 'term',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for research that uses data which already exists — such as government statistics, websites and published reports?',
      accept: ['secondary research', 'desk research', 'secondary', 'secondary market research'],
      explain:
        'Secondary (desk) research uses data collected by someone else. It is quick and cheap, but the data may be out of date, biased or simply not relevant to the business’s exact question — so it is often combined with primary research.',
    },
    {
      id: 'p12i',
      type: 'term',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name for a small group of customers, led through a discussion by a researcher, used to explore opinions in depth?',
      accept: ['focus group', 'a focus group', 'focus groups', 'the focus group', 'group discussion'],
      explain:
        'A focus group sits a handful of customers round a table with a researcher to dig into why they think and feel as they do. It produces rich qualitative data, though a small group may not represent the whole market.',
    },
    {
      id: 'p12j',
      type: 'term',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the specific group of customers a business designs its product for and aims its marketing at?',
      accept: ['target market', 'the target market', 'a target market', 'target audience', 'target customers'],
      explain:
        'The target market is the group the product is really for — defined using segmentation, such as ‘16–24 year olds who follow fitness influencers’. Every element of the marketing mix is then built around that group.',
    },
    {
      id: 'p12k',
      type: 'fib',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'Online grocers let customers shop at any hour and deliver to the door — meeting the customer need for ________. What one word completes the sentence?',
      accept: ['convenience', 'the convenience', 'ease'],
      explain:
        'Convenience means making it easy for the customer — easy to find, easy to buy, easy to receive. Shopping at any hour with home delivery is one of the clearest ways a business can meet that need.',
    },
    {
      id: 'p12l',
      type: 'fib',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A burger chain designs different menus for Britain, Japan and India. Splitting a market by where customers live is called ________ segmentation. What one word completes the sentence?',
      accept: ['geographic', 'geographical', 'geography', 'location', 'regional'],
      explain:
        'Geographic (location) segmentation groups customers by where they live — country, region or city. Menus, products and even prices can then be tailored to each place, as global food chains do.',
    },
    {
      id: 'p12m',
      type: 'numeric',
      topic: '1.2',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the percentage of respondents who said they would buy lunch at HealthyHub at least once a week. Give your answer to the nearest whole number.',
      extract: {
        title: 'HealthyHub',
        text: 'HealthyHub is a planned salad-bar start-up. Before opening, its founders stood outside a shopping centre for two days and asked 450 shoppers a short questionnaire. Of the 450, 162 said they would buy lunch at HealthyHub at least once a week; the rest said rarely or never.',
      },
      value: 36,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'Percentage = part ÷ whole × 100 = 162 ÷ 450 × 100 = 36%. This is quantitative data from primary research — brand-new data, collected first-hand, in numerical form — and it suggests real weekly demand in the area.',
    },
    {
      id: 'p12n',
      type: 'numeric',
      topic: '1.2',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate The Daily Press’s market share of station takeaway coffees for its first week. Give your answer to the nearest whole number.',
      extract: {
        title: 'The Daily Press',
        text: 'The Daily Press is a new coffee kiosk at Elmfield railway station. Roughly 3,000 takeaway coffees are bought at the station every week — from the kiosk, the station café and two chain stands. In its first full week, The Daily Press sold 450 coffees.',
      },
      value: 15,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'Market share = one business’s sales ÷ total market sales × 100 = 450 ÷ 3,000 × 100 = 15%. A 15% share in week one tells the owners they are already a genuine competitor in that station’s market — and shows rivals a new threat has arrived.',
    },
    {
      id: 'p12o',
      type: 'truefalse',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'Secondary market research means collecting brand-new data directly from customers yourself.',
      answer: false,
      explain:
        'False — that is primary research. Secondary research uses data that already exists, such as government statistics, published reports and rivals’ websites: quick and cheap, but possibly out of date or not quite fit for purpose.',
    },
    {
      id: 'p12p',
      type: 'truefalse',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A market with several large, well-established competitors makes it easy for a new small business to succeed.',
      answer: false,
      explain:
        'False. Strong, established competitors — like the big coffee chains — make a market hard to enter: they own the best sites, the brands and the buying power. Small entrants survive by differentiating, not by fighting head-on.',
    },
  ],
};
export default def;

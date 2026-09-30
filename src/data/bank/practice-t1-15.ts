// gcsebusiness question bank — PRACTICE pool, Topic 1.5 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-1-5',
  title: 'External Influences: Practice',
  blurb: 'Self-study practice on stakeholders, technology, the economy and business law, with Netflix, Toyota, Dyson and Richer Sounds.',
  theme: 1,
  topics: ['1.5'],
  audience: 'practice',
  questions: [
    {
      id: 'p15a',
      type: 'term',
      topic: '1.5',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for any individual or group that has an interest in, or is affected by, the activities of a business?',
      accept: ['stakeholder', 'stakeholders', 'a stakeholder', 'the stakeholders'],
      explain:
        'Stakeholders include owners, employees, customers, suppliers, lenders, the local community and the government. Each has an interest in the business’s decisions — and their interests often pull in different directions.',
    },
    {
      id: 'p15b',
      type: 'mcq',
      topic: '1.5',
      difficulty: 1,
      marks: 1,
      stem: 'What does Netflix’s story best illustrate about technology?',
      extract: {
        title: 'From DVDs to streaming',
        text: 'Netflix began in 1997 renting DVDs to customers by post. As broadband spread, it reinvented itself around streaming — letting subscribers watch instantly, on demand, for a monthly fee — and later started making its own hit programmes. DVD rivals that stayed physical, like Blockbuster, disappeared.',
      },
      options: [
        'New technology can transform how customers buy — and businesses that adapt first can dominate',
        'Technology has almost no effect on customer habits',
        'Only businesses founded before the internet can survive',
        'Customers always prefer physical products like DVDs',
      ],
      correct: 0,
      explain:
        'Broadband changed how people watch films, and Netflix rode that change while Blockbuster ignored it. Businesses that spot and adapt to new technology gain a huge advantage; those that do not risk failure, however big they once were.',
    },
    {
      id: 'p15c',
      type: 'mcq',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which is the most likely impact of automation on Toyota’s workforce?',
      extract: {
        title: 'Robots at Toyota',
        text: 'At Toyota’s car plants, hundreds of robots weld and paint car bodies along the production line. Human workers supervise the machines, step in when faults appear, and carry out the final quality checks that decide whether a car is finished to standard.',
      },
      options: [
        'Every human worker is replaced immediately and completely',
        'Fewer people are needed for repetitive jobs, and the remaining workers need training to work alongside the machines',
        'Quality checks become unnecessary once robots are installed',
        'Robots take over designing the cars and managing the factory',
      ],
      correct: 1,
      explain:
        'Automation tends to replace repetitive, physical tasks — welding and painting — rather than every job. Workers shift towards supervising and inspecting, which demands new skills, so training and retraining become essential when technology changes.',
    },
    {
      id: 'p15d',
      type: 'mcq',
      topic: '1.5',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which pair of stakeholders most clearly DISAGREED about the move?',
      extract: {
        title: 'Dyson moves its headquarters',
        text: 'In 2019 the appliance maker Dyson — famous for vacuum cleaners and hairdryers — announced it was moving its global headquarters from Britain to Singapore. Founder Sir James Dyson said the company’s fastest-growing markets were in Asia; critics in Britain, including politicians, attacked the decision.',
      },
      options: [
        'Dyson’s UK customers and its Singapore customers, who both wanted fewer products',
        'The suppliers and the lenders, whose interests are always identical',
        'The employees and the customers, who both demanded higher prices',
        'The owners, who wanted growth in Asia, versus many UK employees and politicians, who feared for British jobs',
      ],
      correct: 3,
      explain:
        'Stakeholder conflict means different groups wanting different outcomes. Dyson’s owners saw growth in Asian markets; many UK employees and politicians worried about British jobs and prestige. Neither side is ‘wrong’ — their interests simply clash, and the business must decide which to prioritise.',
    },
    {
      id: 'p15e',
      type: 'mcq',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'The National Minimum Wage rises sharply. Which business is likely to see the biggest jump in its costs?',
      options: [
        'A care-home company employing 80 low-paid care assistants around the clock',
        'A two-person web-design studio charging high fees',
        'A firm of City solicitors on six-figure salaries',
        'A shipping line whose main cost is fuel',
      ],
      correct: 0,
      explain:
        'The National Minimum Wage is a legal floor on hourly pay, so it bites hardest on businesses with many staff at or near that floor — care, hospitality and retail. A two-person studio or a firm of solicitors has few or no minimum-wage workers, and fuel is not a wage at all.',
    },
    {
      id: 'p15f',
      type: 'mcq',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'Under the Consumer Rights Act 2015, what is the customer entitled to?',
      extract: {
        title: 'The faulty television',
        text: 'Richer Sounds is a British chain selling televisions and hi-fi equipment, known for its customer service. A customer buys a £399 TV from its website. Fourteen days later the screen fails through no fault of her own, and she asks for her money back.',
      },
      options: [
        'Nothing — once goods are delivered, the sale is final',
        'A full refund, because goods must be of satisfactory quality and faulty goods can be rejected within 30 days',
        'A replacement only if she pays half the price again',
        'Store credit worth a quarter of the purchase price',
      ],
      correct: 1,
      explain:
        'The Consumer Rights Act 2015 says goods must be of satisfactory quality, fit for purpose and as described. A screen failing after two weeks breaks that promise — and within 30 days the customer can reject the goods for a full refund, not credit or a part-payment.',
    },
    {
      id: 'p15g',
      type: 'mcq',
      topic: '1.5',
      difficulty: 3,
      marks: 1,
      stem: 'A factory closure leaves thousands of people in a town out of work. What is the most likely effect on recruitment at the town’s remaining businesses?',
      options: [
        'Fewer people apply for each vacancy, so jobs go unfilled',
        'Wages are forced sharply upwards because workers have become scarce',
        'More people apply for each vacancy, so recruiting becomes easier',
        'Recruitment is completely unaffected',
      ],
      correct: 2,
      explain:
        'Rising unemployment means more jobseekers chasing each vacancy, so recruitment gets easier and pressure on wages eases. The downside sits on the other side of the economy: fewer people have income to spend, so local sales tend to fall.',
    },
    {
      id: 'p15h',
      type: 'term',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the percentage a lender charges for lending money — effectively the price of borrowing?',
      accept: ['interest rate', 'interest', 'rate of interest', 'the interest rate', 'interest rates'],
      explain:
        'The interest rate is the price of borrowing, influenced by the Bank of England. When rates rise, loans and overdrafts cost businesses more — and customers who borrow face dearer repayments too, so spending often falls.',
    },
    {
      id: 'p15i',
      type: 'term',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the price of one currency expressed in another — for example, £1 = $1.25?',
      accept: ['exchange rate', 'the exchange rate', 'exchange rates', 'an exchange rate', 'foreign exchange rate'],
      explain:
        'The exchange rate tells you how much one pound buys abroad. If £1 buys more dollars than before, sterling has strengthened: imports get cheaper for UK buyers, but exports look dearer to foreign customers.',
    },
    {
      id: 'p15j',
      type: 'term',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of the law that requires businesses to collect and use people’s personal data lawfully, fairly and with care?',
      accept: ['gdpr', 'general data protection regulation', 'uk gdpr', 'data protection act', 'the data protection act'],
      explain:
        'The General Data Protection Regulation (GDPR), applied in the UK through the Data Protection Act 2018, forces businesses to look after personal data: collected with consent, used lawfully and kept secure. Breaches bring heavy fines — TikTok was fined £12.7 million in 2023 over children’s data.',
    },
    {
      id: 'p15k',
      type: 'fib',
      topic: '1.5',
      difficulty: 1,
      marks: 1,
      stem: 'Under the Health and ________ at Work Act 1974, employers must provide a safe workplace, training and protective equipment. What one word completes the name of the Act?',
      accept: ['safety', 'the safety', 'health and safety'],
      explain:
        'The Health and Safety at Work Act 1974 makes employers responsible for a safe workplace, proper training and protective equipment. Breaking it can mean prosecution, fines — and injuries that no fine can put right.',
    },
    {
      id: 'p15l',
      type: 'fib',
      topic: '1.5',
      difficulty: 1,
      marks: 1,
      stem: 'A general rise in prices over time, which squeezes how much customers can buy, is called ________. What one word completes the sentence?',
      accept: ['inflation', 'the inflation', 'rising inflation', 'price inflation'],
      explain:
        'Inflation means prices are rising on average. Customers can buy less with their money, so sales of all but the essentials may fall — while the business’s own materials and wages get dearer, squeezing profit from both directions.',
    },
    {
      id: 'p15m',
      type: 'numeric',
      topic: '1.5',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the increase in the café’s WEEKLY wage bill after the rise. Give your answer in pounds.',
      extract: {
        title: 'The Copper Kettle',
        text: 'The Copper Kettle is a café in Bridgenorth. It employs 6 part-time staff, each on the legal minimum hourly rate and each working 40 hours a week. The minimum hourly rate is set to rise from £11.00 to £11.50.',
      },
      value: 120,
      tol: 1,
      unit: '£',
      explain:
        'Extra pay per hour = £11.50 − £11.00 = £0.50. Weekly increase = 6 staff × 40 hours × £0.50 = £120. Minimum-wage rises hit labour-intensive businesses like cafés hardest — the owner may need to raise prices, cut hours or take longer shifts herself.',
    },
    {
      id: 'p15n',
      type: 'numeric',
      topic: '1.5',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate the cost in POUNDS of one box of controllers. Give your answer in pounds.',
      extract: {
        title: 'Games Gadgets Ltd',
        text: 'Games Gadgets Ltd, a small UK retailer, imports gaming accessories from the United States. Its American supplier charges $300 for a box of controllers, and the current exchange rate is £1 = $1.50.',
      },
      value: 200,
      tol: 1,
      unit: '£',
      explain:
        'At £1 = $1.50, divide the dollar price by the rate: $300 ÷ 1.50 = £200. If the pound weakened — say to £1 = $1.20 — the same box would cost £250, which is why importers fear a falling pound.',
    },
    {
      id: 'p15o',
      type: 'truefalse',
      topic: '1.5',
      difficulty: 1,
      marks: 1,
      stem: 'When the Bank of England CUTS interest rates, borrowing becomes cheaper for businesses and households.',
      answer: true,
      explain:
        'True. Lower rates mean cheaper loans, overdrafts and mortgages — so businesses find it cheaper to invest and customers have more to spend. That is exactly why central banks cut rates when they want to boost the economy.',
    },
    {
      id: 'p15p',
      type: 'truefalse',
      topic: '1.5',
      difficulty: 2,
      marks: 1,
      stem: 'Under the Equality Act 2010, it is legal for a shop to refuse to serve a customer because of their race.',
      answer: false,
      explain:
        'False — the Equality Act 2010 makes it unlawful to discriminate against employees or customers because of protected characteristics such as age, disability, gender, race, religion or sexuality. Breaking it can bring tribunal claims, fines and lasting reputational damage.',
    },
  ],
};
export default def;

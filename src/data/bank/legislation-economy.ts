// gcsebusiness question bank — Legislation & the Economy (Topic 1.5)
// Author: gcsebusiness content team. Real cases (Wagamama, Go Ape, Pret A Manger,
// Vinted, Heinz, Rolls-Royce, Center Parcs) are verifiable public knowledge.

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'legislation-economy',
  title: 'Legislation & the Economy',
  blurb:
    'The five GCSE laws — minimum wage, health and safety, consumer rights, equality and GDPR — plus interest rates, inflation, unemployment and exchange rates, with Wagamama, Go Ape, Pret, Vinted, Heinz and Rolls-Royce.',
  theme: 1,
  topics: ['1.5'],
  questions: [
    {
      id: 'le1',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which law is responsible for the increase in Wagamama’s wage costs each April?',
      extract: {
        title: 'Wagamama — the April pay rise',
        text: 'Wagamama runs Asian-inspired restaurants across the UK, employing thousands of kitchen and front-of-house staff. Every April the government raises the legal minimum hourly rate, so Wagamama’s payroll costs rise for its lowest-paid staff, squeezing the margin on every bowl of ramen.',
      },
      options: [
        'GDPR',
        'The Equality Act 2010',
        'The Health and Safety at Work Act 1974',
        'The National Minimum Wage legislation',
      ],
      correct: 3,
      explain:
        'The National Minimum Wage sets a legal floor on hourly pay and is uprated most years. Every rise increases costs for labour-intensive employers such as restaurants, which must then absorb the cost, raise prices, or find efficiencies elsewhere.',
    },
    {
      id: 'le2',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which law places these safety duties on Go Ape as an employer?',
      extract: {
        title: 'Go Ape — safety first',
        text: 'Go Ape runs high-ropes adventure courses in forests across the UK. Before every session, instructors check harnesses and helmets, customers receive a full safety briefing, and staff are trained in rescue procedures. Logs record each daily inspection of the equipment.',
      },
      options: [
        'The National Minimum Wage legislation',
        'The Health and Safety at Work Act 1974',
        'The Equality Act 2010, on fair treatment',
        'GDPR, the data protection law',
      ],
      correct: 1,
      explain:
        'The Health and Safety at Work Act 1974 makes employers responsible for a safe workplace, proper training and safe equipment. For a high-risk business like a ropes course, the harness checks and briefings are legal duties — not just good practice.',
    },
    {
      id: 'le3',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.3',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which statement best describes the wider consequences of the failings in the Pret case?',
      extract: {
        title: 'Pret A Manger — a tragedy that changed the law',
        text: 'In 2016, 15-year-old Natasha Ednan-Laperouse died after eating a Pret A Manger baguette containing sesame — an ingredient she was severely allergic to — which was not listed on the label. After the inquest, Pret added full ingredient and allergen labelling to food made in its shops, and the case helped bring in “Natasha’s Law” in 2021, requiring full labelling on food pre-packed for direct sale.',
      },
      options: [
        'The consequences were limited to a small fine that the company easily paid',
        'Nothing changed, because food labelling is not a legal requirement in the UK',
        'A customer died, the company’s reputation was damaged, and the law itself was tightened',
        'The company avoided making any change to how it labelled its food',
      ],
      correct: 2,
      explain:
        'Failing consumer-protection responsibilities can cost far more than fines: a customer died, Pret faced intense criticism of its labelling, and the case contributed to a change in the law affecting every food retailer. Legal duties exist to protect people — and businesses that ignore them pay the price.',
    },
    {
      id: 'le4',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.3',
      difficulty: 1,
      marks: 1,
      stem: 'Under GDPR, which of the following must Vinted do with members’ personal data?',
      extract: {
        title: 'Vinted — looking after members’ data',
        text: 'Vinted, founded in Lithuania in 2008, is now Europe’s largest online marketplace for second-hand fashion, with tens of millions of members. To run the service it stores members’ names, addresses, payment details and message history.',
      },
      options: [
        'Sell it to whoever offers the most money for it',
        'Use it lawfully, keep it secure, and delete it on request',
        'Keep it forever, even after members close their accounts',
        'Publish it openly so any buyer or seller can check it',
      ],
      correct: 1,
      explain:
        'GDPR requires personal data to be collected lawfully, kept secure and not held longer than needed — and members can ask to see or delete their data. Breaches bring heavy fines as well as lasting damage to trust.',
    },
    {
      id: 'le5',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.4',
      difficulty: 3,
      marks: 1,
      stem: 'The exchange rate moves from £1 = $1.20 to £1 = $1.40. What happens to the value in POUNDS of a fixed dollar payment owed to Rolls-Royce by an American airline?',
      extract: {
        title: 'Rolls-Royce — paid in dollars',
        text: 'Rolls-Royce, the Derby-based maker of aero engines, sells engines and servicing to airlines all over the world. Like much of the aerospace industry, a large share of its export business is priced in US dollars.',
      },
      options: [
        'It rises, because each pound is now worth more',
        'It stays exactly the same, because the price was fixed in dollars',
        'It doubles, because the pound is now stronger',
        'It falls, because each dollar now converts into fewer pounds',
      ],
      correct: 3,
      explain:
        'A stronger pound means dollars are worth less in sterling: $120,000 that used to convert to £100,000 (at £1 = $1.20) converts to only about £85,700 (at £1 = $1.40). Exporters paid in foreign currency lose out when sterling strengthens — and gain when it weakens.',
    },
    {
      id: 'le6',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.4',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which economic problem lay at the heart of the dispute between Heinz and Tesco?',
      extract: {
        title: 'Heinz and Tesco — the price stand-off',
        text: 'In the summer of 2022, products such as Heinz baked beans and tomato ketchup briefly disappeared from Tesco shelves after the supermarket refused to accept the price rises Heinz was demanding. Heinz said the rising cost of ingredients was behind its demands.',
      },
      options: [
        'Inflation — the rising cost of ingredients, passed on in higher prices',
        'Unemployment, because Heinz had sacked its whole workforce',
        'A fall in interest rates, which made beans cheaper to make',
        'A weak pound, which had made UK beans worthless when sold abroad',
      ],
      correct: 0,
      explain:
        'Inflation pushed up Heinz’s ingredient costs, so it sought higher wholesale prices to protect its margins. Tesco used its bargaining power as a giant retailer to resist — showing how inflation can set even the biggest suppliers and customers against each other.',
    },
    {
      id: 'le7',
      type: 'truefalse',
      topic: '1.5',
      subtopic: '1.5.4',
      difficulty: 1,
      marks: 1,
      stem: 'When the UK’s central bank raises interest rates, demand for expensive items bought on credit — such as new cars and family short breaks like those sold by Center Parcs — tends to fall.',
      answer: true,
      explain:
        'True. Higher rates make monthly repayments dearer and leave households with less spare income, so spending on big-ticket items tends to fall. Businesses that depend on that spending see demand drop — and their own borrowing becomes more expensive too.',
    },
    {
      id: 'le8',
      type: 'truefalse',
      topic: '1.5',
      subtopic: '1.5.4',
      difficulty: 2,
      marks: 1,
      stem: 'Rising unemployment is bad news for every business in the economy, with no possible upside for any of them.',
      answer: false,
      explain:
        'False. Rising unemployment does cut customers’ incomes and therefore sales — but it also gives businesses a bigger pool of job applicants, making recruitment easier and easing pressure on wages. Whether it helps or hurts depends on the business.',
    },
    {
      id: 'le9',
      type: 'term',
      topic: '1.5',
      subtopic: '1.5.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for treating someone unfairly — for example refusing them a job or service — because of a protected characteristic such as age, gender, race, religion, sexuality or disability?',
      accept: ['discrimination', 'discriminating', 'direct discrimination', 'unlawful discrimination'],
      explain:
        'Discrimination against people with protected characteristics is unlawful under the Equality Act 2010, whether in hiring, promotion or serving customers. Businesses that discriminate face tribunal claims, fines and lasting reputational damage.',
    },
    {
      id: 'le10',
      type: 'term',
      topic: '1.5',
      subtopic: '1.5.4',
      difficulty: 1,
      marks: 1,
      stem: 'What is the name of the UK’s central bank, which sets the base interest rate that influences what businesses and households pay to borrow?',
      accept: ['bank of england', 'the bank of england', 'boe', 'the boe'],
      explain:
        'The Bank of England is the UK’s central bank. Its base rate shapes interest rates across the economy: when it raises the rate, borrowing becomes dearer and demand tends to cool; when it cuts the rate, borrowing becomes cheaper.',
    },
    {
      id: 'le11',
      type: 'term',
      topic: '1.5',
      subtopic: '1.5.3',
      difficulty: 1,
      marks: 1,
      stem: 'What is the general term for the laws that protect buyers of goods and services — such as the right to a refund, repair or replacement when goods turn out to be faulty?',
      accept: ['consumer protection', 'consumer protection law', 'consumer law', 'consumer rights'],
      explain:
        'Consumer protection is the body of law that shields buyers — most importantly the Consumer Rights Act 2015, which says goods must be of satisfactory quality, fit for purpose and as described. Businesses that breach it face refunds, claims and damage to their reputation.',
    },
    {
      id: 'le12',
      type: 'fib',
      topic: '1.5',
      subtopic: '1.5.3',
      difficulty: 1,
      marks: 1,
      stem: 'Under GDPR, a business must normally obtain a customer’s ________ before using their personal data to send marketing emails. What one word completes the sentence?',
      accept: ['consent', 'permission', 'agreement', 'approval'],
      explain:
        'Personal data must be collected and used lawfully — usually with the individual’s consent — and marketing without it can bring fines. GDPR also gives people rights over their data, including the right to see it and to have it deleted.',
    },
    {
      id: 'le13',
      type: 'fib',
      topic: '1.5',
      subtopic: '1.5.4',
      difficulty: 2,
      marks: 1,
      stem: 'If £1 buys MORE dollars than it did last month — say £1 = $1.60 instead of £1 = $1.40 — we say sterling has ________. What one word completes the sentence?',
      accept: ['strengthened', 'appreciated', 'risen', 'gone up', 'increased'],
      explain:
        'When one pound buys more dollars, sterling has strengthened (appreciated). Imports then cost UK buyers less, but UK exports look dearer to foreign customers — and exporters paid in dollars receive fewer pounds for the same sales.',
    },
    {
      id: 'le14',
      type: 'numeric',
      topic: '1.5',
      subtopic: '1.5.4',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the value of the export order in POUNDS. Give your answer in pounds.',
      extract: {
        title: 'Bracken & Bay — an export order',
        text: 'Bracken & Bay is a small fudge maker in Cornwall. A German food shop has placed an order worth €4,200, and the current exchange rate is £1 = €1.20.',
      },
      value: 3500,
      tol: 1,
      unit: '£',
      explain:
        'At £1 = €1.20, divide the euro amount by the rate: €4,200 ÷ 1.20 = £3500. If the pound became stronger, at £1 = €1.50, the same order would bring in only €4,200 ÷ 1.50 = £2,800 — which is why exporters watch exchange rates so closely.',
    },
    {
      id: 'le15',
      type: 'numeric',
      topic: '1.5',
      subtopic: '1.5.4',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the bistro’s NEW annual interest cost at 6.5%. Give your answer in pounds.',
      extract: {
        title: 'The Salt Marsh Kitchen — a variable-rate loan',
        text: 'The Salt Marsh Kitchen, a bistro in Norfolk, borrowed £40,000 from its bank on a variable interest rate. The rate has just been raised from 5% to 6.5% a year. Interest is charged on the full £40,000.',
      },
      value: 2600,
      tol: 2,
      unit: '£',
      explain:
        'Annual interest = loan × interest rate = £40,000 × 6.5% = £2600. The rise from 5% (which cost £2,000) adds £600 a year to the bistro’s costs — money that must come out of profit unless prices rise.',
    },
    {
      id: 'le16',
      type: 'numeric',
      topic: '1.5',
      subtopic: '1.5.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the increase in the diner’s WEEKLY wage bill after the rise. Give your answer in pounds.',
      extract: {
        title: 'The Dockside Diner — a higher minimum',
        text: 'The Dockside Diner employs 5 part-time kitchen and serving staff, each on the legal minimum hourly rate and each working 35 hours a week. The government has announced that the minimum hourly rate will rise by 40p.',
      },
      value: 70,
      tol: 1,
      unit: '£',
      explain:
        'Extra pay per hour = £0.40. Weekly increase = 5 staff × 35 hours × £0.40 = £70. Over a year that is around £3,640 of extra cost — the diner must raise prices, sell more, or absorb it from profit.',
    },
  ],
};
export default def;

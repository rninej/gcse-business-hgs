// gcsebusiness question bank — Enterprise & Entrepreneurship (Topic 1.1)
// Author: gcsebusiness content team. All real-world figures are verifiable.

import type { QuizDef } from '@/lib/bank';

const enterprise: QuizDef = {
  id: 'enterprise',
  title: 'Enterprise & Entrepreneurship',
  blurb: 'Why business ideas emerge, risk and reward, adding value and the Innocent Drinks story.',
  theme: 1,
  topics: ['1.1'],
  questions: [
    {
      id: 'e1',
      type: 'mcq',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is the best example of a new business idea coming about because of NEW TECHNOLOGY?',
      options: [
        'A start-up building a food-delivery app now that almost everyone carries a smartphone',
        'A café launching a vegan menu because more people are cutting out animal products',
        'A bakery staying open until midnight because its customers work late shifts',
        'A shop moving premises because rents in its old street have fallen',
      ],
      correct: 0,
      explain:
        'New technology creates opportunities that could not exist before — app-based delivery needs smartphones to work. The vegan menu reflects changing consumer tastes, later opening hours reflect customer needs, and cheaper rents are a change in costs, not technology.',
    },
    {
      id: 'e2',
      type: 'term',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for a person who sets up their own business, taking on financial risk in the hope of making a profit?',
      accept: ['entrepreneur', 'an entrepreneur', 'entrepreneurs'],
      explain:
        'An entrepreneur is someone who takes the risk of starting a business, investing their own time and money in the hope of profit — like the three friends who founded Innocent Drinks.',
    },
    {
      id: 'e3',
      type: 'mcq',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a potential REWARD for someone who takes the risk of starting their own business?',
      options: [
        'Keeping the profit the business makes if it succeeds',
        'A guaranteed wage paid by the government whether or not the business succeeds',
        'Complete certainty that the business will never fail',
        'Being personally responsible for all of the business’s debts',
      ],
      correct: 0,
      explain:
        'The main reward for taking the risk is profit — the money left over after costs, which the owner keeps. Being personally responsible for debts is a RISK of entrepreneurship, not a reward, and nothing about a start-up is guaranteed.',
    },
    {
      id: 'e4',
      type: 'truefalse',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'A business founder who works hard and creates a good product is guaranteed to make a profit.',
      answer: false,
      explain:
        'False. However hard someone works, a new business carries real risk: demand may be lower than expected, costs may rise, or rivals may be stronger. If the business fails, the founder can lose their savings and owe debts.',
    },
    {
      id: 'e5',
      type: 'fib',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Selling price − the cost of bought-in ________ gives the extra worth a business creates on each unit it sells. What one word completes the formula?',
      accept: ['materials', 'material', 'raw materials', 'the materials', 'bought in materials'],
      explain:
        'The completed formula reads: selling price − the cost of bought-in materials. It measures the extra worth a business creates by transforming materials into a finished product that customers will pay more for.',
    },
    {
      id: 'e6',
      type: 'numeric',
      topic: '1.1',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the extra worth Maya creates on ONE candle. Give your answer in pounds to 2 decimal places.',
      extract: {
        title: 'Maya’s Candles',
        text: 'Maya makes scented candles in her garage and sells them at a local craft market and online. Each candle sells for £12.00. The ingredients she buys in — wax, wicks, fragrance oil and glass jars — cost £4.50 per candle. Maya wants to add more value so she can charge higher prices and increase her profit.',
      },
      value: 7.5,
      tol: 0.05,
      unit: '£',
      dp: 2,
      explain:
        'Extra worth = selling price − the cost of the bought-in ingredients = £12.00 − £4.50 = £7.50 per candle. This £7.50 is what Maya creates by turning wax, wicks and jars into a finished scented candle — it has to cover her other costs before she makes a profit.',
    },
    {
      id: 'e7',
      type: 'mcq',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a way a small café could ADD VALUE to what it sells?',
      options: [
        'Personalising the service, e.g. writing each customer’s name on their cup',
        'Buying the cheapest ingredients it can find wherever possible',
        'Charging exactly the same price as every rival café in town',
        'Making customers queue for longer at the till before serving',
      ],
      correct: 0,
      explain:
        'Excellent, personal service makes customers value the whole experience more than what the bought-in ingredients cost, so they will happily pay a higher price. Cheap ingredients, copying rivals’ prices and longer queues cut costs or annoy customers — none of them adds value.',
    },
    {
      id: 'e8',
      type: 'mcq',
      topic: '1.1',
      difficulty: 3,
      marks: 1,
      stem: 'Which of the following best describes the role of business enterprise in the economy?',
      options: [
        'Taking risks to produce goods and services, creating jobs and wealth',
        'Guaranteeing that no business anywhere ever fails',
        'Replacing the need for government and public services entirely',
        'Making sure that every new start-up is instantly profitable',
      ],
      correct: 0,
      explain:
        'Enterprise means taking the risk of producing goods and services. Successful enterprises create jobs for workers, incomes for owners and tax revenue for public services — which is why enterprise is described as creating wealth for the economy.',
    },
    {
      id: 'e9',
      type: 'mcq',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, why did Innocent’s founders ask customers to put their empty bottles in bins marked ‘yes’ and ‘no’?',
      extract: {
        title: 'Innocent Drinks',
        text: 'Innocent Drinks was started in 1999 by three friends — Richard Reed, Adam Balon and Jon Wright. They spent £500 on fruit and sold smoothies from a stall at a music festival, asking customers to vote with their empty bottles: put the bottle in the ‘yes’ bin if the three should quit their jobs to make smoothies, or the ‘no’ bin if they should not. The ‘yes’ bin filled up first — so they handed in their notices and launched the business. In 2013 Coca-Cola became the majority owner of Innocent.',
      },
      options: [
        'To check customers really wanted the smoothies before they quit their jobs',
        'To raise extra finance by charging customers a deposit on every bottle',
        'To find out how much the fruit for the smoothies cost to buy',
        'To comply with the festival’s rules on recycling packaging waste',
      ],
      correct: 0,
      explain:
        'The vote was a simple test of customer demand — market research that reduced the risk of a huge decision: giving up secure jobs. The ‘yes’ bin filling first gave the founders confidence that people genuinely wanted the product.',
    },
    {
      id: 'e10',
      type: 'term',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for an unmet customer need that no existing business is satisfying — an opportunity for a new start-up?',
      accept: ['gap in the market', 'a gap in the market', 'market gap', 'niche', 'a niche', 'niche in the market'],
      explain:
        'A gap in the market is a customer need that existing businesses are not meeting. Business founders who spot one — like the creators of Innocent — can build a whole business around filling it.',
    },
    {
      id: 'e11',
      type: 'term',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which quality of a successful business founder is shown by someone who keeps going despite setbacks and rejection?',
      accept: ['determination', 'persistence', 'perseverance', 'resilience', 'drive', 'determined', 'tenacity', 'persistent', 'resilient'],
      explain:
        'Determination — sticking at the goal despite obstacles, also called persistence or resilience — is one of the key entrepreneurial qualities, along with initiative, willingness to take advice and the ability to learn from failure.',
    },
    {
      id: 'e12',
      type: 'truefalse',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Coca-Cola has been the majority owner of Innocent Drinks since 2013.',
      answer: true,
      explain:
        'True. Coca-Cola bought a majority stake in Innocent in 2013 — a huge reward for the founders’ risky start-up — while the Innocent brand has continued trading.',
    },
    {
      id: 'e13',
      type: 'mcq',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which change in CONSUMER TASTES created the opportunity for Innocent’s smoothies?',
      extract: {
        title: 'Innocent Drinks',
        text: 'Innocent Drinks was started in 1999 by three friends — Richard Reed, Adam Balon and Jon Wright. They spent £500 on fruit and sold smoothies from a stall at a music festival, asking customers to vote with their empty bottles: put the bottle in the ‘yes’ bin if the three should quit their jobs to make smoothies, or the ‘no’ bin if they should not. The ‘yes’ bin filled up first — so they handed in their notices and launched the business. In 2013 Coca-Cola became the majority owner of Innocent.',
      },
      options: [
        'A growing taste for healthier, more natural food and drink',
        'Rising demand for traditional sugary fizzy drinks',
        'A fall in the number of people interested in healthy eating',
        'A fall in the cost of blending fruit into drinks',
      ],
      correct: 0,
      explain:
        'Innocent rode the shift towards healthier, more natural food and drink — consumer tastes were moving away from fizzy drinks towards fruit-based products. A fall in the cost of blending would be a change in costs, not a change in tastes.',
    },
    {
      id: 'e14',
      type: 'fib',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Business is ________: it changes constantly in response to technology, consumer tastes and competition. What one word completes the sentence?',
      accept: ['dynamic', 'constantly changing', 'ever changing', 'always changing'],
      explain:
        'Business is dynamic — markets never stand still. New technology appears, fashions shift and competitors launch new products, so businesses must keep adapting or risk being left behind.',
    },
    {
      id: 'e15',
      type: 'term',
      topic: '1.1',
      difficulty: 3,
      marks: 1,
      stem: 'What is the term for the difference between the selling price of a product and the cost of the bought-in supplies used to make it?',
      accept: ['added value', 'value added', 'adding value', 'the added value', 'the value added'],
      explain:
        'Added value = selling price − the cost of what is bought in to make the product. A business increases its added value through branding, quality, design, convenience and excellent service.',
    },
  ],
};

export default enterprise;

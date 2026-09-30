// gcsebusiness question bank — PRACTICE pool, Topic 1.1 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-1-1',
  title: 'Enterprise: Practice',
  blurb: 'Self-study practice on risk, reward and adding value, with case studies on Airbnb, BrewDog and two craft start-ups.',
  theme: 1,
  topics: ['1.1'],
  audience: 'practice',
  questions: [
    {
      id: 'p11a',
      type: 'mcq',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following changes is most likely to create an opportunity for a NEW business?',
      options: [
        'A big rise in the number of people who want plant-based food',
        'A new law that bans new cafés from opening',
        'A fall in the number of people who eat out',
        'The huge success of the vegan café that already owns the high street',
      ],
      correct: 0,
      explain:
        'New business ideas come about when customer wants change — a surge in demand for plant-based food creates openings for new vegan cafés, restaurants and delivery services. Bans, falling demand and a market that is already taken do the opposite: they close opportunities down.',
    },
    {
      id: 'p11b',
      type: 'mcq',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which statement best explains how the Airbnb business idea came about?',
      extract: {
        title: 'Airbnb — the first guests',
        text: 'In 2007, two young designers in San Francisco — Brian Chesky and Joe Gebbia — were struggling to pay their rent. That week a big design conference filled every hotel in the city, so the pair inflated three air mattresses in their living room and rented them out to stranded visitors. The guests paid happily, and the idea behind Airbnb — a website letting people rent out spare rooms to travellers — was born. The company launched in 2008.',
      },
      options: [
        'The founders were ordered by the government to create a room-rental website',
        'The founders copied an existing hotel chain, using its rooms and its brand',
        'The founders spotted an unmet need — travellers with nowhere to stay — and used the internet to connect them with people who had spare space',
        'The founders wanted to design furniture, and renting rooms was only a hobby',
      ],
      correct: 2,
      explain:
        'Airbnb came from a classic gap in the market: hotels were full, travellers needed beds, and the founders had space. New technology — online booking — let them turn that unmet need into a global business. The idea was born from a change in what was possible, spotted at exactly the right moment.',
    },
    {
      id: 'p11c',
      type: 'mcq',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a RISK of starting your own business rather than staying an employee?',
      options: [
        'Being able to make your own decisions about the business',
        'The business may fail, and you can lose the money and time you invested',
        'Keeping all the profit the business makes',
        'The personal satisfaction of building something of your own',
      ],
      correct: 1,
      explain:
        'The central risk of entrepreneurship is failure: the owner can lose their savings, their time and the secure salary they gave up. Independence, profit and personal satisfaction are the rewards on the other side of that risk — you cannot have one without the other.',
    },
    {
      id: 'p11d',
      type: 'mcq',
      topic: '1.1',
      difficulty: 3,
      marks: 1,
      stem: 'A new independent cinema opens in a struggling town centre. Which of the following shows enterprise creating wealth for the ECONOMY?',
      options: [
        'It guarantees that every other business in the town makes a profit',
        'It removes the town council’s need to collect any tax',
        'It makes sure no other business can ever open nearby',
        'It creates jobs and incomes, and local suppliers win new orders',
      ],
      correct: 3,
      explain:
        'Enterprise means taking the risk to produce goods and services — and one successful risk-taker creates wealth beyond itself: jobs for workers, orders for suppliers and tax revenue for public services. It enables other businesses; it guarantees and excludes nothing.',
    },
    {
      id: 'p11e',
      type: 'mcq',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, how does BrewDog’s branding help it ADD VALUE?',
      extract: {
        title: 'BrewDog',
        text: 'BrewDog was started in 2007 by two friends, James Watt and Martin Dickie, who brewed bold craft beer in Fraserburgh, Scotland. Its flagship Punk IPA sells for far more per bottle than basic supermarket lager. BrewDog’s loud branding — from the name to the cartoon labels — has won the brewery an army of loyal customers.',
      },
      options: [
        'It lets BrewDog sell its beer as cheaply as possible',
        'It means BrewDog uses exactly the same recipe as every other brewery',
        'It reduces the amount of beer BrewDog can produce',
        'Customers will pay a premium price because the brand makes the beer feel special and different',
      ],
      correct: 3,
      explain:
        'Added value = selling price − the cost of bought-in materials. A strong brand makes customers value a product more than its basic ingredients, so they happily pay a premium price — which is why branding is one of the main ways a business adds value.',
    },
    {
      id: 'p11f',
      type: 'mcq',
      topic: '1.1',
      difficulty: 3,
      marks: 1,
      stem: 'An entrepreneur’s first product flops. She works out exactly why customers rejected it, redesigns the product and launches again — successfully. Which quality of a successful entrepreneur is she showing?',
      options: [
        'Willingness to take advice from anyone, whatever their expertise',
        'Determination to keep the product exactly as it was first designed',
        'The ability to learn from failure',
        'Initiative — spotting a gap in the market before anyone else',
      ],
      correct: 2,
      explain:
        'Learning from failure means treating a flop as feedback: diagnose what went wrong, change it, and try again. It sits alongside determination, initiative and willingness to take advice among the qualities that mark out successful entrepreneurs.',
    },
    {
      id: 'p11g',
      type: 'term',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for the act of setting up a new business and taking a financial risk in the hope of reward?',
      accept: ['enterprise', 'an enterprise', 'entrepreneurship', 'business enterprise'],
      explain:
        'Enterprise means taking the risk of producing goods or services in the hope of profit. Enterprise matters to the whole economy: it creates jobs, incomes and wealth, which is why governments encourage it.',
    },
    {
      id: 'p11h',
      type: 'term',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'A market trader’s revenue for the summer is £9,000 and her total costs are £7,500. What is the term for the £1,500 left over — the entrepreneur’s main financial reward?',
      accept: ['profit', 'the profit', 'profits'],
      explain:
        'Profit = total revenue − total costs = £9,000 − £7,500 = £1,500. Profit is the main financial reward for the risk an entrepreneur takes; if costs had been higher than revenue, the business would have made a loss instead.',
    },
    {
      id: 'p11i',
      type: 'term',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for creating a recognisable name, design and identity for a product — one of the most powerful ways for a business to add value?',
      accept: ['branding', 'brand', 'a brand', 'the brand', 'brands'],
      explain:
        'Branding gives a product an identity customers recognise and trust. A strong brand makes customers willing to pay more than the basic product would fetch — which is exactly what adding value means.',
    },
    {
      id: 'p11j',
      type: 'term',
      topic: '1.1',
      difficulty: 3,
      marks: 1,
      stem: 'Which quality of a successful entrepreneur is shown by someone who spots an opening at a farmers’ market and books a stall the same week — without waiting for anyone’s permission?',
      accept: ['initiative', 'taking initiative', 'initiative taking', 'showing initiative'],
      explain:
        'Initiative means spotting an opportunity and acting on it straight away, without being told to. It sits alongside determination, willingness to take advice and the ability to learn from failure as a key entrepreneurial quality.',
    },
    {
      id: 'p11k',
      type: 'fib',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'Changes in ________ — such as smartphones, apps and fast broadband — have made brand-new business ideas possible, like food-delivery apps. What one word completes the sentence?',
      accept: ['technology', 'tech', 'new technology'],
      explain:
        'New technology is one of the main reasons new business ideas come about: it makes things possible that simply could not be done before. Businesses that embrace new technology early can gain a big advantage over slower rivals.',
    },
    {
      id: 'p11l',
      type: 'fib',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Business is dynamic: markets are always changing as consumer tastes, technology and ________ change. What one word completes the sentence?',
      accept: ['competition', 'the competition', 'competitors', 'rivals'],
      explain:
        'Business is dynamic — it never stands still. New competitors arriving, tastes shifting and technology moving on mean every market changes constantly, so businesses must keep adapting or risk being left behind.',
    },
    {
      id: 'p11m',
      type: 'numeric',
      topic: '1.1',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the value added to ONE bar of soap. Give your answer in pounds to 2 decimal places.',
      extract: {
        title: 'Noor’s Soaps',
        text: 'Noor makes handmade soap in her kitchen and sells it at weekend craft fairs. Each bar sells for £4.50. The bought-in materials — oils, fragrance, wrapping and ribbon — cost £1.70 per bar. Noor wants to add even more value with new scents and gift boxes.',
      },
      value: 2.8,
      tol: 0.05,
      unit: '£',
      dp: 2,
      explain:
        'Value added = selling price − cost of bought-in materials = £4.50 − £1.70 = £2.80. That £2.80 is the extra worth Noor creates by turning plain oils and fragrance into a finished, gift-wrapped product.',
    },
    {
      id: 'p11n',
      type: 'numeric',
      topic: '1.1',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the TOTAL value added across all the bottles Kai sold last month. Give your answer in pounds.',
      extract: {
        title: 'Kai’s Hot Sauce',
        text: 'Kai bottles small-batch chilli sauce and sells it online. Each bottle sells for £6.00, and the bought-in materials — chillies, vinegar, bottles and labels — cost £2.40 per bottle. Last month Kai sold 250 bottles.',
      },
      value: 900,
      tol: 1,
      unit: '£',
      explain:
        'Value added per bottle = £6.00 − £2.40 = £3.60. Across 250 bottles, total value added = 250 × £3.60 = £900. That £900 must still cover Kai’s other costs — packaging, postage and his own time — before he makes a profit.',
    },
    {
      id: 'p11o',
      type: 'truefalse',
      topic: '1.1',
      difficulty: 1,
      marks: 1,
      stem: 'One risk of setting up your own business is losing the money and time you have invested if the business fails.',
      answer: true,
      explain:
        'True. Entrepreneurs risk their savings, their time and often the secure wage they gave up. If the business fails they can lose all three — which is exactly why the rewards, such as profit and independence, exist to balance the risk.',
    },
    {
      id: 'p11p',
      type: 'truefalse',
      topic: '1.1',
      difficulty: 2,
      marks: 1,
      stem: 'Airbnb began in 2008 after its founders rented out air mattresses in their San Francisco flat to visitors who could not find hotel rooms.',
      answer: true,
      explain:
        'True. During a design conference in San Francisco in 2007, hotels sold out — so Brian Chesky and Joe Gebbia inflated air mattresses and charged guests to stay. Spotting that unmet need led to Airbnb, launched in 2008.',
    },
  ],
};
export default def;

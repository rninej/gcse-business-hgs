// gcsebusiness question bank — PRACTICE pool, Topic 2.1 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-2-1',
  title: 'Growth, Globalisation & Ethics',
  blurb: 'Organic growth, takeovers, economies of scale, finance, globalisation, ethics and the environment — featuring Aldi, Kraft’s Cadbury takeover, Alphabet, Tesla and Patagonia.',
  theme: 2,
  topics: ['2.1'],
  audience: 'practice',
  questions: [
    {
      id: 'p21a',
      type: 'mcq',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which of the following describes how Aldi has grown in the UK?',
      extract: {
        title: 'Aldi in Britain',
        text: 'Aldi opened its first British store in 1990. By September 2023 it had opened its 1,000th UK store, in Wellingborough — every one of them opened by Aldi itself, rather than bought from another chain. Aldi is now one of Britain’s biggest supermarkets, with more than 1,000 stores.',
      },
      options: [
        'By merging with another supermarket chain to form one business',
        'By taking over smaller rival chains',
        'By opening new stores itself, one after another',
        'By selling franchises of its brand to shopkeepers',
      ],
      correct: 2,
      explain:
        'Aldi has grown organically (internally): it has expanded by opening its own new stores rather than buying or combining with other businesses. Organic growth is slower than a takeover, but it keeps full control and carries less risk.',
    },
    {
      id: 'p21b',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which of the following makes Kraft’s takeover of Cadbury an example of INORGANIC growth?',
      extract: {
        title: 'Kraft buys Cadbury',
        text: 'Cadbury, the chocolate maker founded in Birmingham in 1824, was taken over by the American food giant Kraft in 2010 in a deal worth around £11.5 billion. Cadbury’s board had rejected Kraft’s earlier offers, urging shareholders to refuse, but after Kraft raised its bid the board recommended the deal and shareholders accepted. Cadbury kept its name, and its Bournville factory kept making chocolate.',
      },
      options: [
        'Kraft grew by buying an existing, established business instead of expanding its own operations',
        'Kraft grew by opening its own new Cadbury-style factories',
        'Kraft merged with Cadbury as equal partners in a fresh start-up',
        'Kraft grew by winning customers from rivals with lower prices',
      ],
      correct: 0,
      explain:
        'A takeover is inorganic (external) growth: the business expands by buying another company rather than growing its own operations. Kraft gained an instant, world-famous confectionery business with factories and customers already in place — far faster than building one from scratch.',
    },
    {
      id: 'p21c',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'The diagram shows how a business’s average cost per unit changes as its output rises. Which of the following best explains why the average cost per unit falls as output grows?',
      diagram: 'economies',
      options: [
        'The business pays its workers less per hour as it grows',
        'Materials become free once output is high enough',
        'The variable cost of making each unit disappears completely',
        'Fixed costs are spread over many more units, and buying materials in bulk costs less per unit',
      ],
      correct: 3,
      explain:
        'These cost savings are economies of scale. A factory’s rent and machinery are fixed costs, so making 80,000 units instead of 10,000 spreads them thinly across each unit — and ordering materials in bulk earns discounts. Variable costs never disappear, but the average cost of one unit falls.',
    },
    {
      id: 'p21d',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which of the following best explains why globalisation is an opportunity for a business such as Alphabet?',
      extract: {
        title: 'Alphabet — a global business',
        text: 'Alphabet, Google’s parent company, makes more than half of its revenue from outside the United States. Its products — Search, YouTube and Android — are used by billions of people in almost every country in the world, and it has offices in dozens of them.',
      },
      options: [
        'It guarantees that every business that trades abroad will succeed',
        'Selling in many countries gives access to vastly more customers than the home market alone',
        'It removes the need to compete with foreign rivals at home',
        'It fixes exchange rates so that they never change',
      ],
      correct: 1,
      explain:
        'Globalisation means businesses can sell into markets far beyond their home country. For Alphabet, more than half of its income now comes from customers outside the US — the world market is simply far bigger than any single country. It is an opportunity, not a guarantee: businesses still need products that people abroad want to buy.',
    },
    {
      id: 'p21e',
      type: 'mcq',
      topic: '2.1',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which of the following is the most likely reason Tesla builds Gigafactories in several countries?',
      extract: {
        title: 'Tesla’s Gigafactories',
        text: 'Tesla builds its electric cars in huge factories known as Gigafactories. Cars for North American buyers are made in the United States, cars for most European buyers are made in Berlin, Germany, and cars for Chinese buyers are made in Shanghai — close to the customers who will buy them.',
      },
      options: [
        'Making cars near the customers who buy them cuts shipping costs and delivery times',
        'Electric cars only work in the countries where they are built',
        'It removes the need to advertise in those markets',
        'Wages and factory costs are identical in every country',
      ],
      correct: 0,
      explain:
        'Multinationals often produce in the regions they sell to. Shipping thousands of finished cars across oceans is expensive and slow, and building locally can also avoid import taxes and trade barriers. Locating production around the world is one of the classic features of globalisation.',
    },
    {
      id: 'p21f',
      type: 'mcq',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'A profitable business wants to fund its expansion. Which of the following is an advantage of using retained profit rather than a bank loan?',
      options: [
        'It must be repaid within 30 days',
        'The bank charges interest on it every month',
        'It increases the business’s debts',
        'No interest is paid and there is nothing to repay — the money is already the business’s own',
      ],
      correct: 3,
      explain:
        'Retained profit is profit kept back in the business, so it is an internal source of finance: using it costs nothing and adds no debt. A loan, by contrast, must be repaid with interest even if the expansion goes badly — though a business can only use retained profit if it has actually made profits to keep.',
    },
    {
      id: 'p21g',
      type: 'term',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for an agreement in which two separate businesses agree to combine to form a single business?',
      accept: ['merger', 'a merger', 'mergers'],
      explain:
        'A merger is when two businesses agree to join together into one. It differs from a takeover, where one business buys the other — and both are types of inorganic (external) growth.',
    },
    {
      id: 'p21h',
      type: 'term',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the money a company raises by selling new shares to investors — an external source of finance for growth?',
      accept: ['share issue', 'a share issue', 'new share issue', 'share capital', 'issuing shares', 'issuing new shares'],
      explain:
        'A share issue brings in money that never has to be repaid and carries no interest — but the new shareholders own a slice of the business, so the original owners’ control is diluted. When a company sells shares to the public on a stock exchange for the first time, it floats.',
    },
    {
      id: 'p21i',
      type: 'numeric',
      topic: '2.1',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the percentage change in Kettle & Crow’s revenue between last year and this year. Give your answer to the nearest whole number.',
      extract: {
        title: 'Kettle & Crow',
        text: 'Kettle & Crow is a small Sheffield business that designs and prints greeting cards and gifts. Last year its revenue was £480,000. This year, after winning listings in two national retail chains, revenue rose to £600,000. The owners are now weighing up how to finance the next stage of growth.',
      },
      value: 25,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'Percentage change = ((new − original) ÷ original) × 100 = ((£600,000 − £480,000) ÷ £480,000) × 100 = 25%. Revenue grew by a quarter in a single year — fast growth that will need financing.',
    },
    {
      id: 'p21j',
      type: 'numeric',
      topic: '2.1',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate the percentage FALL in the average cost of making one jacket as output rises from 10,000 to 80,000. Give your answer to 1 decimal place.',
      extract: {
        title: 'Wren & Loom',
        text: 'Wren & Loom makes jackets in Manchester. When it produces 10,000 jackets a year, the average cost of making ONE jacket is £4.00. At 80,000 jackets a year, the average cost per jacket falls to £2.50, because the factory’s fixed costs are spread over far more jackets and fabric bought in bulk costs less per metre.',
      },
      value: 37.5,
      tol: 0.25,
      unit: '%',
      dp: 1,
      explain:
        'The fall is £4.00 − £2.50 = £1.50. As a percentage of the original cost: (£1.50 ÷ £4.00) × 100 = 37.5%. Each jacket is 37.5% cheaper to make at the higher output — economies of scale in action.',
    },
    {
      id: 'p21k',
      type: 'term',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for doing what is morally right — such as fair treatment of workers and suppliers — going beyond what the law strictly requires?',
      accept: ['ethical', 'ethics', 'ethical behaviour', 'being ethical', 'ethical behavior'],
      explain:
        'Ethical behaviour means acting morally beyond the legal minimum — paying fair wages, dealing honestly with suppliers, and so on. It can attract customers and make recruitment easier, but it can also raise costs, which is why businesses weigh the two carefully.',
    },
    {
      id: 'p21l',
      type: 'fib',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Integration between two businesses at the SAME stage of production — such as two rival supermarket chains merging — is called ________ integration. What one word completes the term?',
      accept: ['horizontal', 'Horizontal', 'horizontal integration'],
      explain:
        'Horizontal integration combines two businesses at the same stage — two supermarkets, for example. Buying a supplier is backward vertical integration, and buying a distributor or retailer is forward vertical integration.',
    },
    {
      id: 'p21m',
      type: 'fib',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Growth that comes from within the business itself — opening more branches, winning more customers, launching new products — is known as ________ growth. What one word completes the term?',
      accept: ['organic', 'internal', 'Organic', 'Internal'],
      explain:
        'Organic (internal) growth is expansion through the business’s own efforts — new branches, new products, more sales. It is usually slower than buying another business, but the business keeps control and grows at a pace it can afford.',
    },
    {
      id: 'p21n',
      type: 'term',
      topic: '2.1',
      difficulty: 3,
      marks: 1,
      stem: 'What is the term for integration in which a business buys another business at a LATER stage of production, closer to the customer — for example a brewer buying a chain of pubs?',
      accept: ['forward vertical integration', 'forward integration', 'forward vertical', 'Forward vertical integration'],
      explain:
        'Forward vertical integration moves a business TOWARDS its customers — a brewer buying pubs controls how its beer reaches drinkers. Backward vertical integration goes the other way (buying a supplier), and horizontal integration stays at the same stage.',
    },
    {
      id: 'p21o',
      type: 'truefalse',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Once a business has grown successfully, its aims and objectives should stay exactly the same as when it started, forever.',
      answer: false,
      explain:
        'False. Aims change as circumstances change: a new business aims to survive, but a growing one may aim for market share, new markets, or ethical and environmental targets. Objectives should still be SMART, but the goals themselves move on as the business does.',
    },
    {
      id: 'p21p',
      type: 'truefalse',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'In 2011 the outdoor-clothing brand Patagonia placed a full-page advert with the headline “Don’t Buy This Jacket”, urging customers not to buy things they do not need.',
      answer: true,
      explain:
        'True. On Black Friday 2011, Patagonia ran the famous advert asking customers to think twice before consuming. It put the environment ahead of short-term sales — and in 2022 the founder went further, giving the company away so its profits fund environmental causes.',
    },
  ],
};

export default def;

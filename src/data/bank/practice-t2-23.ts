// gcsebusiness question bank — PRACTICE pool, Topic 2.3 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-2-3',
  title: 'Production, Quality & Suppliers',
  blurb: 'Production methods, productivity, automation, stock, suppliers, quality and location — featuring Amazon’s warehouse robots, Nando’s and JD Wetherspoon.',
  theme: 2,
  topics: ['2.3'],
  audience: 'practice',
  questions: [
    {
      id: 'p23a',
      type: 'mcq',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'A tailor measures one customer and hand-cuts a suit to that customer’s exact shape — one suit at a time, priced in hundreds of pounds. Which production method is this?',
      options: [
        'Batch production',
        'Job production',
        'Flow production',
        'Just-in-time',
      ],
      correct: 1,
      explain:
        'Job production makes one-off, customised items to the customer’s specification. It needs high skill and commands a high price, but it is slow — the opposite of flow production’s thousands of identical units an hour.',
    },
    {
      id: 'p23b',
      type: 'mcq',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'At a bottling plant, identical bottles move along a line that fills, caps, labels and packs them without stopping, thousands an hour. Which production method is this?',
      options: [
        'Job production',
        'Batch production',
        'Flow production',
        'Quality assurance',
      ],
      correct: 2,
      explain:
        'Flow (line) production is continuous mass production of identical items. Unit costs are very low because the line never stops — but the system is inflexible and hugely expensive to set up, so it only suits products made in enormous volumes.',
    },
    {
      id: 'p23c',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study and the diagram, which of the following best describes the effect of automation on Amazon’s warehouses?',
      extract: {
        title: 'Amazon’s robots',
        text: 'Amazon uses more than 750,000 robots in its warehouses — robots carry heavy shelves of goods to human pickers, and some sort and pack items. Amazon employs over 1.5 million people worldwide, and says the robots make its warehouses safer and its deliveries faster and cheaper.',
      },
      diagram: 'automation',
      options: [
        'Deliveries have become slower and more expensive',
        'The warehouses now need no human workers at all',
        'More stock is stored than ever before',
        'Orders are picked and moved faster, at a lower cost per order',
      ],
      correct: 3,
      explain:
        'Automation raises productivity — more output per worker — and improves consistency, cutting the cost of each order. Robots and people work side by side: some tasks disappear, but new ones appear, which is why retraining staff matters so much after new technology arrives.',
    },
    {
      id: 'p23d',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'A restaurant is choosing a supplier for fresh fish. Which of the following should matter most in the decision?',
      options: [
        'Reliability — the fish arriving fresh, on time, every single day',
        'The supplier with the biggest lorry fleet',
        'A supplier who also supplies the restaurant next door',
        'The cheapest supplier, whatever the quality',
      ],
      correct: 0,
      explain:
        'In procurement, reliability and quality beat the lowest price: a late or poor delivery costs sales and reputation worth far more than the money saved. That is why businesses build long-term relationships with trusted suppliers rather than switching for pennies.',
    },
    {
      id: 'p23e',
      type: 'mcq',
      topic: '2.3',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which of the following best explains why quality matters so much to a restaurant chain such as Nando’s?',
      extract: {
        title: 'Nando’s',
        text: 'Nando’s, the restaurant chain, says its chicken is delivered fresh — never frozen — to its restaurants. On arrival, deliveries are checked to make sure the food has stayed cold, and every restaurant follows the same preparation routines, so customers get the same standard wherever they eat.',
      },
      options: [
        'Quality only matters for products sold in shops',
        'One lapse in food safety or standards can damage the whole brand across every restaurant',
        'Inspection is free, so there is no reason not to do it',
        'Customers cannot tell the difference anyway',
      ],
      correct: 1,
      explain:
        'In a chain, every restaurant shares one reputation: a single failure with food safety becomes “Nando’s made people ill”, not “one branch slipped up”. Consistent quality across all locations is the whole point of a chain’s systems — and with food, a serious lapse can bring legal consequences too.',
    },
    {
      id: 'p23f',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which of the following best explains the attraction of Wetherspoon’s approach to location?',
      extract: {
        title: 'JD Wetherspoon',
        text: 'JD Wetherspoon, one of Britain’s biggest pub chains, often opens its pubs in converted buildings — old banks, cinemas and post offices — usually in town centres, where people pass by all day and into the evening.',
      },
      options: [
        'Out-of-town sites are always cheaper to rent',
        'Rural sites attract more customers than towns',
        'Purpose-built new buildings are always the cheapest option',
        'Town-centre sites get heavy footfall, and converting old buildings can cost less than building new',
      ],
      correct: 3,
      explain:
        'For a pub, footfall is everything — being where people pass all day is worth paying for. Converting a characterful old building can also cost less than building from scratch, and an unusual building (a former bank, say) becomes a talking point in its own right.',
    },
    {
      id: 'p23g',
      type: 'term',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for how much a business produces for each worker — a key measure of efficiency?',
      accept: ['productivity', 'labour productivity', 'output per worker', 'output per hour'],
      explain:
        'Productivity is output per worker (or per hour). Raise it and the cost of producing each unit falls — through better training, better organisation or better technology. Compare it year on year, and with rivals, to judge whether operations are improving.',
    },
    {
      id: 'p23h',
      type: 'term',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the time between placing an order with a supplier and the goods arriving?',
      accept: ['lead time', 'leadtime', 'lead times', 'the lead time'],
      explain:
        'Lead time drives stock decisions: the longer goods take to arrive, the earlier they must be ordered. It sits at the heart of the re-order level formula — usage per day multiplied by lead time in days, plus buffer stock.',
    },
    {
      id: 'p23i',
      type: 'term',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of the stock system in which materials arrive exactly when they are needed, so almost no stock is stored?',
      accept: ['just in time', 'just-in-time', 'JIT', 'jit'],
      explain:
        'Just-in-time (JIT) keeps stock levels near zero: materials arrive the moment production needs them. It cuts storage costs and waste to a minimum — but with no buffer, a single late delivery can bring the whole production line to a halt.',
    },
    {
      id: 'p23j',
      type: 'fib',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'An ice-cream factory makes 500 tubs of vanilla, then stops, cleans the machines and re-sets them before making 500 tubs of chocolate. Making groups of identical items together like this is called ________ production. What one word completes the term?',
      accept: ['batch', 'Batch', 'batches'],
      explain:
        'Batch production makes groups of identical items, switching between them with a changeover in between. It is more flexible than flow production but the cleaning and re-setting between batches takes time that continuous lines never waste.',
    },
    {
      id: 'p23k',
      type: 'fib',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'Using machines and robots to do work that people used to do is called ________. What one word completes the sentence?',
      accept: ['automation', 'Automation', 'automating'],
      explain:
        'Automation means machines doing work once done by people. It can transform productivity and consistency, but it costs money up front and changes the jobs that remain — staff may need retraining to work alongside the new technology.',
    },
    {
      id: 'p23l',
      type: 'truefalse',
      topic: '2.3',
      difficulty: 3,
      marks: 1,
      stem: 'In quality control, finished products are inspected at the end of the process; in quality assurance, quality is checked at every stage as the work is done.',
      answer: true,
      explain:
        'True. Control catches faults after they are made — by then, the faulty goods are waste. Assurance builds quality in at every stage, catching problems when they are cheapest to fix. Total quality management goes further still, making every employee responsible for quality.',
    },
    {
      id: 'p23m',
      type: 'truefalse',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'Because automation reduces the number of workers a factory needs, it always increases unemployment in the whole economy.',
      answer: false,
      explain:
        'False — “always” claims like this are the trap. Automation changes jobs rather than simply destroying them: new roles appear designing, maintaining and supervising the machines. Individual workers can still lose out badly, which is why retraining matters — but the economy-wide effect is not automatic.',
    },
    {
      id: 'p23n',
      type: 'numeric',
      topic: '2.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate Pinegrove Joinery’s labour productivity last year, in chairs per worker. Give your answer as a whole number.',
      extract: {
        title: 'Pinegrove Joinery',
        text: 'Pinegrove Joinery makes wooden chairs in a single workshop. Last year its 48 employees made 9,600 chairs in total. The owner wants to know whether the business is becoming more efficient before investing in new machinery.',
      },
      value: 200,
      tol: 0.5,
      unit: 'units',
      dp: 0,
      explain:
        'Labour productivity = total output ÷ number of employees = 9,600 ÷ 48 = 200 chairs per worker. Comparing this figure year on year — and with rivals — shows whether the workshop is genuinely becoming more efficient.',
    },
    {
      id: 'p23o',
      type: 'numeric',
      topic: '2.3',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate Tandem Toys’ re-order level for packaging boxes. Give your answer as a whole number of boxes.',
      extract: {
        title: 'Tandem Toys',
        text: 'Tandem Toys makes wooden toys. It uses 40 boxes of packaging per day. Its supplier takes 3 days to deliver each order (the lead time), and Tandem keeps a buffer stock of 60 boxes in case a delivery is late or demand jumps. The owner re-orders when stock falls to the re-order level.',
      },
      value: 180,
      tol: 0.5,
      unit: 'units',
      dp: 0,
      explain:
        'Re-order level = (average daily usage × lead time in days) + buffer stock = (40 × 3) + 60 = 180 boxes. When stock falls to 180, a new order must be placed — any later and the next delivery would arrive after the buffer had run out.',
    },
    {
      id: 'p23p',
      type: 'term',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the whole network of firms — suppliers, makers, distributors and retailers — that brings a product from raw materials to the customer?',
      accept: ['supply chain', 'the supply chain', 'supply chains', 'supply network'],
      explain:
        'The supply chain links everyone from raw material to final sale. A weak link — one unreliable supplier — hits every business downstream, which is why firms care about their suppliers’ quality and reliability, not just their prices.',
    },
  ],
};

export default def;

// gcsebusiness question bank — Making Operational Decisions (Topic 2.3)
// Author: gcsebusiness content team. Fictional firm figures are internally consistent.

import type { QuizDef } from '@/lib/bank';

const operations: QuizDef = {
  id: 'operations',
  title: 'Business Operations & Quality',
  blurb: 'Job, batch and flow production, productivity, stock control, suppliers, quality management and the sales process.',
  theme: 2,
  topics: ['2.3'],
  questions: [
    {
      id: 'op1',
      type: 'mcq',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'A bakery makes a single wedding cake to the customer’s own design, with hand-modelled sugar flowers and a personalised inscription. Which production method is this?',
      options: [
        'Batch production',
        'Job production',
        'Flow production',
        'Just-in-time production',
      ],
      correct: 1,
      explain:
        'Job production makes one-off items to the customer’s specification. It needs skilled workers and takes longer, so the cost per unit is high — but the customer pays a high price for a unique product.',
    },
    {
      id: 'op2',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'A bakery makes 300 white loaves, then stops, cleans the mixers and re-sets the machines before making 300 wholemeal loaves. What production method is this?',
      options: [
        'Job production',
        'Batch production',
        'Flow (line) production',
        'One-off production',
      ],
      correct: 1,
      explain:
        'Batch production makes identical items in groups, with a changeover (cleaning or re-setting machines) between each batch. It is more flexible than flow production but less productive, because production stops between batches.',
    },
    {
      id: 'op3',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which production method does the case study describe?',
      extract: {
        title: 'Cadbury and Mars',
        text: 'Cadbury and Mars each make millions of chocolate bars a year. The bars are identical, and they move continuously along production lines — mixing, moulding, wrapping and boxing happen without the line stopping.',
      },
      options: [
        'Single-item job production',
        'Batch production',
        'Flow (line) production',
        'One-off production',
      ],
      correct: 2,
      explain:
        'Flow (line) production runs continuously, making huge numbers of identical items such as Cadbury and Mars bars at a very low unit cost. The downside is inflexibility: the line is expensive to set up and cannot easily switch to a different product.',
    },
    {
      id: 'op4',
      type: 'mcq',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'Which formula gives LABOUR PRODUCTIVITY?',
      options: [
        'Total output ÷ number of employees',
        'Number of employees ÷ total output',
        'Total output × number of employees',
        'Total revenue ÷ number of employees',
      ],
      correct: 0,
      explain:
        'Labour productivity = output ÷ number of employees. It measures how much each worker produces on average; higher productivity lowers the labour cost of each unit.',
    },
    {
      id: 'op5',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is the most likely reason Amazon uses robots in its warehouses?',
      extract: {
        title: 'Amazon warehouses',
        text: 'Amazon’s fulfilment centres use robots that carry shelves of products across the warehouse floor to human workers, who pick the items for each customer order. The robots work alongside thousands of employees.',
      },
      diagram: 'automation',
      options: [
        'It means Amazon no longer needs any employees in its warehouses',
        'Robots raise productivity and reliability, cutting the cost of each order',
        'Robots never break down or need any maintenance at all',
        'Robots can design and launch brand-new products by themselves',
      ],
      correct: 1,
      explain:
        'Automation raises output per worker and consistency while lowering unit costs — robots work constantly and make fewer handling errors. People are still needed to pick and pack orders, and robots do need maintenance.',
    },
    {
      id: 'op6',
      type: 'term',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'What is the name for the extra stock a business keeps in reserve, in case a delivery arrives late or demand suddenly rises?',
      accept: ['buffer stock', 'buffer', 'buffer stocks', 'safety stock'],
      explain:
        'Buffer stock is a reserve kept above the normal amount of stock on hand, protecting the business if a delivery is late or demand jumps. The cost is cash tied up, storage space, and the risk of damage or goods going out of date.',
    },
    {
      id: 'op7',
      type: 'truefalse',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'Holding a large reserve of stock ties up cash that could be used elsewhere in the business.',
      answer: true,
      explain:
        'True — stock sitting on shelves has already been paid for, so it ties up cash, needs space, and can be damaged, stolen or go out of date. That is the trade-off for the protection a reserve provides.',
    },
    {
      id: 'op8',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is the biggest risk of the stock approach described in the case study?',
      extract: {
        title: 'Toyota',
        text: 'Toyota pioneered just-in-time (JIT) stock control. Parts arrive at the factory only a short time before they are needed on the production line, so Toyota holds very little stock.',
      },
      options: [
        'Storage costs become far higher than keeping a reserve of stock',
        'The business builds up large amounts of unwanted stock instead',
        'Products take months to reach customers after ordering',
        'A late delivery from a supplier can stop the whole production line',
      ],
      correct: 3,
      explain:
        'With almost no spare stock, any supply problem — a strike, a storm or a delayed lorry — can halt production immediately. In return, JIT saves storage costs, frees up cash and cuts waste.',
    },
    {
      id: 'op9',
      type: 'fib',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'A café always places a new order for coffee beans when its stock falls to 10kg. The 10kg point is known as the re-order __________. What one word completes the term?',
      accept: ['level', 'point'],
      explain:
        'The re-order level is the stock level at which a new order is placed — 10kg for the café. It must be high enough for new stock to arrive before the old stock runs out, taking account of delivery time and expected sales.',
    },
    {
      id: 'op10',
      type: 'mcq',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'Procurement means buying in the goods and services a business needs. Which of the following is a risk of depending on a single supplier?',
      options: [
        'A fire or strike at that supplier could leave the business unable to get what it needs',
        'It is impossible to build a long-term relationship with one single supplier',
        'A single supplier can never offer any discounts for bulk buying',
        'Managing one supplier is always more expensive than managing five of them',
      ],
      correct: 0,
      explain:
        'A single supplier that fails, raises its prices or delivers late leaves the business with no alternative source. Many firms therefore use more than one supplier, balancing the risk against the simpler administration of a single relationship.',
    },
    {
      id: 'op11',
      type: 'mcq',
      topic: '2.3',
      difficulty: 3,
      marks: 1,
      stem: 'What is the key difference between quality control and quality assurance?',
      options: [
        'Quality control happens before production starts; quality assurance happens afterwards',
        'Quality control applies to services only; quality assurance applies to goods only',
        'Quality control inspects at the end; quality assurance checks every stage',
        'They are simply two names for exactly the same thing',
      ],
      correct: 2,
      explain:
        'Quality control inspects finished products at the end, so faults are found late and wastage is high. Quality assurance builds checks into every stage of production, preventing faults rather than catching them.',
    },
    {
      id: 'op12',
      type: 'term',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of the approach to quality in which every single employee is made responsible for quality, not just inspectors?',
      accept: ['total quality management', 'tqm'],
      explain:
        'Total Quality Management (TQM) makes quality the responsibility of every employee, from the shop floor to the boardroom — not just inspectors. Everyone is encouraged to spot and prevent faults rather than catch them at the end.',
    },
    {
      id: 'op13',
      type: 'term',
      topic: '2.3',
      difficulty: 2,
      marks: 1,
      stem: 'What is the Japanese term, meaning "continuous improvement", for the approach in which every employee is encouraged to suggest small improvements to how things are done?',
      accept: ['kaizen', 'continuous improvement', 'kaizen continuous improvement'],
      explain:
        'Kaizen is Japanese for "continuous improvement": employees suggest small improvements to their own work, and these build into big gains in quality and efficiency over time. It is central to how firms like Toyota manage quality.',
    },
    {
      id: 'op14',
      type: 'mcq',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'While a customer is still choosing, an online shop answers her questions instantly through a live chat window with a real adviser. To which part of the sales process does this belong?',
      options: ['Pre-sale', 'The sale itself', 'Post-sale', 'Production'],
      correct: 0,
      explain:
        'The sales process runs pre-sale (answering enquiries and advising the customer), through the sale itself (demonstrating and closing the deal), to post-sale (delivery, installation and after-sales support). Live chat before a purchase is pre-sale customer service.',
    },
    {
      id: 'op15',
      type: 'mcq',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'Which part of the sales process covers delivery, installation and after-sales support such as help lines and repairs?',
      options: ['Pre-sale', 'Post-sale', 'The sale itself', 'Procurement'],
      correct: 1,
      explain:
        'Post-sale service covers everything after the customer pays — delivery, installation, help lines, repairs and returns. Good after-sales service turns one-off buyers into repeat customers who recommend the business.',
    },
    {
      id: 'op16',
      type: 'fib',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'After a purchase, online shops invite customers to leave a written __________ so that future buyers can judge the product and the seller. What one word completes the sentence?',
      accept: ['review', 'reviews', 'rating', 'ratings'],
      explain:
        'Reviews are part of the post-sale stage of the sales process: they give the seller feedback and help future customers decide. Good reviews work like free promotion; bad ones spread quickly and can put buyers off.',
    },
    {
      id: 'op17',
      type: 'truefalse',
      topic: '2.3',
      difficulty: 1,
      marks: 1,
      stem: 'A business’s responsibility for good customer service ends as soon as the customer has paid.',
      answer: false,
      explain:
        'False — post-sale service (delivery, installation, support and easy returns) is what builds repeat custom and recommendations, so it matters just as much as making the sale itself.',
    },
    {
      id: 'op18',
      type: 'numeric',
      topic: '2.3',
      difficulty: 2,
      marks: 2,
      stem: 'Using the figures in the case study, calculate labour productivity at Halstead Manufacturing last year, in units per worker. Give your answer as a whole number.',
      extract: {
        title: 'Halstead Manufacturing',
        text: 'Halstead Manufacturing makes kitchen units. Last year its factory produced 24,000 units with a workforce of 30 employees. The operations director wants a simple measure of how productive the workforce is.',
      },
      value: 800,
      tol: 0.5,
      unit: 'units',
      dp: 0,
      explain:
        'Labour productivity = output ÷ number of employees = 24,000 ÷ 30 = 800 units per worker. Producing more output with the same workers — or the same output with fewer workers — would raise productivity.',
    },
  ],
};

export default operations;

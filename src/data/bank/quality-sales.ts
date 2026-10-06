// gcsebusiness question bank — sub-topic fillers: Quality, sales & training
// Fills the 2.3.3 (Managing quality), 2.3.4 (The sales process) and 2.5.3 (Training) gaps.
// 2.3.3 ×3 (control vs assurance) · 2.3.4 ×4 (stages + service) · 2.5.3 ×3 (methods, why, retraining).

import type { QuizDef } from '@/lib/bank';

const qualitysales: QuizDef = {
  id: 'qualitysales',
  title: 'Quality, sales & training',
  blurb: 'Quality control against quality assurance, the stages of the sales process and the training that keeps staff and customers on side.',
  theme: 2,
  topics: ['2.3', '2.5'],
  audience: 'assignment',
  questions: [
    {
      id: 'qs1',
      type: 'mcq',
      topic: '2.3',
      subtopic: '2.3.3',
      difficulty: 3,
      marks: 1,
      stem: 'A pottery factory inspects only finished plates at the end of the line, and rejects are smashed. Why would checking the clay, the kiln temperature and the glaze at every stage instead cut its waste costs?',
      options: [
        'It hides faults until customers complain instead',
        'Faults are caught early, before more money is wasted',
        'It removes the need to train any employees',
        'It employs inspectors only at the very end',
      ],
      correct: 1,
      explain:
        'This is quality assurance replacing quality control: spotting a fault at the clay stage costs far less than discovering it after firing, glazing and inspecting the finished plate. Preventing faults beats detecting them — less scrap, lower costs.',
    },
    {
      id: 'qs2',
      type: 'fib',
      topic: '2.3',
      subtopic: '2.3.3',
      difficulty: 1,
      marks: 1,
      stem: 'When a product is fit for purpose, reliable and does exactly what it promises, customers say it has ________. What one word completes the sentence?',
      accept: ['quality', 'good quality', 'high quality'],
      explain:
        'Quality means meeting customers’ expectations consistently — fitness for purpose and reliability. Poor quality brings returns, complaints and a damaged reputation, so it matters every bit as much as price.',
    },
    {
      id: 'qs3',
      type: 'truefalse',
      topic: '2.3',
      subtopic: '2.3.3',
      difficulty: 1,
      marks: 1,
      stem: 'Consistently high quality can give a business a competitive advantage, because satisfied customers come back and recommend it to others.',
      answer: true,
      explain:
        'True. Quality that rivals cannot match keeps customers returning and spreads word-of-mouth recommendations — a genuine competitive advantage. It also cuts the cost of returns and rework, protecting margins.',
    },
    {
      id: 'qs4',
      type: 'mcq',
      topic: '2.3',
      subtopic: '2.3.4',
      difficulty: 1,
      marks: 1,
      stem: 'Why does product knowledge matter in the sales process?',
      options: [
        'Staff can advise confidently and match products to customers',
        'Staff can avoid speaking to customers altogether',
        'It lets staff charge every customer the highest price',
        'It replaces the need for any after-sales service',
      ],
      correct: 0,
      explain:
        'Knowing the product inside out lets staff answer questions, suggest the right model and close the sale with confidence — customers trust well-informed advisers. It underpins good customer engagement.',
    },
    {
      id: 'qs5',
      type: 'fib',
      topic: '2.3',
      subtopic: '2.3.4',
      difficulty: 1,
      marks: 1,
      stem: 'After each sale, a shop invites customers to rate their experience and posts replies to their comments. Acting on what customers tell you is called responding to customer ________. What one word completes the sentence?',
      accept: ['feedback', 'feed back', 'customer feedback', 'reviews'],
      explain:
        'Customer feedback — ratings, surveys and comments — tells a business what is working and what needs fixing. Responding to it visibly shows customers their views matter, which builds loyalty.',
    },
    {
      id: 'qs6',
      type: 'mcq',
      topic: '2.3',
      subtopic: '2.3.4',
      difficulty: 2,
      marks: 1,
      stem: 'A sandwich bar halves the time its lunchtime queue takes to serve each customer after retraining its staff. Why does speed and efficiency of service matter so much at lunchtime?',
      options: [
        'Lunchtime customers have all afternoon to queue',
        'Fast service lets the staff take longer breaks',
        'Queues drive hurried lunchtime customers to rivals',
        'Speed of service matters only for online orders',
      ],
      correct: 2,
      explain:
        'Speed and efficiency of service is part of the sales process: at busy times, long queues send customers to rivals and cut the number served per hour. Faster service wins repeat custom and raises revenue at peak times.',
    },
    {
      id: 'qs7',
      type: 'mcq',
      topic: '2.3',
      subtopic: '2.3.4',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is the most likely consequence of consistently poor customer service?',
      options: [
        'Customers happily pay more for the same treatment',
        'The business gains free word-of-mouth promotion',
        'Sales stay the same, because service does not matter',
        'Customers move their spending to rivals and warn others',
      ],
      correct: 3,
      explain:
        'Poor service drives customers to competitors and generates negative word of mouth — both hit sales. Good service does the opposite: repeat purchases and recommendations are the cheapest sales a business ever wins.',
    },
    {
      id: 'qs8',
      type: 'mcq',
      topic: '2.5',
      subtopic: '2.5.3',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is an advantage of off-the-job training?',
      options: [
        'It costs nothing, because colleges train staff for free',
        'Staff learn from expert trainers away from workplace pressure',
        'Mistakes made during training land on real customers',
        'Staff never miss a moment of their normal work',
      ],
      correct: 1,
      explain:
        'Off-the-job training — courses or college days — brings expert teaching and lets staff practise without risking real customers’ orders. The trade-offs are the cost of the course and the time away from the job.',
    },
    {
      id: 'qs9',
      type: 'mcq',
      topic: '2.5',
      subtopic: '2.5.3',
      difficulty: 3,
      marks: 1,
      stem: 'Which of the following best explains why training helps a business RETAIN its employees?',
      options: [
        'Trained staff feel valued, so they are likelier to stay',
        'Training contracts make it illegal for staff to resign',
        'Trained staff must legally be paid below the market rate',
        'Training only ever benefits the employee, never the firm',
      ],
      correct: 0,
      explain:
        'Training links to motivation and retention: staff who learn new skills feel valued and can see a future with the business, so they quit less often. Lower staff turnover saves the cost of recruiting and inducting replacements.',
    },
    {
      id: 'qs10',
      type: 'mcq',
      topic: '2.5',
      subtopic: '2.5.3',
      difficulty: 2,
      marks: 1,
      stem: 'A hotel installs self-check-in kiosks and sends its reception staff on a course to learn the new system and help guests use it. What is this course an example of?',
      options: [
        'Induction — welcoming brand-new employees',
        'Job rotation — moving staff between different tasks',
        'Retraining — existing staff learning new skills',
        'Delayering — removing layers of management',
      ],
      correct: 2,
      explain:
        'When technology changes how a job is done, existing employees need retraining — otherwise productivity and service fall and staff resist the change. Budgeting for training is part of introducing any new system.',
    },
  ],
};

export default qualitysales;

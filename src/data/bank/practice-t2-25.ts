// gcsebusiness question bank — PRACTICE pool, Topic 2.5 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-2-5',
  title: 'People: Structure & Motivation',
  blurb: 'Fifteen mixed questions on structure, communication, recruitment, training and motivation — with Herzberg, Deliveroo and a café.',
  theme: 2,
  topics: ['2.5'],
  audience: 'practice',
  questions: [
    {
      id: 'p25a',
      type: 'mcq',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Which of the following is a feature of a tall organisational structure?',
      options: [
        'Few layers, with wide responsibility for each manager',
        'Many layers, with close supervision at each level',
        'No layers at all, with everyone equal',
        'Owners doing all of the work themselves',
      ],
      correct: 1,
      explain:
        'A tall structure stacks many layers of management: each person supervises a small number of juniors, so supervision is close but messages travel slowly. Flat structures have few layers and pass authority down faster.',
    },
    {
      id: 'p25b',
      type: 'mcq',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'A firm promotes its assistant manager to manager. Which of the following is an advantage of filling the post this way?',
      options: [
        'The candidate is a known quantity, so the risk is low',
        'It brings brand-new ideas and experience in from outside',
        'It leaves the assistant’s old post to fill as well',
        'It is always far slower than advertising outside',
      ],
      correct: 0,
      explain:
        'Promoting from within is quick, cheap and low-risk: the person’s work is already known and they know the business. The costs are no fresh ideas from outside — and another vacancy to fill below.',
    },
    {
      id: 'p25c',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a barrier to communication rather than a channel of communication?',
      options: [
        'A staff meeting held every Monday morning',
        'A notice pinned up in the staff break room',
        'Jargon that the receiver cannot understand',
        'An emailed report sent out to everyone weekly',
      ],
      correct: 2,
      explain:
        'Jargon, overload and the wrong channel are classic barriers: the message is sent but cannot be decoded. Meetings, notices and emails are channels — the routes messages travel down.',
    },
    {
      id: 'p25d',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a drawback of on-the-job training?',
      options: [
        'Trainees never see the actual workplace at all',
        'It costs more than sending staff on courses',
        'Colleagues always refuse to pass on skills',
        'Errors by trainees happen in front of customers',
      ],
      correct: 3,
      explain:
        'On-the-job training is cheap and real, but learners make real mistakes with real customers. Off-the-job courses cost more and take people away, yet teach in a safer, controlled setting.',
    },
    {
      id: 'p25e',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'According to Herzberg, which of the following is a motivator rather than a hygiene factor?',
      options: [
        'The base level of pay',
        'A safe, comfortable workplace',
        'Recognition for achievement',
        'The firm’s sick-pay policy',
      ],
      correct: 2,
      explain:
        'Herzberg called pay, conditions and policies hygiene factors: they stop people being unhappy but cannot make them keen. Motivators — recognition, achievement, responsibility — are what make people want to push harder.',
    },
    {
      id: 'p25f',
      type: 'mcq',
      topic: '2.5',
      difficulty: 3,
      marks: 1,
      stem: 'Many Deliveroo riders are self-employed with no guaranteed hours. Which of the following is the strongest criticism of this arrangement?',
      options: [
        'Riders are forced to work for absolutely nothing',
        'The arrangement is illegal across the UK',
        'Riders are never allowed to choose their own hours',
        'Quiet nights mean no pay, no sick pay, no security',
      ],
      correct: 3,
      explain:
        'The gig-economy deal gives riders flexibility over when to log in — but it also shifts all the risk onto them: a quiet week means no income, and benefits like sick pay never arrive. Critics say that trade is one-sided; the firms say riders choose it.',
    },
    {
      id: 'p25g',
      type: 'term',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for the number of employees one manager is directly responsible for?',
      accept: ['span of control', 'the span of control'],
      explain:
        'The span of control is how many people report to one manager: narrow at the top of tall structures, wide in flat ones. The wider it becomes, the more authority each manager must pass downwards.',
    },
    {
      id: 'p25h',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for passing authority down the hierarchy so that a subordinate makes the decision, rather than every decision going up?',
      accept: ['delegation', 'delegating', 'delegate'],
      explain:
        'Delegation hands authority downwards: the manager stays accountable but the subordinate decides. It speeds decisions, grows people’s skills and frees managers — though a poor handover stores up trouble.',
    },
    {
      id: 'p25i',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for removing one or more layers of management from a structure, usually to cut costs and speed up decisions?',
      accept: ['delayering', 'delayer', 'de-layering'],
      explain:
        'Delayering strips out layers of management: decisions travel further in fewer steps and the wage bill falls. Survivors often feel less secure, and the remaining managers’ workloads can balloon.',
    },
    {
      id: 'p25j',
      type: 'fib',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Training given to a new starter in their first days — showing them round, explaining procedures and health and safety — is called ________ training. What one word completes the sentence?',
      accept: ['induction'],
      explain:
        'Induction is a new employee’s first-days training: the tour, the rules, the systems and the people. Done well it settles starters quickly and cuts early mistakes.',
    },
    {
      id: 'p25k',
      type: 'fib',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'A contract that offers no guaranteed minimum hours, calling staff in only when work exists, is called a ________. What three-word term completes the sentence?',
      accept: ['zero hours contract', 'zero-hours contract', 'zero hour contract'],
      explain:
        'A zero-hours contract guarantees no hours at all: staff are called in when demand exists. Supporters value the flexibility; critics point to the missing security, sick pay and benefits.',
    },
    {
      id: 'p25l',
      type: 'numeric',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'A café employs 4 staff, each paid £11 per hour for a 35-hour week. Calculate the café’s total weekly wage bill for these staff. Give your answer in pounds to the nearest pound.',
      value: 1540,
      tol: 0.5,
      unit: '£',
      dp: 0,
      explain:
        'Each member of staff costs £11 × 35 = £385, so four of them cost 4 × £385 = £1540 for the week.',
    },
    {
      id: 'p25m',
      type: 'truefalse',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Piece rates pay every worker exactly the same wage regardless of how much they produce.',
      answer: false,
      explain:
        'False. Piece rates pay by the unit produced, so fast and accurate workers earn more than slow ones. They suit easily measured output, but can rush quality if set badly.',
    },
    {
      id: 'p25n',
      type: 'truefalse',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Remote working grew sharply after 2020, helped by video calls and cloud tools.',
      answer: true,
      explain:
        'True. Home working spread almost overnight in 2020 and has stayed popular: it widens the pool of talent, cuts commutes and office costs, though it needs managing to keep teamwork alive.',
    },
    {
      id: 'p25o',
      type: 'written',
      topic: '2.5',
      difficulty: 3,
      marks: 3,
      stem: 'A growing firm must fill a senior finance post. Justify whether it should promote from within or recruit externally.',
      explain:
        'Promoting from within is quick, cheap and low-risk: the candidate is already known, already trusted and already understands the business — but no new thinking enters, and their old post still needs filling. Recruiting externally widens the pool and brings fresh ideas, networks and proven outside experience, though it is slower, costlier and riskier, and it can dent the morale of passed-over insiders. For a senior finance role where systems and controls must change, the fresh external view probably edges it — provided the firm keeps developing its insiders for the posts below.',
      points: [
        { text: 'Promoting from within is quick, cheap and low-risk — the candidate is known and trusted — but brings no new ideas and leaves their old post to fill.', marks: 1 },
        { text: 'Recruiting externally widens the pool and brings fresh ideas and proven experience — but is slower, costlier, riskier, and can demotivate passed-over insiders.', marks: 1 },
        { text: 'Judgement: for a senior post where systems must change, the external view probably edges it — as long as insiders are still developed for the future.', marks: 1 },
      ],
    },
  ],
};
export default def;

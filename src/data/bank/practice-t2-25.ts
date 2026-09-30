// gcsebusiness question bank — PRACTICE pool, Topic 2.5 (student self-study)

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'practice-2-5',
  title: 'Recruitment, Training & Motivation',
  blurb: 'Structures, communication, ways of working, recruitment, training and motivation — featuring Spotify’s Work From Anywhere policy, Google’s perks, Maslow and Herzberg.',
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
      stem: 'The diagram shows an organisational chart. What is meant by a manager’s span of control?',
      diagram: 'orgchart',
      options: [
        'The number of days the manager works each week',
        'The manager’s salary band',
        'The number of employees who report directly to that manager',
        'The number of meetings the manager chairs',
      ],
      correct: 2,
      explain:
        'Span of control is the number of employees reporting directly to one manager. Tall structures have narrow spans — close supervision but slow communication up and down the layers. Flat structures have wide spans — faster communication and more room for delegation.',
    },
    {
      id: 'p25b',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'At a retail chain, a supervisor cannot approve a refund over £20 — the request must be sent to head office for a decision. Which term describes this way of running the business?',
      options: [
        'Centralisation',
        'Delegation',
        'Delayering',
        'Decentralisation',
      ],
      correct: 0,
      explain:
        'Centralisation keeps decision-making at the top of the hierarchy. It gives consistency and tight control, but head-office approval adds delay — and supervisors who are trusted with nothing can lose motivation. Delegation (or decentralisation) pushes decisions down instead.',
    },
    {
      id: 'p25c',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is an advantage of using application forms rather than CVs when recruiting?',
      options: [
        'Application forms can be completed in any style the candidate likes',
        'Every candidate answers the same questions, so answers are easier to compare fairly',
        'Application forms take longer for managers to read',
        'Candidates can more easily hide gaps in their work history',
      ],
      correct: 1,
      explain:
        'A standard application form puts every candidate’s answers in the same order and format, so nothing important is missed and shortlisting is fairer and quicker. CVs vary wildly — and can be written to hide weaknesses — which makes them harder to compare like-for-like.',
    },
    {
      id: 'p25d',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which of the following is the most likely benefit to Spotify of its Work From Anywhere policy?',
      extract: {
        title: 'Spotify — Work From Anywhere',
        text: 'In 2021 Spotify introduced its Work From Anywhere policy: employees choose to work from an office, from home, or a mix of the two. The company said the aim was to give staff more freedom and to keep hold of the talented people it might otherwise lose to rivals.',
      },
      options: [
        'Every employee is now part-time',
        'It removes the need for online communication tools',
        'It guarantees staff will work longer hours',
        'It helps attract and keep talented staff who value flexibility',
      ],
      correct: 3,
      explain:
        'Flexible and remote working widens the talent pool — the best person for the job may live miles from any office — and helps retain staff who value the freedom. It does demand trust, clear targets and good communication tools to keep everyone working as one team.',
    },
    {
      id: 'p25e',
      type: 'mcq',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which of the following is a NON-FINANCIAL method of motivation?',
      extract: {
        title: 'Perks at Google',
        text: 'Google is famous for treating its staff well: free meals at its offices, on-site gyms and health services, and generous parental leave. The company is regularly named one of the world’s most attractive employers.',
      },
      options: [
        'Praising good work and giving employees more responsibility',
        'Paying staff piece rates',
        'Increasing wages across the board',
        'Sharing a slice of the year’s profit',
      ],
      correct: 0,
      explain:
        'Financial methods — pay rises, piece rates, bonuses, profit sharing — reward staff with money. Non-financial methods cost no wages at all: recognition, responsibility, interesting work, teamworking and good conditions often keep staff engaged long after a pay rise is forgotten.',
    },
    {
      id: 'p25f',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'A hotel sends four receptionists on a one-day customer-service course at a training centre, with tutors and role-plays. Which type of training is this?',
      options: [
        'Induction training',
        'On-the-job training',
        'Off-the-job training',
        'Job rotation',
      ],
      correct: 2,
      explain:
        'Off-the-job training happens away from the workplace, with dedicated time to learn properly. It costs money and takes staff off the rota — but mistakes are made on a role-play customer, not a real one. On-the-job training is cheaper and more practical, but errors can hit genuine customers.',
    },
    {
      id: 'p25g',
      type: 'term',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for passing authority down the hierarchy — giving a subordinate the power to carry out a task or make decisions?',
      accept: ['delegation', 'delegating', 'Delegation'],
      explain:
        'Delegation hands authority downwards, freeing managers’ time and developing staff. Done well, it motivates — people trusted with responsibility usually rise to it — but the manager remains accountable if things go wrong.',
    },
    {
      id: 'p25h',
      type: 'term',
      topic: '2.5',
      difficulty: 3,
      marks: 1,
      stem: 'In Herzberg’s theory, what name is given to factors such as pay and working conditions — which stop staff becoming dissatisfied but do not by themselves create satisfaction?',
      accept: ['hygiene factors', 'hygiene', 'Hygiene factors', 'the hygiene factors'],
      explain:
        'Herzberg called pay, conditions and job security “hygiene factors”: when they are poor, staff are dissatisfied, but improving them only removes the dissatisfaction — it does not create enthusiasm. Real motivation comes from motivators: recognition, achievement, responsibility and the work itself.',
    },
    {
      id: 'p25i',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for giving employees more challenging work and greater responsibility — building satisfaction into the job itself, not just adding more tasks?',
      accept: ['job enrichment', 'enrichment', 'Job enrichment', 'job enriching'],
      explain:
        'Job enrichment redesigns the job so it is more satisfying: more responsibility, more of the whole task, more scope to use judgement. It is not the same as job rotation, which simply moves people between existing tasks to add variety.',
    },
    {
      id: 'p25j',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of the payment method in which workers are paid for each item they produce rather than by the hour?',
      accept: ['piece rate', 'piece rates', 'piece work', 'piecework', 'payment by results'],
      explain:
        'Piece rates tie pay directly to output, which suits workers who are fast — but the rush can damage quality, and slower workers can end up earning too little. Businesses using piece rates usually need careful quality checks alongside them.',
    },
    {
      id: 'p25k',
      type: 'fib',
      topic: '2.5',
      difficulty: 3,
      marks: 1,
      stem: 'The need at the very top of Maslow’s hierarchy — the desire to fulfil your full potential — is called ________. What term completes the sentence?',
      accept: ['self-actualisation', 'self actualisation', 'self-actualization', 'self actualization'],
      explain:
        'Maslow’s hierarchy climbs from physiological needs, through safety, social and esteem needs, to self-actualisation at the top. Lower needs must be broadly met before higher ones motivate — so pay covers the bottom of the pyramid, but the top levels need challenge, recognition and meaningful work.',
    },
    {
      id: 'p25l',
      type: 'fib',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Communication in which the receiver can respond — a conversation rather than a one-way announcement — is called ________ communication. What one word completes the term?',
      accept: ['two-way', 'two way', 'twoway', '2-way', '2 way'],
      explain:
        'Two-way communication lets the sender check the message was understood and hear questions or objections. Without feedback — or when barriers like jargon or information overload get in the way — even a well-meant message can fail completely.',
    },
    {
      id: 'p25m',
      type: 'numeric',
      topic: '2.5',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the percentage increase in the hourly pay of Bloom & Branch’s baristas. Give your answer to the nearest whole number.',
      extract: {
        title: 'Bloom & Branch',
        text: 'Bloom & Branch, a café in Leeds, is raising baristas’ hourly pay from £11.00 to £12.10 from April. The owner says the rise should help keep experienced staff as the café gets busier, and reduce the cost of constantly recruiting and training replacements.',
      },
      value: 10,
      tol: 0.25,
      unit: '%',
      dp: 0,
      explain:
        'The rise is £12.10 − £11.00 = £1.10. As a percentage of the old rate: (£1.10 ÷ £11.00) × 100 = 10%. A 10% pay rise is a costly decision — but if it keeps trained staff, it may still be cheaper than the cost of losing them.',
    },
    {
      id: 'p25n',
      type: 'numeric',
      topic: '2.5',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate how much each of the 8 employees receives from the profit-sharing bonus. Give your answer in pounds as a whole number.',
      extract: {
        title: 'Copper & Crane',
        text: 'Copper & Crane, a workshop that restores furniture, made a profit of £80,000 last year. As a thank-you, the owners share 5% of each year’s profit equally between the 8 employees, on top of their normal wages.',
      },
      value: 500,
      tol: 2,
      unit: '£',
      dp: 0,
      explain:
        '5% of £80,000 = £4,000. Shared equally between 8 employees: £4,000 ÷ 8 = £500 each. Profit sharing gives staff a stake in the business’s success — when profit rises, everyone’s bonus rises with it.',
    },
    {
      id: 'p25o',
      type: 'truefalse',
      topic: '2.5',
      difficulty: 3,
      marks: 1,
      stem: 'In Maslow’s hierarchy, safety needs must be met before esteem needs — such as recognition and status — can fully motivate someone.',
      answer: true,
      explain:
        'True. Maslow argued lower needs come first: someone worried about job security or safety cannot be fully motivated by status and praise. For managers the lesson is diagnosis — find which level is unmet, because a pay rise will not fix a problem of feeling unappreciated.',
    },
    {
      id: 'p25p',
      type: 'truefalse',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Job interviews are completely free from bias, so they are the most reliable possible way to select staff.',
      answer: false,
      explain:
        'False. Interviews are subjective: first impressions, personal likes and dislikes, and unconscious bias all creep in. Structured questions, panels and selection tests reduce bias — but do not remove it — which is why most employers combine interviews with other methods.',
    },
  ],
};

export default def;

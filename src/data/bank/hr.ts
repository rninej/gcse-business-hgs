// Learn Business question bank — Making Human Resource Decisions (Topic 2.5)
// Author: Learn Business content team. Diagram questions reference the Fernfield Foods org chart.

import type { QuizDef } from '@/lib/bank';

const hr: QuizDef = {
  id: 'hr',
  title: 'People & HR',
  blurb: 'Organisational structures, ways of working, recruitment and selection, training, motivation and Herzberg.',
  theme: 2,
  topics: ['2.5'],
  questions: [
    {
      id: 'hr1',
      type: 'mcq',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'The diagram shows the organisational structure of Fernfield Foods Ltd. Who does the Quality Manager report to directly?',
      diagram: 'orgchart',
      options: [
        'The Managing Director',
        'The Operations Director',
        'The Marketing Director',
        'The Production Manager',
      ],
      correct: 1,
      explain:
        'The Quality Manager sits on the bottom layer under the Operations Director, alongside the Production Manager. Working out who reports to whom is exactly what an organisational chart is for.',
    },
    {
      id: 'hr2',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Using the diagram, what is the span of control of the Managing Director at Fernfield Foods?',
      diagram: 'orgchart',
      options: [
        '1 — only the Operations Director',
        '4 — one for each layer of the structure',
        '3 — three directors report directly to the Managing Director',
        '7 — every manager in the business',
      ],
      correct: 2,
      explain:
        'Span of control counts the people who report directly to one manager. The Managing Director has three direct reports: the Operations Director, the Marketing Director and the Finance Director.',
    },
    {
      id: 'hr3',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'The diagram shows that Fernfield Foods has four layers of management. Which of the following is characteristic of a structure like this?',
      diagram: 'orgchart',
      options: [
        'It is a flat structure: few layers with very wide spans of control',
        'It is a tall structure: messages pass through more layers, so communication is slower and supervision is close',
        'Layers make decisions faster because more managers must approve them',
        'A four-layer structure has no chain of command at all',
      ],
      correct: 1,
      explain:
        'Four layers make Fernfield a tall structure: messages travel through several levels, so communication is slower, but supervision is close and control is tight. Flat structures have few layers and wide spans of control.',
    },
    {
      id: 'hr4',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for removing one or more layers of management from an organisational structure?',
      accept: ['delayering', 'de-layering', 'de layering'],
      explain:
        'Delayering removes layers of management, cutting the wage bill and shortening lines of communication. The risks are that remaining managers get wider spans of control, and job losses can demotivate the staff who stay.',
    },
    {
      id: 'hr5',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'A supervisor retires, and the business fills the vacancy by promoting one of its existing shop-floor workers. Which of the following is an advantage of filling the vacancy this way?',
      options: [
        'It is always slower than advertising outside the business',
        'It brings in completely fresh ideas from outside',
        'The candidate is already known to the business and understands how it works',
        'It creates no extra vacancy anywhere in the business',
      ],
      correct: 2,
      explain:
        'Internal recruitment (promotion or transfer) is quicker and cheaper, and the person’s ability is already known. The drawbacks are that no new ideas arrive from outside — and promoting someone leaves another vacancy to fill.',
    },
    {
      id: 'hr6',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of the document that lists the duties and responsibilities of the job being advertised?',
      accept: ['job description', 'job descriptions'],
      explain:
        'A job description sets out the duties and responsibilities of the role. Do not confuse it with a person specification, which lists the skills, experience and qualities the ideal candidate needs.',
    },
    {
      id: 'hr7',
      type: 'fib',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'A __________ specification lists the skills, qualifications and personal qualities the ideal candidate needs for a job. What one word completes the term?',
      accept: ['person', 'personal'],
      explain:
        'The person specification describes the ideal candidate — their skills, qualifications and qualities. It gives the business clear criteria to score applicants against, and it is different from the job description, which describes the job itself.',
    },
    {
      id: 'hr8',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'To choose between final candidates, a business invites them to spend a day completing group tasks, presentations and written tests so they can be compared directly. What is this selection method called?',
      options: [
        'An induction day',
        'A job fair',
        'An assessment centre',
        'A training course',
      ],
      correct: 2,
      explain:
        'An assessment centre puts candidates through practical exercises so the business can compare how they actually perform, rather than relying only on interviews. Interviews, tests and references remain the most widely used selection methods.',
    },
    {
      id: 'hr9',
      type: 'term',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for the training a new employee receives in their first days, introducing the business, its rules and its people?',
      accept: ['induction', 'induction training', 'an induction', 'the induction'],
      explain:
        'Induction is a new starter’s introduction to the business — its rules, systems, safety and people. Good induction helps new staff settle in quickly and make fewer early mistakes.',
    },
    {
      id: 'hr10',
      type: 'truefalse',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'On-the-job training takes place away from the workplace, at a college or training centre.',
      answer: false,
      explain:
        'False — that describes off-the-job training, such as college courses. On-the-job training happens while the employee does their normal work, usually guided by an experienced colleague: cheaper and practical, but mistakes can affect real customers.',
    },
    {
      id: 'hr11',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'An engineer explains a machine fault using technical language, and the sales team completely misunderstands the message. Which barrier to communication is this?',
      options: [
        'Jargon — language the audience does not share',
        'Information overload — too much detail at once',
        'The wrong medium — the message was sent the wrong way',
        'A physical barrier such as noise',
      ],
      correct: 0,
      explain:
        'Jargon is specialist or technical language that the audience may not share. Other barriers include information overload, sending a message by the wrong channel, and physical barriers such as noise.',
    },
    {
      id: 'hr12',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Which term best describes the way of working in the case study?',
      extract: {
        title: 'Deliveroo',
        text: 'Deliveroo delivers restaurant meals using riders on bicycles and scooters. Riders choose when to work by switching on the app, and they are paid for each delivery they complete. Deliveroo treats its riders as self-employed.',
      },
      options: [
        'A zero-hours contract',
        'Full-time employment',
        'A job share',
        'The gig economy',
      ],
      correct: 3,
      explain:
        'The gig economy is flexible, app-based work paid per task — each delivery is a "gig". Riders are self-employed, so they choose their hours but receive no sick pay or holiday pay, which critics say leaves them insecure.',
    },
    {
      id: 'hr13',
      type: 'fib',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Since 2020, many employees have worked from home for at least part of the week instead of commuting to an office. This is known as __________ working. What one word completes the sentence?',
      accept: ['remote', 'home'],
      explain:
        'Remote (home) working means doing the job away from the employer’s premises, using technology to keep in touch. It saves commuting and widens the pool of talent a business can recruit, but it can make teamwork and communication harder.',
    },
    {
      id: 'hr14',
      type: 'fib',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'A __________-hours contract offers no guaranteed hours: staff are called in only when the employer needs them. What one word completes the term?',
      accept: ['zero', '0'],
      explain:
        'A zero-hours contract guarantees no minimum hours, so pay changes from week to week. It suits businesses with unpredictable demand, but critics argue it leaves workers insecure — unlike part-time contracts, which have agreed set hours.',
    },
    {
      id: 'hr15',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the number of employees who report directly to one manager?',
      accept: ['span of control', 'span'],
      explain:
        'The span of control is the number of people who report directly to one manager. At Fernfield Foods the Managing Director’s span of control is three; tall structures have narrow spans, flat structures wide ones.',
    },
    {
      id: 'hr16',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a FINANCIAL method of motivation?',
      options: [
        'Piece rates — paying workers a fixed amount for each item they produce',
        'Job rotation — moving staff between tasks to add variety',
        'Empowerment — giving staff more control over their own decisions',
        'Teamworking — organising staff into teams with shared goals',
      ],
      correct: 0,
      explain:
        'Piece rates, pay rises, bonuses and promotion are financial motivators. Job rotation, enrichment, empowerment and teamworking are non-financial — they motivate through the work itself rather than through money.',
    },
    {
      id: 'hr17',
      type: 'term',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for moving employees between different tasks or jobs so that their work is more varied?',
      accept: ['job rotation', 'rotation', 'rotating jobs'],
      explain:
        'Job rotation moves staff between tasks to add variety and build wider skills. Related non-financial motivators include job enrichment (more challenging work) and empowerment (more control over decisions).',
    },
    {
      id: 'hr18',
      type: 'truefalse',
      topic: '2.5',
      difficulty: 3,
      marks: 1,
      stem: 'In Herzberg’s theory of motivation, good pay is a motivator that creates job satisfaction.',
      answer: false,
      explain:
        'False. In Herzberg’s theory, pay is a hygiene factor: poor pay creates dissatisfaction, but good pay only removes that dissatisfaction — it does not create lasting motivation. Herzberg’s motivators are recognition, achievement, responsibility and advancement.',
    },
  ],
};

export default hr;

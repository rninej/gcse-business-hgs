// gcsebusiness question bank — People & Performance (Topic 2.5)
// Author: gcsebusiness content team. Real cases (Fernfield Foods diagram, PGL,
// Pret A Manger, Sweaty Betty, River Island, Waterstones-style bookshop) are
// verifiable; Saltdean Bay Hotel and Foxglove Design have clean figures.

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'people-performance',
  title: 'People & Performance',
  blurb:
    'Organisational structures with the Fernfield Foods chart, recruitment and training at Sweaty Betty and Pret, Maslow and Herzberg, and employment law touches with River Island.',
  theme: 2,
  topics: ['2.5'],
  questions: [
    {
      id: 'pp1',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'The diagram shows the organisational structure of Fernfield Foods Ltd. To whom does the Digital Marketing Manager report directly?',
      diagram: 'orgchart',
      options: [
        'The Managing Director',
        'The Sales Manager',
        'The Marketing Director',
        'The Finance Director',
      ],
      correct: 2,
      explain:
        'The Digital Marketing Manager sits on the bottom layer, connected to the Marketing Director alongside the Sales Manager. Working out who reports to whom is exactly what an organisational chart is for — the chain of command runs downwards through it.',
    },
    {
      id: 'pp2',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, how is PGL’s structure mainly organised?',
      extract: {
        title: 'PGL — how the business is organised',
        text: 'PGL runs residential activity centres for school groups across Britain, from adventure centres in Devon to outdoor education centres in Scotland. Each centre is run by its own on-site team, and regional managers each look after several centres near them.',
      },
      options: [
        'By function, such as marketing and finance',
        'By region or location, with managers responsible for the centres in their area',
        'By product, with a separate company for each activity',
        'By customer, with one team per individual school',
      ],
      correct: 1,
      explain:
        'Businesses can structure themselves by function, product or region. PGL’s centres are spread across the country, so regional managers take responsibility for the centres near them — decisions are made close to each site, though head-office functions still exist.',
    },
    {
      id: 'pp3',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which of the following is an advantage of recruiting the new store manager EXTERNALLY?',
      extract: {
        title: 'Sweaty Betty — a new store manager',
        text: 'Sweaty Betty, the British activewear retailer, has opened new shops in recent years as well as selling online. Opening a new store means finding a store manager with strong retail experience — and the current assistant managers are not yet ready to step up.',
      },
      options: [
        'The new manager brings fresh ideas and experience from other retailers',
        'It is always quicker and cheaper than promoting from within',
        'The business already knows exactly how the candidate performs day to day',
        'It leaves the existing team with no chance of promotion forever',
      ],
      correct: 0,
      explain:
        'External recruitment widens the talent pool and brings in fresh perspectives and skills the business lacks — vital when nobody internal is ready. The trade-offs: it is usually slower and costlier, and the appointee is an unknown quantity compared with an internal candidate.',
    },
    {
      id: 'pp4',
      type: 'mcq',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which type of training is Pret using for its new team members?',
      extract: {
        title: 'Pret A Manger — learning the bar',
        text: 'New team members at Pret A Manger learn to make the drinks and food on real shifts, working alongside experienced baristas who coach them as they go. Mistakes happen — but on real orders, with support close by.',
      },
      options: [
        'Off-the-job training at a college',
        'Induction only, with no further training',
        'On-the-job training — learning while doing the real work',
        'Job rotation between different branches',
      ],
      correct: 2,
      explain:
        'On-the-job training happens while the employee does their normal work, guided by experienced colleagues. It is cheap and practical, and skills are learned in context — though errors can affect real customers, so close supervision matters.',
    },
    {
      id: 'pp5',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'According to Herzberg, which of the following is a MOTIVATOR — a factor that genuinely creates job satisfaction?',
      options: [
        'A comfortable temperature in the workplace',
        'Basic pay at the market rate',
        'Recognition for good work and a sense of achievement',
        'A clean, safe working environment',
      ],
      correct: 2,
      explain:
        'Herzberg’s motivators — recognition, achievement, responsibility, advancement and the work itself — create genuine satisfaction. Pay, conditions and job security are hygiene factors: when they are poor, people are dissatisfied, but fixing them only removes the dissatisfaction; it does not motivate.',
    },
    {
      id: 'pp6',
      type: 'mcq',
      topic: '2.5',
      difficulty: 3,
      marks: 1,
      stem: 'Ade has a secure job and a comfortable salary, gets on well with her team, and enjoys the Friday social. Yet she feels unnoticed while others win praise for their projects. According to Maslow, which need is currently UNMET?',
      options: [
        'Physiological needs — food and rest',
        'Safety needs — security and shelter',
        'Social needs — friendship and belonging',
        'Esteem needs — recognition, status and respect from others',
      ],
      correct: 3,
      explain:
        'Ade’s physiological, safety and social needs look well met — she is secure, paid and part of the team. What is missing is esteem: recognition and respect. A manager who spots this would praise her work or give her a visible project — not simply raise her pay.',
    },
    {
      id: 'pp7',
      type: 'mcq',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which law would the manager be breaking?',
      extract: {
        title: 'River Island — choosing between candidates',
        text: 'A River Island store is interviewing for a sales assistant. The manager’s notes rank one candidate top — but the manager then notices she is in her fifties and plans to offer the job to a younger candidate instead, assuming she “won’t fit the team”.',
      },
      options: [
        'The Health and Safety at Work Act 1974',
        'The Equality Act 2010',
        'The Consumer Rights Act 2015',
        'The National Minimum Wage legislation',
      ],
      correct: 1,
      explain:
        'The Equality Act 2010 makes it unlawful to discriminate in recruitment — or in serving customers — because of protected characteristics such as age, gender, race, religion, sexuality or disability. Rejecting the best candidate because of her age risks a tribunal claim, and the store loses its strongest applicant.',
    },
    {
      id: 'pp8',
      type: 'term',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'What is the name for the line of authority that runs from the top of an organisation down through the layers of management?',
      accept: ['chain of command', 'the chain of command', 'command chain', 'line of authority'],
      explain:
        'The chain of command shows who reports to whom, from the managing director downwards. In tall structures it is long — messages pass through many layers, which gives close supervision but slower communication.',
    },
    {
      id: 'pp9',
      type: 'term',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'What is the name of the motivation theory that arranges human needs in five levels — from basic physical needs up to self-actualisation — usually drawn as a pyramid?',
      accept: [
        "maslow's hierarchy of needs",
        'maslow hierarchy of needs',
        "maslow's hierarchy",
        'maslow',
        'hierarchy of needs',
        'maslows hierarchy of needs',
      ],
      explain:
        'Maslow’s hierarchy of needs climbs from physiological needs, through safety, social and esteem needs, to self-actualisation at the top. Lower needs must be broadly met before higher ones motivate — so fair pay and job security come before recognition and fulfilling work can work their magic.',
    },
    {
      id: 'pp10',
      type: 'term',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for giving employees the authority and freedom to make their own decisions about how they do their work?',
      accept: ['empowerment', 'empowering', 'employee empowerment', 'empowerment of employees'],
      explain:
        'Empowerment is a non-financial motivator: staff trusted with responsibility take ownership of problems and often exceed expectations. It costs nothing in wages, but it demands training, trust and clear boundaries — managers have to genuinely let go.',
    },
    {
      id: 'pp11',
      type: 'term',
      topic: '2.5',
      difficulty: 3,
      marks: 1,
      stem: 'What is the term for the rate at which employees leave a business over a period, usually expressed as a percentage of the workforce?',
      accept: ['staff turnover', 'labour turnover', 'staff turnover rate', 'labor turnover', 'employee turnover'],
      explain:
        'Staff (labour) turnover counts leavers as a percentage of the workforce. High turnover means constant recruitment and training costs and lost experience — often a symptom of poor motivation, which is why businesses track it closely.',
    },
    {
      id: 'pp12',
      type: 'fib',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'When new technology changes how a job is done, existing employees may need ________ — training that gives them the new skills their role now requires. What one word completes the sentence?',
      accept: ['retraining', 're-training', 're training', 'upskilling'],
      explain:
        'Retraining updates the skills of existing staff when technology or job roles change. It is usually cheaper than recruiting replacements — and it stops the business losing experienced people whose skills have simply moved on.',
    },
    {
      id: 'pp13',
      type: 'fib',
      topic: '2.5',
      difficulty: 1,
      marks: 1,
      stem: 'Two colleagues at a bookshop split one full-time duty-manager role between them, each working three days a week. This way of working is called a job ________. What one word completes the term?',
      accept: ['share', 'sharing', 'shares'],
      explain:
        'A job share splits one full-time role between two part-time employees, with hours and duties divided between them. It keeps a valued role filled while giving employees the flexibility of part-time work.',
    },
    {
      id: 'pp14',
      type: 'numeric',
      topic: '2.5',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the Saltdean Bay Hotel’s staff turnover rate for last year. Give your answer as a percentage to the nearest whole number.',
      extract: {
        title: 'Saltdean Bay Hotel — a staff survey',
        text: 'The Saltdean Bay Hotel employs 75 staff. Last year 15 of them left and had to be replaced. The HR manager wants to know the staff turnover rate, and what it says about morale at the hotel.',
      },
      value: 20,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'Staff turnover = (number of leavers ÷ total staff) × 100 = (15 ÷ 75) × 100 = 20%. One in five employees left — each one a recruitment cost and a loss of experience, and a warning sign about motivation.',
    },
    {
      id: 'pp15',
      type: 'numeric',
      topic: '2.5',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate the recruitment agency’s fee. Give your answer in pounds.',
      extract: {
        title: 'Foxglove Design — using an agency',
        text: 'Foxglove Design, a graphic design studio, is recruiting a senior designer through a recruitment agency. The agency’s fee is 20% of the new employee’s first-year salary, which will be £28,000. The studio has also set aside a £1,500 training budget for the successful candidate.',
      },
      value: 5600,
      tol: 5,
      unit: '£',
      explain:
        'Agency fee = 20% × £28,000 = £5,600. Add the £1,500 training budget and filling the vacancy costs at least £7,100 before the designer has earned a penny — which is why many businesses try internal recruitment first.',
    },
    {
      id: 'pp16',
      type: 'truefalse',
      topic: '2.5',
      difficulty: 2,
      marks: 1,
      stem: 'According to Maslow, once a level of need has been satisfied, it stops being a strong motivator — and the next level up becomes what drives the person.',
      answer: true,
      explain:
        'True. Maslow argued that satisfied needs lose their power to motivate: nobody is inspired for long by a salary that merely covers bills they can already pay. Effective managers therefore diagnose which level is unmet — because a pay rise will not fix a need for recognition.',
    },
  ],
};
export default def;

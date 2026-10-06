// gcsebusiness question bank — sub-topic fillers: Changing aims & objectives
// Fills the 2.1.2 (Changes in business aims and objectives) and 2.1.4 coverage gaps.
// 2.1.2 ×6 (why aims change and how) · 2.1.4 Ethics, the environment and business ×3.

import type { QuizDef } from '@/lib/bank';

const changingaims: QuizDef = {
  id: 'changingaims',
  title: 'Changing aims & objectives',
  blurb: 'Why aims shift as markets, technology, performance and the law move — and the ethics and environment trade-offs that reshape them.',
  theme: 2,
  topics: ['2.1'],
  audience: 'assignment',
  questions: [
    {
      id: 'ca1',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A toy retailer’s five-year objective is to open ten new shops. Then a recession cuts families’ spending and online rivals take more of its sales. Why must the retailer’s objectives now change?',
      options: [
        'Market conditions have changed, so the objective no longer fits',
        'Objectives must be replaced every twelve months by law',
        'The retailer achieved the ten shops a year early',
        'Rivals are legally required to publish their objectives',
      ],
      correct: 0,
      explain:
        'Aims must track the market: with spending falling and sales migrating online, opening ten shops would bleed cash. Changing market conditions are one of the main reasons aims and objectives change.',
    },
    {
      id: 'ca2',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 1,
      marks: 1,
      stem: 'A start-up café’s original aim was simply to survive its first year. It traded strongly and made a healthy profit. Which aim makes most sense for year two?',
      options: [
        'Closure — shut down while profits are high',
        'Survival — an aim can never be changed',
        'Growth — perhaps opening a second café',
        'Exit — leave the café market immediately',
      ],
      correct: 2,
      explain:
        'Strong performance changes what a business can aim for: having survived, the natural next aim is growth. Aims should evolve as the business evolves — clinging to survival would undersell its success.',
    },
    {
      id: 'ca3',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 3,
      marks: 1,
      stem: 'A chain of DVD-rental shops set an objective of opening 20 more stores — then customers began switching to online streaming, just as they abandoned Blockbuster. What should its new objective focus on?',
      options: [
        'Opening the 20 stores anyway, but faster',
        'Survival — adapting the business model to the new technology',
        'Renting more DVDs, but with longer opening hours',
        'Keeping every objective unchanged and waiting patiently',
      ],
      correct: 1,
      explain:
        'New technology can make an objective obsolete almost overnight: a store-opening target is worthless once customers have moved online. Aiming to survive by adapting — as Blockbuster failed to do — must come first.',
    },
    {
      id: 'ca4',
      type: 'fib',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 1,
      marks: 1,
      stem: 'In a downturn, when sales slump and cash runs short, a struggling business’s first aim shifts from growth to ________. What one word completes the sentence?',
      accept: ['survival', 'surviving', 'survive'],
      explain:
        'Survival — simply keeping the business trading — becomes the priority when cash is tight; growth can wait. It is the most common aim of start-ups and of established firms in a recession.',
    },
    {
      id: 'ca5',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A software business changes its main aim from survival to rapid growth. Which set of changes fits the new aim?',
      options: [
        'Exiting its markets and shrinking its product range',
        'Cutting the workforce and closing smaller offices',
        'Keeping every objective the same but hoping for the best',
        'Entering new markets and growing its workforce',
      ],
      correct: 3,
      explain:
        'A growth aim shows itself in how the business changes: entering new markets, taking on more staff and widening the product range. Exiting markets and cutting staff belong to a survival or retrenchment aim.',
    },
    {
      id: 'ca6',
      type: 'truefalse',
      topic: '2.1',
      subtopic: '2.1.2',
      difficulty: 2,
      marks: 1,
      stem: 'New legislation, such as a rise in the National Minimum Wage, can force a business to change its aims and objectives.',
      answer: true,
      explain:
        'True. Laws change the conditions a business operates in: a higher wage floor raises costs, so a profit target may become unreachable and objectives must be redrawn. Legislation is one of the main reasons aims change.',
    },
    {
      id: 'ca7',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.4',
      difficulty: 2,
      marks: 1,
      stem: 'A coffee shop switches to Fairtrade beans, which cost more per cup than its old beans. Which of the following best describes the choice it has made?',
      options: [
        'It accepts higher costs to attract ethically minded customers',
        'It gains guaranteed higher profits from the very first week',
        'Nothing changes, because Fairtrade beans are supplied free',
        'It serves lower-quality coffee that all customers prefer',
      ],
      correct: 0,
      explain:
        'Ethical sourcing usually raises costs — the price of doing right by farmers — but it can win loyal customers who value fair prices for growers. Businesses weigh the extra cost against the stronger brand it builds.',
    },
    {
      id: 'ca8',
      type: 'mcq',
      topic: '2.1',
      subtopic: '2.1.4',
      difficulty: 3,
      marks: 1,
      stem: 'An environmental pressure group runs a campaign against a drinks brand’s plastic bottles. Which change to the brand’s marketing mix is most likely in response?',
      options: [
        'Place — selling only in shops the group approves of',
        'Product — switching to recycled or recyclable packaging',
        'Price — raising prices to fund the group’s campaign',
        'Promotion — advertising that the group is wrong',
      ],
      correct: 1,
      explain:
        'Pressure-group activity often targets the product itself, pushing firms towards recycled or recyclable packaging — as Innocent did with its 100% recycled bottles. Ignoring the campaign risks boycotts and lasting damage to the brand.',
    },
    {
      id: 'ca9',
      type: 'fib',
      topic: '2.1',
      subtopic: '2.1.4',
      difficulty: 2,
      marks: 1,
      stem: 'Choosing between the environment and profit — giving up one goal to gain some of the other — is called a ________. What one word, with or without a hyphen, completes the sentence?',
      accept: ['trade-off', 'tradeoff', 'trade off'],
      explain:
        'A trade-off means sacrificing one thing to achieve another: greener packaging may lift costs, while chasing the lowest cost may harm the environment. Managers must judge where the balance lies.',
    },
  ],
};

export default changingaims;

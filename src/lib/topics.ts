// Edexcel GCSE (9-1) Business (1BS0) topic taxonomy — mirrors the official spec
// and the Hodder textbook (2nd ed.) unit structure.

export interface TopicDef {
  id: string;
  theme: 1 | 2;
  title: string;
  short: string; // short label for chips
  units: string[];
}

export const TOPICS: TopicDef[] = [
  {
    id: '1.1',
    theme: 1,
    title: 'Enterprise and entrepreneurship',
    short: 'Enterprise',
    units: [
      'The dynamic nature of business',
      'Why new business ideas come about',
      'How new business ideas come about',
      'Risk and reward',
      'The role of business enterprise',
      'Adding value',
      'The role of entrepreneurship',
    ],
  },
  {
    id: '1.2',
    theme: 1,
    title: 'Spotting a business opportunity',
    short: 'Spotting opportunities',
    units: [
      'Customer needs',
      'Market research',
      'Market segmentation',
      'Market mapping',
      'The competitive environment',
    ],
  },
  {
    id: '1.3',
    theme: 1,
    title: 'Putting a business idea into practice',
    short: 'Business idea in practice',
    units: [
      'Business aims and objectives',
      'Business revenue, costs and profit',
      'Break-even',
      'The importance of cash',
      'Cash flow forecasts',
      'Sources of small business finance',
    ],
  },
  {
    id: '1.4',
    theme: 1,
    title: 'Making the business effective',
    short: 'Making business effective',
    units: [
      'Ownership and liability',
      'Franchising',
      'Business location',
      'Marketing mix',
      'Business plans',
    ],
  },
  {
    id: '1.5',
    theme: 1,
    title: 'Understanding external influences',
    short: 'External influences',
    units: [
      'Stakeholders',
      'Technology and business',
      'Legislation and business',
      'Introduction to the economy',
      'The economy and business',
      'External influences on business',
    ],
  },
  {
    id: '2.1',
    theme: 2,
    title: 'Growing the business',
    short: 'Business growth',
    units: [
      'Methods of growth',
      'Finance for growth',
      'Changes in aims and objectives',
      'Business and globalisation',
      'Ethics and business',
      'Environment and business',
    ],
  },
  {
    id: '2.2',
    theme: 2,
    title: 'Making marketing decisions',
    short: 'Marketing decisions',
    units: ['Product', 'Price', 'Promotion', 'Place', 'Marketing mix and business decisions'],
  },
  {
    id: '2.3',
    theme: 2,
    title: 'Making operational decisions',
    short: 'Operational decisions',
    units: [
      'Business operations',
      'Technology, productivity and production',
      'Managing stock',
      'Procurement: working with suppliers',
      'Managing quality',
      'The sales process',
    ],
  },
  {
    id: '2.4',
    theme: 2,
    title: 'Making financial decisions',
    short: 'Financial decisions',
    units: ['Business calculations', 'Understanding business performance'],
  },
  {
    id: '2.5',
    theme: 2,
    title: 'Making human resource decisions',
    short: 'HR decisions',
    units: [
      'Organisational structures',
      'The importance of effective communication',
      'Different ways of working',
      'Effective recruitment',
      'Effective training and development',
      'Motivation',
    ],
  },
];

export const TOPIC_MAP: Record<string, TopicDef> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t])
);

export function topicTitle(id: string): string {
  return TOPIC_MAP[id]?.title ?? id;
}

export function themeOf(id: string): 1 | 2 | 0 {
  return TOPIC_MAP[id]?.theme ?? 0;
}

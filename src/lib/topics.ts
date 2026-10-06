// Edexcel GCSE (9-1) Business (1BS0) topic taxonomy.
//
// The sub-topic ids/titles below mirror the OFFICIAL Pearson specification
// (Issue 2, July 2022) exactly — teachers navigate the spec by these numbers
// (e.g. 2.1.3 = Business and globalisation), so quiz targeting uses them.
// Each sub-topic also carries `focus`: the spec's own content bullets,
// condensed — used to steer AI question generation and to keep generated
// quizzes strictly inside the selected sub-topic.

export interface SubTopicDef {
  id: string; // spec sub-topic id, e.g. '2.1.3'
  title: string; // official spec title
  short: string; // compact chip label
  /** what the spec puts in this sub-topic — grounds AI generation + tagging */
  focus: string;
}

export interface TopicDef {
  id: string;
  theme: 1 | 2;
  title: string;
  short: string; // short label for chips
  subtopics: SubTopicDef[];
}

export const TOPICS: TopicDef[] = [
  {
    id: '1.1',
    theme: 1,
    title: 'Enterprise and entrepreneurship',
    short: 'Enterprise',
    subtopics: [
      {
        id: '1.1.1',
        title: 'The dynamic nature of business',
        short: 'Dynamic business',
        focus:
          'Why new business ideas come about (changes in technology; changes in what consumers want; products/services becoming obsolete) and how they come about (original ideas; adapting existing products, services and ideas).',
      },
      {
        id: '1.1.2',
        title: 'Risk and reward',
        short: 'Risk & reward',
        focus:
          'The impact of risk and reward on business activity: risk (business failure, financial loss, lack of security) and reward (business success, profit, independence).',
      },
      {
        id: '1.1.3',
        title: 'The role of business enterprise',
        short: 'Role of enterprise',
        focus:
          'The role of business enterprise: producing goods or services, meeting customer needs, adding value (convenience, branding, quality, design, unique selling points). The role of entrepreneurship: entrepreneurs organise resources, make business decisions and take risks.',
      },
    ],
  },
  {
    id: '1.2',
    theme: 1,
    title: 'Spotting a business opportunity',
    short: 'Spotting opportunities',
    subtopics: [
      {
        id: '1.2.1',
        title: 'Customer needs',
        short: 'Customer needs',
        focus:
          'Identifying and understanding customer needs: price, quality, choice, convenience. The importance of identifying and understanding customers: generating sales, business survival.',
      },
      {
        id: '1.2.2',
        title: 'Market research',
        short: 'Market research',
        focus:
          'The purpose of market research (identify and understand customer needs, identify gaps in the market, reduce risk, inform business decisions). Methods: primary research (survey, questionnaire, focus group, observation) and secondary research (internet, market reports, government reports). The use of data: qualitative and quantitative data, the role of social media in collecting data, the importance of reliability.',
      },
      {
        id: '1.2.3',
        title: 'Market segmentation',
        short: 'Segmentation',
        focus:
          'How businesses segment markets to target customers: location, demographics, lifestyle, income, age. Market mapping to identify a gap in the market and the competition.',
      },
      {
        id: '1.2.4',
        title: 'The competitive environment',
        short: 'Competition',
        focus:
          'Understanding the competitive environment: strengths and weaknesses of competitors based on price, quality, location, product range and customer service. The impact of competition on business decision making.',
      },
    ],
  },
  {
    id: '1.3',
    theme: 1,
    title: 'Putting a business idea into practice',
    short: 'Business idea in practice',
    subtopics: [
      {
        id: '1.3.1',
        title: 'Business aims and objectives',
        short: 'Aims & objectives',
        focus:
          'What business aims and objectives are. Financial aims (survival, profit, sales, market share, financial security) and non-financial aims (social objectives, personal satisfaction, challenge, independence and control). Why aims and objectives differ between businesses.',
      },
      {
        id: '1.3.2',
        title: 'Business revenues, costs and profits',
        short: 'Revenue, costs & profit',
        focus:
          'The concept and calculation of revenue; fixed and variable costs; total costs; profit and loss; interest; break-even level of output; margin of safety. Interpretation of break-even diagrams: the impact of changes in revenue and costs, break-even output, margin of safety, profit and loss.',
      },
      {
        id: '1.3.3',
        title: 'Cash and cash-flow',
        short: 'Cash & cash-flow',
        focus:
          'The importance of cash to a business (to pay suppliers, overheads and employees; to prevent business failure/insolvency); the difference between cash and profit. Calculation and interpretation of cash-flow forecasts: cash inflows, cash outflows, net cash flow, opening and closing balances.',
      },
      {
        id: '1.3.4',
        title: 'Sources of business finance',
        short: 'Sources of finance',
        focus:
          'Sources of finance for a start-up or established small business: short-term sources (overdraft, trade credit); long-term sources (personal savings, venture capital, share capital, loans, retained profit, crowdfunding).',
      },
    ],
  },
  {
    id: '1.4',
    theme: 1,
    title: 'Making the business effective',
    short: 'Making business effective',
    subtopics: [
      {
        id: '1.4.1',
        title: 'The options for start-up and small businesses',
        short: 'Ownership options',
        focus:
          'The concept of limited liability and its implications for owners. Types of business ownership for start-ups: sole trader, partnership, private limited company — advantages and disadvantages of each. The option of starting up and running a franchise operation: advantages and disadvantages of franchising.',
      },
      {
        id: '1.4.2',
        title: 'Business location',
        short: 'Location',
        focus: 'Factors influencing business location decisions.',
      },
      {
        id: '1.4.3',
        title: 'The marketing mix',
        short: 'Marketing mix',
        focus:
          'What the marketing mix is and the importance of each element: how the elements work together and how each element is influenced by the others and by the target market.',
      },
      {
        id: '1.4.4',
        title: 'Business plans',
        short: 'Business plans',
        focus:
          'The role and importance of a business plan: to obtain finance, to set objectives, to reduce risk.',
      },
    ],
  },
  {
    id: '1.5',
    theme: 1,
    title: 'Understanding external influences',
    short: 'External influences',
    subtopics: [
      {
        id: '1.5.1',
        title: 'Business stakeholders',
        short: 'Stakeholders',
        focus:
          'Who business stakeholders are and their different objectives: shareholders (owners), employees, customers, managers, suppliers, local community, pressure groups, the government. How stakeholders are affected by business activity and how they impact it; possible conflicts between stakeholder groups.',
      },
      {
        id: '1.5.2',
        title: 'Technology and business',
        short: 'Technology',
        focus:
          'Different types of technology used by business: e-commerce, social media, digital communication, payment systems. How technology influences business activity in terms of sales, costs and the marketing mix.',
      },
      {
        id: '1.5.3',
        title: 'Legislation and business',
        short: 'Legislation',
        focus:
          'The purpose of legislation: principles of consumer law (quality and consumer rights) and principles of employment law (recruitment, pay, discrimination, health and safety). The impact of legislation on businesses: cost; consequences of meeting and not meeting these obligations.',
      },
      {
        id: '1.5.4',
        title: 'The economy and business',
        short: 'The economy',
        focus:
          'The impact of the economic climate on businesses: unemployment, changing levels of consumer income, inflation, changes in interest rates, government taxation, changes in exchange rates.',
      },
      {
        id: '1.5.5',
        title: 'External influences',
        short: 'External influences',
        focus:
          'The importance of external influences on business: possible responses by the business to changes in technology, legislation and the economic climate.',
      },
    ],
  },
  {
    id: '2.1',
    theme: 2,
    title: 'Growing the business',
    short: 'Business growth',
    subtopics: [
      {
        id: '2.1.1',
        title: 'Business growth',
        short: 'Growth',
        focus:
          'Methods of business growth and their impact: internal (organic) growth — new products (innovation, research and development), new markets (changing the marketing mix, technology, expanding overseas); external (inorganic) growth — merger, takeover. The types of business ownership for growing businesses: public limited company (plc). Sources of finance for growing and established businesses: internal (retained profit, selling assets), external (loan capital, share capital, including stock market flotation).',
      },
      {
        id: '2.1.2',
        title: 'Changes in business aims and objectives',
        short: 'Changing aims',
        focus:
          'Why business aims and objectives change as businesses evolve (market conditions, technology, performance, legislation, internal reasons) and how they change (focus on survival or growth; entering or exiting markets; growing or reducing the workforce; increasing or decreasing product range).',
      },
      {
        id: '2.1.3',
        title: 'Business and globalisation',
        short: 'Globalisation',
        focus:
          'The impact of globalisation on businesses: imports (competition from overseas, buying from overseas), exports (selling to overseas markets), changing business locations, multinationals. Barriers to international trade: tariffs, trade blocs. How businesses compete internationally: the use of the internet and e-commerce, changing the marketing mix to compete internationally.',
      },
      {
        id: '2.1.4',
        title: 'Ethics, the environment and business',
        short: 'Ethics & environment',
        focus:
          'The impact of ethical and environmental considerations on businesses: how ethical considerations influence business activity (possible trade-offs between ethics and profit); how environmental considerations influence business activity (trade-offs between the environment, sustainability and profit); the potential impact of pressure group activity on the marketing mix.',
      },
    ],
  },
  {
    id: '2.2',
    theme: 2,
    title: 'Making marketing decisions',
    short: 'Marketing decisions',
    subtopics: [
      {
        id: '2.2.1',
        title: 'Product',
        short: 'Product',
        focus:
          'The design mix: function, aesthetics, cost. The product life cycle: the phases of the product life cycle, extension strategies. The importance to a business of differentiating a product or service.',
      },
      {
        id: '2.2.2',
        title: 'Price',
        short: 'Price',
        focus:
          'Pricing strategies. Influences on pricing strategies: technology, competition, market segments, product life cycle.',
      },
      {
        id: '2.2.3',
        title: 'Promotion',
        short: 'Promotion',
        focus:
          'Appropriate promotion strategies for different market segments: advertising, sponsorship, product trials, special offers, branding. The use of technology in promotion: targeted advertising online, viral advertising via social media, e-newsletters.',
      },
      {
        id: '2.2.4',
        title: 'Place',
        short: 'Place',
        focus:
          'Methods of distribution: retailers and e-tailers (e-commerce).',
      },
      {
        id: '2.2.5',
        title: 'Using the marketing mix to make business decisions',
        short: 'Using the mix',
        focus:
          'How each element of the marketing mix can influence other elements. Using the marketing mix to build competitive advantage. How an integrated marketing mix can influence competitive advantage.',
      },
    ],
  },
  {
    id: '2.3',
    theme: 2,
    title: 'Making operational decisions',
    short: 'Operational decisions',
    subtopics: [
      {
        id: '2.3.1',
        title: 'Business operations',
        short: 'Operations',
        focus:
          'The purpose of business operations: to produce goods, to provide services. Production processes: job, batch and flow production; the impact of different types of production process (keeping productivity up and costs down, competitive prices). The impact of technology on production: balancing cost, productivity, quality and flexibility.',
      },
      {
        id: '2.3.2',
        title: 'Working with suppliers',
        short: 'Suppliers & stock',
        focus:
          'Managing stock: interpretation of bar gate stock graphs, the use of just-in-time (JIT) stock control. The role of procurement: relationships with suppliers (quality, delivery — cost, speed, reliability — availability, cost, trust); the impact of logistics and supply decisions on costs, reputation and customer satisfaction.',
      },
      {
        id: '2.3.3',
        title: 'Managing quality',
        short: 'Quality',
        focus:
          'The concept of quality and its importance: quality control and quality assurance in the production of goods and the provision of services; allowing a business to control costs and gain a competitive advantage.',
      },
      {
        id: '2.3.4',
        title: 'The sales process',
        short: 'Sales process',
        focus:
          'The sales process: product knowledge, speed and efficiency of service, customer engagement, responses to customer feedback, post-sales service. The importance to businesses of providing good customer service.',
      },
    ],
  },
  {
    id: '2.4',
    theme: 2,
    title: 'Making financial decisions',
    short: 'Financial decisions',
    subtopics: [
      {
        id: '2.4.1',
        title: 'Business calculations',
        short: 'Calculations',
        focus:
          'The concept and calculation of gross profit and net profit. Calculation and interpretation of gross profit margin, net profit margin and average rate of return.',
      },
      {
        id: '2.4.2',
        title: 'Understanding business performance',
        short: 'Performance',
        focus:
          'The use and interpretation of quantitative business data to support, inform and justify business decisions: information from graphs and charts, financial data, marketing data, market data. The use and limitations of financial information in understanding business performance and making business decisions.',
      },
    ],
  },
  {
    id: '2.5',
    theme: 2,
    title: 'Making human resource decisions',
    short: 'HR decisions',
    subtopics: [
      {
        id: '2.5.1',
        title: 'Organisational structures',
        short: 'Structures',
        focus:
          'Different organisational structures and when each is appropriate: hierarchical and flat, centralised and decentralised. The importance of effective communication: the impact of insufficient or excessive communication on efficiency and motivation, barriers to effective communication. Different ways of working: part-time, full-time and flexible hours; permanent, temporary and freelance contracts; the impact of technology on ways of working (efficiency, remote working).',
      },
      {
        id: '2.5.2',
        title: 'Effective recruitment',
        short: 'Recruitment',
        focus:
          'Different job roles and responsibilities: directors, senior managers, supervisors/team leaders, operational and support staff. How businesses recruit people: documents (person specification, job description, application form, CV); recruitment methods used to meet different business needs (internal and external recruitment).',
      },
      {
        id: '2.5.3',
        title: 'Effective training and development',
        short: 'Training',
        focus:
          'How businesses train and develop employees: formal and informal training, self-learning, ongoing training for all employees, use of target setting and performance reviews. Why businesses train and develop employees: the link between training, motivation and retention; retraining to use new technology.',
      },
      {
        id: '2.5.4',
        title: 'Motivation',
        short: 'Motivation',
        focus:
          'The importance of motivation in the workplace: attracting employees, retaining employees, productivity. How businesses motivate employees: financial methods (remuneration, bonus, commission, promotion, fringe benefits) and non-financial methods (job rotation, job enrichment, autonomy).',
      },
    ],
  },
];

export const TOPIC_MAP: Record<string, TopicDef> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t])
);

// ---- sub-topic helpers -------------------------------------------------

export const SUBTOPICS: SubTopicDef[] = TOPICS.flatMap((t) => t.subtopics);

export const SUBTOPIC_MAP: Record<string, SubTopicDef> = Object.fromEntries(
  SUBTOPICS.map((s) => [s.id, s])
);

/** all valid sub-topic ids, e.g. ['1.1.1', …, '2.5.4'] */
export const ALL_SUBTOPIC_IDS: string[] = SUBTOPICS.map((s) => s.id);

/** the parent topic id of a sub-topic id ('2.1.3' → '2.1'); null if invalid */
export function subtopicTopic(subId: string): string | null {
  return SUBTOPIC_MAP[subId]?.id != null ? subId.split('.').slice(0, 2).join('.') : null;
}

/** official sub-topics of a topic, in spec order */
export function subtopicsOf(topicId: string): SubTopicDef[] {
  return TOPIC_MAP[topicId]?.subtopics ?? [];
}

export function subtopicTitle(id: string): string {
  return SUBTOPIC_MAP[id]?.title ?? id;
}

export function topicTitle(id: string): string {
  return TOPIC_MAP[id]?.title ?? SUBTOPIC_MAP[id]?.title ?? id;
}

export function themeOf(id: string): 1 | 2 | 0 {
  const topicId = TOPIC_MAP[id] ? id : subtopicTopic(id);
  return TOPIC_MAP[topicId ?? '']?.theme ?? 0;
}

/** keep only ids that are real topic-area ids ('1.1'…'2.5') */
export function validTopicIds(ids: string[]): string[] {
  return ids.filter((id) => TOPIC_MAP[id]);
}

/** keep only ids that are real sub-topic ids ('1.1.1'…'2.5.4') */
export function validSubtopicIds(ids: string[]): string[] {
  return ids.filter((id) => SUBTOPIC_MAP[id]);
}

/** Human label for a quiz-targeting selection: whole topics + sub-topics.
 *  e.g. ['2.1.3'] → '2.1.3 Business and globalisation' */
export function targetLabel(topics: string[], subtopics: string[]): string {
  const parts: string[] = [];
  for (const t of validTopicIds(topics)) parts.push(`${t} ${TOPIC_MAP[t].short}`);
  for (const s of validSubtopicIds(subtopics)) parts.push(`${s} ${SUBTOPIC_MAP[s].short}`);
  return parts.join(' · ');
}

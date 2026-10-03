// gcsebusiness question bank — Market Research & Customers (Topic 1.2)
// Author: gcsebusiness content team. All real-world figures are verifiable.

import type { QuizDef } from '@/lib/bank';

const opportunity: QuizDef = {
  id: 'opportunity',
  title: 'Market Research & Customers',
  blurb: 'Customer needs, primary and secondary research, segmentation, market mapping and competition.',
  theme: 1,
  topics: ['1.2'],
  questions: [
    {
      id: 'o1',
      type: 'mcq',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'A corner shop stays open until 11pm every evening, including Sundays. Which customer need is this mainly meeting?',
      options: [
        'Convenience — customers can buy at a time that suits them',
        'Quality — the products are reliable and fit for purpose',
        'The shop stocks many different products, so customers can pick between them',
        'Price — the shop is the cheapest option in the whole town',
      ],
      correct: 0,
      explain:
        'Long opening hours make the shop easy to buy from whenever the customer wants — that is convenience, one of the four main customer needs, alongside price, quality and breadth of products.',
    },
    {
      id: 'o2',
      type: 'term',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'What is the term for research that gathers brand-new data directly from customers, using methods such as surveys, questionnaires and focus groups?',
      accept: ['primary research', 'primary market research', 'field research', 'primary'],
      explain:
        'Primary (field) research collects new, first-hand data for the business’s exact purpose. It is specific and up to date, but it costs more and takes longer than using data that already exists.',
    },
    {
      id: 'o3',
      type: 'mcq',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'Which of the following is a DISADVANTAGE of secondary market research?',
      options: [
        'The data may be out of date or not relevant to the business’s exact question',
        'It is always far more expensive than carrying out a survey',
        'It cannot usually be found using the internet',
        'It is collected directly from the business’s own customers, so it is too specific',
      ],
      correct: 0,
      explain:
        'Secondary research uses data that already exists — websites, government statistics and reports. It is quick and cheap, but the data may be old, biased or simply not fit for the business’s purpose.',
    },
    {
      id: 'o4',
      type: 'truefalse',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'Gathering brand-new data directly from customers is usually quicker and cheaper than using data that already exists.',
      answer: false,
      explain:
        'False — it is the other way round. Using existing data (secondary research) is quick and cheap, while gathering first-hand data means designing surveys or focus groups and paying to run them.',
    },
    {
      id: 'o5',
      type: 'term',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A focus group asks six customers in depth WHY they buy a particular brand. What type of research data does this produce?',
      accept: ['qualitative', 'qualitative data', 'qualitative research'],
      explain:
        'Qualitative research explores opinions, motivations and feelings — the ‘why’ behind buying. Quantitative research counts things instead, such as how many people would buy a product.',
    },
    {
      id: 'o6',
      type: 'mcq',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A smoothie start-up surveys 200 people and finds that 64% would buy its new flavour. What type of market research data is this?',
      options: [
        'Quantitative — it is numerical, so it can be counted and compared',
        'Non-numerical — it explores customers’ opinions in depth',
        'Secondary — it was published by another organisation',
        'Grouped by customers’ ages and incomes — data about who they are',
      ],
      correct: 0,
      explain:
        'Percentages and counts are quantitative data: they measure how many. Opinion-based, non-numerical data would instead explain why people would (or would not) buy the new flavour.',
    },
    {
      id: 'o7',
      type: 'term',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for splitting a market into groups of customers with similar characteristics, so products can be targeted at them?',
      accept: ['market segmentation', 'segmentation', 'segmenting', 'market segmenting', 'segmenting the market'],
      explain:
        'Market segmentation divides customers into groups — for example by age, income or where they live — so the business can design products and promotion that fit each group precisely.',
    },
    {
      id: 'o8',
      type: 'fib',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'A gym offers discounted student memberships and separate memberships for over-60s. Age, gender and income are examples of ________ factors used to group customers. What one word completes the sentence?',
      accept: ['demographic', 'demographics'],
      explain:
        'Demographic factors — age, gender, income, ethnicity and family size — describe who customers are. The gym’s age-based memberships are a classic example of grouping customers this way.',
    },
    {
      id: 'o9',
      type: 'fib',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'Around 1.2 million people in the UK are vegetarian, and food companies now launch products aimed at them. Interests, opinions and a person’s way of life make up their ________. What one word completes the sentence?',
      accept: ['lifestyle', 'life style', 'lifestyles'],
      explain:
        'A lifestyle reflects a customer’s interests, opinions and habits — being vegetarian is one example, which is why food firms launch dedicated product lines aimed at vegetarians.',
    },
    {
      id: 'o10',
      type: 'mcq',
      topic: '1.2',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, where is the clearest GAP in the Mill Lane coffee-shop market?',
      extract: {
        title: 'Coffee on Mill Lane',
        text: 'Mill Lane is a street with three coffee shops. The Daily Grind sells cheap, basic coffee, mostly takeaway. Café Verde charges high prices for premium, organic coffee in a smart interior. Bean There sits in between, with average prices and average quality. A diagram plotting price (low to high) against quality (basic to premium) places The Daily Grind bottom-left, Café Verde top-right and Bean There in the centre — leaving the bottom-right corner empty.',
      },
      options: [
        'High quality at low prices — no shop currently offers this combination',
        'High prices and premium organic coffee — that space is already taken by Café Verde',
        'Average prices and average quality — that space is already taken by Bean There',
        'Low prices and basic takeaway coffee — that space is already taken by The Daily Grind',
      ],
      correct: 0,
      explain:
        'The diagram shows three occupied positions: cheap-and-basic (The Daily Grind), mid-price-and-mid-quality (Bean There) and expensive-and-premium (Café Verde). The bottom-right — high quality at low prices — is empty, so that is the gap in the market.',
    },
    {
      id: 'o11',
      type: 'term',
      topic: '1.2',
      difficulty: 2,
      marks: 1,
      stem: 'What is the name of the diagram that plots the businesses in a market on two axes (for example price against quality) to reveal crowded areas and gaps?',
      accept: ['market map', 'a market map', 'market mapping', 'positioning map', 'perceptual map', 'a positioning map'],
      explain:
        'A market map plots each business in the market on two axes. Clusters show crowded, highly competitive parts of the market, while empty spaces suggest possible gaps for a new business to target.',
    },
    {
      id: 'o12',
      type: 'mcq',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'The diagram shows an illustrative market share breakdown of the UK grocery market. Which SINGLE supermarket chain has the largest share?',
      diagram: 'marketshare',
      options: ['Tesco', 'Sainsbury’s', 'Asda', 'Aldi'],
      correct: 0,
      explain:
        'Tesco has the largest share of any single chain at 25%, ahead of Sainsbury’s (15%), Asda (14%) and Aldi (10%). The ‘Others’ slice (28%) is bigger, but it is not one single chain — it groups all the remaining grocers together.',
    },
    {
      id: 'o13',
      type: 'truefalse',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'Trading online only — with no physical stores — helps ASOS keep its costs low.',
      answer: true,
      explain:
        'True. With no shops to rent, heat and staff, an online-only retailer such as ASOS saves a huge amount of fixed cost compared with high-street rivals — and can serve customers anywhere, at any time.',
    },
    {
      id: 'o14',
      type: 'fib',
      topic: '1.2',
      difficulty: 1,
      marks: 1,
      stem: 'Customers like a wide ________ of products, because it lets them feel in control of what they buy. What one word completes the sentence?',
      accept: ['choice', 'choices', 'selection', 'range', 'variety'],
      explain:
        'Choice — a wide range of products — is one of the four main customer needs, along with price, quality and convenience. Supermarkets stock thousands of lines so shoppers can find everything in one trip.',
    },
    {
      id: 'o15',
      type: 'mcq',
      topic: '1.2',
      difficulty: 3,
      marks: 1,
      stem: 'Using the diagram, which strategy best explains how small independent grocers survive in a grocery market dominated by the big chains?',
      diagram: 'marketshare',
      options: [
        'Stocking local or specialist products the big chains do not offer',
        'Matching Tesco’s prices on every single product it sells',
        'Copying exactly the same products as the big chains stock',
        'Trying to outspend the big chains on national television advertising',
      ],
      correct: 0,
      explain:
        'A market with several strong competitors is hard to enter, so small shops must stand out. They cannot win a price war or an advertising war against giants like Tesco, but they can differentiate — local produce, specialist product lines, personal service — giving customers a reason to shop there.',
    },
  ],
};

export default opportunity;

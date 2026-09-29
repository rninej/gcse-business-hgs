// HGSBusiness question bank — Globalisation, Ethics & the Environment (Topic 2.1)
// Author: HGS Business content team. All real-world claims are verifiable.

import type { QuizDef } from '@/lib/bank';

const globalisation: QuizDef = {
  id: 'globalisation',
  title: 'Globalisation, Ethics & Environment',
  blurb: 'Multinationals, imports and exports, trade blocs, ethical supply chains and sustainable growth.',
  theme: 2,
  topics: ['2.1'],
  questions: [
    {
      id: 'gl1',
      type: 'mcq',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Which statement best describes globalisation?',
      options: [
        'A tax charged on goods brought into a country',
        'The increasing integration of the world’s economies, as businesses trade, invest and operate across national borders',
        'An agreement to fix the same price for a product in every country',
        'A rule that businesses may only sell to customers in their own country',
      ],
      correct: 1,
      explain:
        'Globalisation is the growing integration of the world’s economies — goods, services, money, people and ideas moving across borders. It creates bigger markets for businesses, but also more competition from abroad.',
    },
    {
      id: 'gl2',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the most likely reason a business such as Nike has its trainers made in factories abroad?',
      extract: {
        title: 'Nike and Unilever',
        text: 'Nike designs its trainers in the United States and has them made in factories across Asia, then sells them worldwide. Unilever owns more than 400 brands — from Dove soap to Ben & Jerry’s ice cream — and sells them in well over 100 countries. Businesses like Nike, Unilever and Apple that operate in many countries are known as multinationals.',
      },
      options: [
        'Manufacturing costs can be much lower abroad, keeping prices competitive',
        'Every country legally requires foreign firms to build factories there',
        'Transport costs fall to zero when goods are made abroad',
        'Factories abroad always produce higher-quality trainers',
      ],
      correct: 0,
      explain:
        'Multinationals site production where costs are lowest while quality can still be controlled, which keeps prices down for customers worldwide. They also locate close to big, fast-growing markets.',
    },
    {
      id: 'gl3',
      type: 'mcq',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'A UK café chain buys coffee beans from growers in Brazil to use in its British shops. From the point of view of the UK, the coffee beans are…',
      options: ['An export', 'A trade bloc', 'An import', 'A subsidy'],
      correct: 2,
      explain:
        'An import is a good or service bought from another country. If the chain later sold bottled coffee drinks to customers in France, those sales would be UK exports.',
    },
    {
      id: 'gl4',
      type: 'term',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'What is the name for goods or services produced in one country and sold to customers in another?',
      accept: ['export', 'exports', 'an export', 'exporting'],
      explain:
        'Exports are goods and services sold to buyers abroad; imports are goods and services bought from other countries. Exports bring money into the UK economy, which is why governments often encourage them.',
    },
    {
      id: 'gl5',
      type: 'term',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'What is the collective name for a group of countries that trade with each other with reduced or no barriers, such as the EU single market?',
      accept: ['trade bloc', 'trading bloc', 'a trade bloc', 'a trading bloc'],
      explain:
        'A trade bloc (or trading bloc) is a group of countries that reduce or remove trade barriers between them. The EU single market is the best-known example — members trade with each other without tariffs.',
    },
    {
      id: 'gl6',
      type: 'mcq',
      topic: '2.1',
      difficulty: 3,
      marks: 1,
      stem: 'The European Union (EU) single market lets goods, services, money and people move between member countries without trade barriers; the UK left the single market at the end of 2020. What is the main benefit to businesses of a trade bloc such as this?',
      options: [
        'Businesses in member countries can sell to each other without tariffs or quotas',
        'Members must charge each other higher prices',
        'It bans all trade with countries outside the bloc',
        'Every member country must give up its own currency',
      ],
      correct: 0,
      explain:
        'A trade bloc removes barriers such as tariffs (import taxes) and quotas between its members, making it easier and cheaper for their businesses to trade with each other. Blocs do not ban trade with the rest of the world, and EU members keep their own currencies unless they choose the euro.',
    },
    {
      id: 'gl7',
      type: 'mcq',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Which pair of developments has made it much easier for even a small British business to sell to customers abroad?',
      options: [
        'Higher tariffs on imports and longer customs checks',
        'Paper catalogues and fax machines',
        'A stronger pound and rising shipping costs',
        'The internet and cheaper transport and shipping',
      ],
      correct: 3,
      explain:
        'The internet lets even a tiny firm reach customers worldwide without opening shops abroad, while container shipping and budget air freight have cut the cost of moving goods. Both developments have encouraged international trade.',
    },
    {
      id: 'gl8',
      type: 'term',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'What is the name of the scheme that guarantees farmers in poorer countries a fair minimum price for crops such as coffee, tea and cocoa?',
      accept: ['fairtrade', 'fair trade', 'fairtrade scheme', 'fair trade scheme'],
      explain:
        'Fairtrade guarantees farmers a fair minimum price for their crops, protecting them when world prices fall. It appeals to ethical customers, though it can cost more to stock.',
    },
    {
      id: 'gl9',
      type: 'truefalse',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Unethical behaviour in a supply chain, such as the use of child labour, rarely affects a business because customers care only about low prices.',
      answer: false,
      explain:
        'False. Unethical behaviour can trigger boycotts, damage the brand and cut sales — many customers think about ethics as well as price. Big brands have faced campaigns over conditions in their supply chains.',
    },
    {
      id: 'gl10',
      type: 'fib',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Innocent sells its smoothies in bottles made from 100% __________ plastic — old plastic that has been reprocessed — rather than newly made plastic. What one word completes the sentence?',
      accept: ['recycled', 'recyclable'],
      explain:
        'Recycled plastic is made from existing plastic waste, so fewer new materials are needed and less waste goes to landfill. Innocent’s 100% recycled bottles show how environmental pressure can change packaging.',
    },
    {
      id: 'gl11',
      type: 'truefalse',
      topic: '2.1',
      difficulty: 2,
      marks: 1,
      stem: 'Environmental measures such as cutting packaging and using less energy can reduce a business’s costs as well as helping the planet.',
      answer: true,
      explain:
        'True. Less packaging means less material to buy and less waste to dispose of, and using less energy cuts bills. Some green changes cost more at first, but many pay for themselves — so growth and sustainability can support each other.',
    },
    {
      id: 'gl12',
      type: 'fib',
      topic: '2.1',
      difficulty: 1,
      marks: 1,
      stem: 'Growth that meets the needs of the present without damaging the environment or the chances of future generations is called __________ growth. What one word completes the sentence?',
      accept: ['sustainable', 'green'],
      explain:
        'Sustainable growth balances profit with the environment and society — for example, cutting waste and pollution while still making money. Unsustainable growth can lead to fines, protests and lost customers.',
    },
  ],
};

export default globalisation;

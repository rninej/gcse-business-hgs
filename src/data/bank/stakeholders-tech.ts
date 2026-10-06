// gcsebusiness question bank — sub-topic fillers: Stakeholders & Technology
// Fills the 1.5.1 (zero questions bank-wide) and 1.5.2 coverage gaps.
// 1.5.1 Business stakeholders ×7 (Oakfield Foods case extract) · 1.5.2 Technology and business ×5.

import type { QuizDef } from '@/lib/bank';

const stakeholderstech: QuizDef = {
  id: 'stakeholderstech',
  title: 'Stakeholders & Technology',
  blurb: 'Who stakeholders are, what they want and how they clash — plus the technology changing how businesses sell, communicate and get paid.',
  theme: 1,
  topics: ['1.5'],
  audience: 'assignment',
  questions: [
    {
      id: 'st1',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, what are the local farms in relation to the new Oakfield Foods store?',
      extract: {
        title: 'Oakfield Foods comes to Millbrook',
        text: 'Oakfield Foods, a supermarket chain, has permission to open a new superstore on the edge of Millbrook, a small town. The chain says the store will create 150 jobs and will buy its bread and vegetables from local farms. Millbrook’s existing food shops fear losing customers to the big store, and a residents’ group has asked the town council to limit night-time delivery lorries. The council will collect business rates from the store once it opens.',
      },
      options: [
        'Its suppliers, providing bread and vegetables',
        'Its customers, buying the store’s fresh food',
        'Its shareholders, because they own the store',
        'Its managers, because they will run the store',
      ],
      correct: 0,
      explain:
        'The farms sell inputs to the store, making them supplier stakeholders — the business depends on them and should build a trusting relationship. Suppliers typically want steady orders and fair prices from Oakfield.',
    },
    {
      id: 'st2',
      type: 'fib',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, the people of Millbrook who will live with the extra traffic and noise are known, as a stakeholder group, as the local ________. What one word completes the sentence?',
      extract: {
        title: 'Oakfield Foods comes to Millbrook',
        text: 'Oakfield Foods, a supermarket chain, has permission to open a new superstore on the edge of Millbrook, a small town. The chain says the store will create 150 jobs and will buy its bread and vegetables from local farms. Millbrook’s existing food shops fear losing customers to the big store, and a residents’ group has asked the town council to limit night-time delivery lorries. The council will collect business rates from the store once it opens.',
      },
      accept: ['community', 'the community', 'local community', 'communities'],
      explain:
        'The local community is a stakeholder group: residents are affected by traffic, noise and jobs even if they never shop there. Their support or opposition can shape planning decisions and the store’s reputation.',
    },
    {
      id: 'st3',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, which of the following is an example of a stakeholder group IMPACTING Oakfield Foods’ decisions, rather than being affected by them?',
      extract: {
        title: 'Oakfield Foods comes to Millbrook',
        text: 'Oakfield Foods, a supermarket chain, has permission to open a new superstore on the edge of Millbrook, a small town. The chain says the store will create 150 jobs and will buy its bread and vegetables from local farms. Millbrook’s existing food shops fear losing customers to the big store, and a residents’ group has asked the town council to limit night-time delivery lorries. The council will collect business rates from the store once it opens.',
      },
      options: [
        'The store creates 150 jobs for local people',
        'Shoppers gain lower prices and more choice',
        'The residents’ group lobbies about night deliveries',
        'Local farms gain regular orders from the store',
      ],
      correct: 2,
      explain:
        'Stakeholders impact a business when their actions change what it does — the residents’ group’s lobbying could restrict night-time deliveries. The other three all show the business affecting stakeholders: jobs, prices and orders flow FROM the store.',
    },
    {
      id: 'st4',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which stakeholder group is most likely to be NEGATIVELY affected by the new superstore?',
      extract: {
        title: 'Oakfield Foods comes to Millbrook',
        text: 'Oakfield Foods, a supermarket chain, has permission to open a new superstore on the edge of Millbrook, a small town. The chain says the store will create 150 jobs and will buy its bread and vegetables from local farms. Millbrook’s existing food shops fear losing customers to the big store, and a residents’ group has asked the town council to limit night-time delivery lorries. The council will collect business rates from the store once it opens.',
      },
      options: [
        'Local jobseekers, who gain new employment there',
        'Shoppers, who gain lower prices and choice',
        'Local farms, which gain regular orders',
        'Millbrook’s existing food shops, which fear lost sales',
      ],
      correct: 3,
      explain:
        'The existing food shops face lost sales — the clearest losers from the development. Jobseekers, shoppers and farms all gain, which is why different stakeholder groups often take opposing sides over a decision like this.',
    },
    {
      id: 'st5',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 2,
      marks: 1,
      stem: 'Oakfield Foods negotiates hard to pay local farms as little as possible for their vegetables. Why may the farms’ objective conflict with the store’s?',
      extract: {
        title: 'Oakfield Foods comes to Millbrook',
        text: 'Oakfield Foods, a supermarket chain, has permission to open a new superstore on the edge of Millbrook, a small town. The chain says the store will create 150 jobs and will buy its bread and vegetables from local farms. Millbrook’s existing food shops fear losing customers to the big store, and a residents’ group has asked the town council to limit night-time delivery lorries. The council will collect business rates from the store once it opens.',
      },
      options: [
        'Farms want higher prices; the store wants lower costs',
        'Farms want more lorry routes; the store wants none',
        'Farms want fewer local jobs; the store wants more',
        'Farms want lower prices; so does the store',
      ],
      correct: 0,
      explain:
        'Suppliers want prices that reward their work, while buyers want costs kept down to protect profit margins. Every purchase is a negotiation between two stakeholder groups with directly opposing aims.',
    },
    {
      id: 'st6',
      type: 'truefalse',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 2,
      marks: 1,
      stem: 'A company’s shareholders and its employees always want the same thing, because both groups depend on the business for their income.',
      answer: false,
      explain:
        'False. Shareholders want maximum profit, while employees want good pay, security and working conditions — and higher wages cut into profit. These objectives often conflict, so managers must balance them.',
    },
    {
      id: 'st7',
      type: 'term',
      topic: '1.5',
      subtopic: '1.5.1',
      difficulty: 2,
      marks: 1,
      stem: 'A town council collects business rates from a new supermarket and gains jobs for local people. Which stakeholder group does the council belong to?',
      accept: ['government', 'the government', 'local government', 'council', 'the council'],
      explain:
        'The government — national or local — is a stakeholder in every business: it collects taxes such as business rates, passes laws businesses must follow and benefits from the jobs they create.',
    },
    {
      id: 'st8',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.2',
      difficulty: 2,
      marks: 1,
      stem: 'ASOS sells fashion only through its website and app. How does e-commerce most likely affect the sales the business can make?',
      options: [
        'Orders can arrive only when its shops are open',
        'Orders can arrive at any hour, from customers anywhere',
        'Sales are limited to shoppers near its warehouses',
        'Its sales are capped by the size of its shops',
      ],
      correct: 1,
      explain:
        'A website never closes and has no catchment area: customers can order at midnight from anywhere in the world. That round-the-clock, border-free reach is e-commerce’s biggest advantage for sales.',
    },
    {
      id: 'st9',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.2',
      difficulty: 1,
      marks: 1,
      stem: 'How can social media most directly help a small business promote its products?',
      options: [
        'Posts and adverts can be shared by followers, spreading the brand',
        'Followers must pay a fee before they can view any posts',
        'Only businesses with physical shops are allowed to post adverts',
        'Social media automatically designs and prices the products',
      ],
      correct: 0,
      explain:
        'Shares, likes and comments carry a brand far beyond its own followers, often at little or no cost. Adverts on social platforms can also be aimed at the exact audience the business wants to reach.',
    },
    {
      id: 'st10',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.2',
      difficulty: 1,
      marks: 1,
      stem: 'Instead of travelling to a two-hour meeting, a manager joins by video call from the office and emails the minutes afterwards. Which type of technology is she using?',
      options: [
        'E-commerce, because goods are being sold',
        'Contactless payment, because money is changing hands',
        'Digital communication, because messages travel instantly',
        'Automation, because machines are doing her work',
      ],
      correct: 2,
      explain:
        'Video calls, email and instant messaging are digital communication: they move information in seconds, cutting travel and postage costs and speeding up decisions with customers, suppliers and colleagues.',
    },
    {
      id: 'st11',
      type: 'fib',
      topic: '1.5',
      subtopic: '1.5.2',
      difficulty: 1,
      marks: 1,
      stem: 'Shoppers can now pay by tapping a bank card or smartphone on a reader instead of typing in a PIN. This is called a ________ payment. What one word completes the sentence?',
      accept: ['contactless', 'contact-less', 'contact less'],
      explain:
        'Contactless payment is one of the payment systems technology has given businesses: it speeds up queues, cuts cash-handling costs and suits small purchases. Customers increasingly expect shops to accept it.',
    },
    {
      id: 'st12',
      type: 'mcq',
      topic: '1.5',
      subtopic: '1.5.2',
      difficulty: 3,
      marks: 1,
      stem: 'A high-street electronics chain adds an online store with next-day delivery and starts promoting its deals through social media. Which of the following best describes how technology has changed its marketing mix?',
      options: [
        'Its product range must shrink now that it sells online',
        'Its promotion must stop now that it has a website',
        'Its prices are now fixed by the delivery company',
        'Its place has widened — customers can buy in store and online',
      ],
      correct: 3,
      explain:
        'The clearest change is place: the distribution channel has grown from shops alone to shops plus a website with home delivery. Technology has changed promotion too — but the product range and prices are not forced to follow.',
    },
  ],
};

export default stakeholderstech;

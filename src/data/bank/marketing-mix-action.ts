// gcsebusiness question bank — The Marketing Mix in Action (Topics 1.4 & 2.2)
// Author: gcsebusiness content team. Real cases (Gymshark, Aston Martin, WHSmith,
// B&M, Home Bargains, Unilever, Kellogg's, Tangle Teezer, Waterstones) are verifiable.

import type { QuizDef } from '@/lib/bank';

const def: QuizDef = {
  id: 'marketing-mix-action',
  title: 'The Marketing Mix in Action',
  blurb:
    'The 4Ps applied to real campaigns — Gymshark’s influencers, Aston Martin’s premium pricing, WHSmith’s travel shops, B&M and Home Bargains on price, Kellogg’s extension strategies and Unilever’s portfolio.',
  theme: 2,
  topics: ['1.4', '2.2'],
  questions: [
    {
      id: 'mm1',
      type: 'mcq',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which ELEMENT of the marketing mix do Gymshark’s YouTube activities belong to?',
      extract: {
        title: 'Gymshark — built on social media',
        text: 'Gymshark was founded in 2012 by Ben Francis, a teenager who screen-printed gym vests in his parents’ garage in Birmingham. In the early days the company could not afford TV adverts, so it sent free clothing to popular fitness YouTubers, who wore the brand in training videos seen by millions of viewers.',
      },
      options: ['Product', 'Price', 'Place', 'Promotion'],
      correct: 3,
      explain:
        'Sending kit to YouTubers is promotion — communicating with potential customers to persuade them to buy. For a young brand with little money it was cheaper and better targeted than traditional advertising, reaching gym fans directly through people they already trusted.',
    },
    {
      id: 'mm2',
      type: 'mcq',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which statement best explains how Aston Martin’s price and place decisions support its product?',
      extract: {
        title: 'Aston Martin — priced like a luxury brand',
        text: 'Aston Martin, the British maker of luxury sports cars, launches models at prices above £200,000 and sells them through a small, carefully chosen network of dealerships. Owners are also invited to exclusive brand events.',
      },
      options: [
        'A luxury, exclusive product needs a premium price and selective, upmarket outlets that protect the brand’s image',
        'The high price is a mistake, because every business should charge the lowest price possible',
        'Selling through as many discount retailers as possible would strengthen an exclusive brand',
        'Price and place have no connection with the image of the product',
      ],
      correct: 0,
      explain:
        'The four Ps must work together for the target market. A hand-built luxury car commands a premium price, and selling through a small network of prestigious dealers reinforces exclusivity — discount outlets and bargain promotion would undermine the image customers are paying for.',
    },
    {
      id: 'mm3',
      type: 'mcq',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which element of the marketing mix is WHSmith’s airport and station strategy mainly about?',
      extract: {
        title: 'WHSmith — the travel shop',
        text: 'WHSmith sells books, magazines, snacks and travel essentials. Its travel division — shops in airports and railway stations — has grown to become the larger part of its business, because travellers are a captive audience with time to browse while they wait.',
      },
      options: ['Product', 'Place', 'Promotion', 'Price'],
      correct: 1,
      explain:
        'Place is about where customers can buy. Locating shops in airports and stations puts WHSmith exactly where travellers have time on their hands — even though prices there are often higher than on the high street, the convenience does the selling.',
    },
    {
      id: 'mm4',
      type: 'mcq',
      topic: '2.2',
      difficulty: 1,
      marks: 1,
      stem: 'Using the case study, which element of the marketing mix is the main basis of competition for B&M and Home Bargains?',
      extract: {
        title: 'B&M and Home Bargains — pile it high, sell it cheap',
        text: 'The discount retailers B&M and Home Bargains have opened hundreds of stores across the UK, selling branded goods — from toiletries to tins of paint — at prices well below traditional rivals. Shoppers visit regularly to hunt for bargains.',
      },
      options: ['Promotion', 'Product design', 'Price', 'Place'],
      correct: 2,
      explain:
        'Discounters compete on price: low prices, driven by lean operations and bulk buying, are what pull customers through the doors. Their promotion is minimal and their ranges are chosen for value rather than exclusivity — price is the weapon.',
    },
    {
      id: 'mm5',
      type: 'mcq',
      topic: '2.2',
      difficulty: 3,
      marks: 1,
      stem: 'Using the case study, what is the main advantage to Unilever of owning such a wide product portfolio?',
      extract: {
        title: 'Unilever — 400 brands',
        text: 'Unilever owns more than 400 brands, from Dove soap to Ben & Jerry’s ice cream, sold in over 190 countries. Some brands grow quickly, some generate steady cash for years, and a few struggle and are eventually sold off or closed.',
      },
      options: [
        'It spreads risk — weak performance in one brand or market can be offset by stronger performance elsewhere',
        'It guarantees that every single brand will succeed',
        'It removes the need to research what customers want',
        'It makes the company too small to compete abroad',
      ],
      correct: 0,
      explain:
        'A portfolio spreads risk across products, markets and price points: when one brand slips into decline, cash from the others keeps group profits steady. It also lets Unilever target very different customer segments at once, from budget ranges to premium brands.',
    },
    {
      id: 'mm6',
      type: 'mcq',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'Using the case study, which product life cycle technique is Kellogg’s using when it launches new varieties and updated packaging for established cereals?',
      extract: {
        title: 'Kellogg’s — keeping cereals fresh',
        text: 'Kellogg’s has been making cereals such as Corn Flakes and Crunchy Nut for decades. To keep sales rising, it regularly launches new varieties — such as new Crunchy Nut flavours — along with limited editions and updated packaging, promoted heavily.',
      },
      options: [
        'Price skimming — charging a high launch price that falls later',
        'Penetration pricing — charging a low price to win market share',
        'An extension strategy — updating the product to prolong sales and delay decline',
        'Delayering — removing layers of management',
      ],
      correct: 2,
      explain:
        'Extension strategies refresh a mature product: new flavours, new packaging and renewed promotion restart sales growth and push decline further into the future. Skimming and penetration are pricing strategies, not product updates.',
    },
    {
      id: 'mm7',
      type: 'term',
      topic: '1.4',
      difficulty: 1,
      marks: 1,
      stem: 'The Tangle Teezer brush, launched in 2007 after its inventor was turned down on Dragons’ Den, has flexible teeth that glide through tangled hair without pulling — something no rival brush offered at the time. What is the term for a distinctive feature that makes a product stand out from rivals?',
      accept: ['usp', 'unique selling point', 'usps', 'unique selling proposition', 'the usp'],
      explain:
        'The Tangle Teezer’s unique design was its USP — the feature that made it different from every rival brush and gave customers a reason to choose it. A strong USP supports premium pricing and makes promotion much easier.',
    },
    {
      id: 'mm8',
      type: 'term',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'What is the term for the route a product takes from the producer to the customer — for example direct from a website, or via a wholesaler and then a retailer?',
      accept: [
        'distribution channel',
        'a distribution channel',
        'channel of distribution',
        'distribution',
        'distribution chain',
      ],
      explain:
        'The distribution channel is the route products travel to reach customers — direct, through retailers, or through wholesalers first. Businesses weigh cost (selling via retailers sacrifices margin), control and customer convenience when choosing between channels.',
    },
    {
      id: 'mm9',
      type: 'term',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'What is the general term for a business that sits between the producer and the customer in a distribution channel — such as a wholesaler, a retailer or an online marketplace?',
      accept: ['intermediary', 'an intermediary', 'intermediaries', 'middleman', 'middlemen'],
      explain:
        'Intermediaries such as wholesalers, retailers and marketplaces connect producers with customers. They provide reach and convenience in exchange for a share of the price — which is why some businesses prefer to sell direct instead.',
    },
    {
      id: 'mm10',
      type: 'term',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'A cinema charges £7.50 for a weekday afternoon screening of a film that costs £13.00 on Saturday evening. What is this pricing method — charging different prices to different groups or at different times — called?',
      accept: ['price discrimination', 'discriminatory pricing', 'differential pricing', 'price differentiation'],
      explain:
        'Price discrimination charges different customer groups or time slots different prices for essentially the same product — off-peak cinema tickets, child fares or advance rail tickets. It lets a business earn more from those who will pay more, while still filling capacity at quiet times.',
    },
    {
      id: 'mm11',
      type: 'fib',
      topic: '2.2',
      difficulty: 2,
      marks: 1,
      stem: 'According to the diagram, the ________ stage comes before launch: there are no sales yet and set-up costs are high. What one word completes the sentence?',
      diagram: 'plc',
      accept: ['development', 'Development', 'product development', 'research and development', 'r&d'],
      explain:
        'During development the product is still being designed and tested, so there is no revenue — only costs. Next comes introduction, when the product launches with low sales and heavy promotion, followed by growth.',
    },
    {
      id: 'mm12',
      type: 'fib',
      topic: '2.2',
      difficulty: 1,
      marks: 1,
      stem: 'Newspaper and TV coverage that a business earns without paying for the space — such as a news story about a new product launch — is known as public ________. What one word completes the term?',
      accept: ['relations', 'relation', 'pr', 'publicity'],
      explain:
        'Public relations (PR) means earning favourable coverage rather than buying advertising space. It can be very persuasive because it looks like independent news — but the business cannot fully control what journalists write.',
    },
    {
      id: 'mm13',
      type: 'numeric',
      topic: '2.2',
      difficulty: 2,
      marks: 2,
      stem: 'Using the case study, calculate the selling price of one backpack under cost-plus pricing. Give your answer in pounds to 2 decimal places.',
      extract: {
        title: 'Ripple & Roam — cost-plus pricing',
        text: 'Ripple & Roam is a small British start-up making waterproof backpacks for walkers. The unit cost of making one backpack — fabric, buckles, labour and factory overheads — is £24. Using cost-plus pricing, the founders add a mark-up of 75% of the unit cost.',
      },
      value: 42,
      tol: 0.25,
      unit: '£',
      dp: 2,
      explain:
        'Cost-plus price = unit cost + mark-up. The mark-up is 75% of £24 = £18, so the price is £24 + £18 = £42.00. Cost-plus guarantees costs are covered on every sale, but it ignores what customers are willing to pay and what rivals charge.',
    },
    {
      id: 'mm14',
      type: 'numeric',
      topic: '2.2',
      difficulty: 3,
      marks: 2,
      stem: 'Using the case study, calculate the percentage increase in Granite & Grit’s monthly revenue. Give your answer to the nearest whole number.',
      extract: {
        title: 'Granite & Grit — did the campaign work?',
        text: 'Granite & Grit runs an indoor climbing wall in Sheffield. Last month it spent £900 on a targeted social media campaign aimed at local climbers. Monthly revenue rose from £18,000 to £21,600 after the campaign ran.',
      },
      value: 20,
      tol: 0.5,
      unit: '%',
      dp: 0,
      explain:
        'Percentage change = (new − original) ÷ original × 100 = (£21,600 − £18,000) ÷ £18,000 × 100 = +20%. A key benefit of social media promotion is that results like this can be measured — the owners can see whether the £900 spent earned its keep.',
    },
    {
      id: 'mm15',
      type: 'truefalse',
      topic: '1.4',
      difficulty: 2,
      marks: 1,
      stem: 'A business is most likely to succeed when the four Ps work together and suit the target market — for example a premium product with a premium price, an upmarket place and quality promotion.',
      answer: true,
      explain:
        'True. The marketing mix must be integrated: every element should reinforce the others for the target market. A premium product promoted like a bargain — or sold in a downmarket outlet — sends mixed messages and undermines the brand.',
    },
    {
      id: 'mm16',
      type: 'truefalse',
      topic: '2.2',
      difficulty: 3,
      marks: 1,
      stem: 'Waterstones competes with Amazon mainly by charging lower prices than the online retailer.',
      answer: false,
      explain:
        'False. Waterstones cannot beat Amazon on price, so it competes on what physical bookshops do best: hand-picked ranges, knowledgeable staff who recommend books, browsing and author events. Differentiation, not price, is its weapon.',
    },
  ],
};
export default def;

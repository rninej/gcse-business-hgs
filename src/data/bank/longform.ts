// gcsebusiness question bank — Long-form Exam Practice (Topics 1.1–2.5)
// Author: gcsebusiness content team. Twenty extended-response questions
// (6/9/12 marks) in the Edexcel 1BS0 style: analyse / discuss / justify /
// evaluate, each with an examiner mark scheme of 1–3 mark points.
// Businesses are the established fictional set (Crumb & Craft, Rise & Shine,
// Style on Wheels) plus realistic small firms with clean, consistent figures.

import type { QuizDef } from '@/lib/bank';

const longform: QuizDef = {
  id: 'longform',
  title: 'Long-Answer Exam Practice',
  blurb:
    'Twenty extended-response questions (6, 9 and 12 marks) across both themes — analyse, discuss, justify and evaluate, each marked against a real mark scheme by the AI examiner.',
  theme: 1,
  topics: ['1.1', '1.2', '1.3', '1.4', '1.5', '2.1', '2.2', '2.3', '2.4', '2.5'],
  questions: [
    /* ---------------- Theme 1 ---------------- */
    {
      id: 'w1',
      type: 'written',
      topic: '1.1',
      difficulty: 3,
      marks: 9,
      stem: 'Analyse the effects on Crumb & Craft of Nadia leaving a secure £28,000-a-year bank job to start the bakery. You should consider financial and non-financial factors.',
      extract: {
        title: 'Crumb & Craft',
        text: 'Crumb & Craft is a craft bakery in Hertford. Nadia, its founder, left a secure £28,000-a-year job at a bank to open it, investing £9,000 of her own savings. In its first year the bakery made £21,000 of profit.',
      },
      points: [
        { text: 'Nadia has given up a guaranteed £28,000 salary for uncertain income — an opportunity cost of running her own business', marks: 2 },
        { text: 'Her £9,000 savings are at risk if the bakery fails — she could lose her invested capital', marks: 2 },
        { text: 'In return she gains independence and control over her own decisions as her own boss', marks: 2 },
        { text: 'The £21,000 first-year profit shows the risk is paying off, though it is still below her old salary', marks: 2 },
        { text: 'Non-financial rewards include personal satisfaction from building something of her own', marks: 1 },
      ],
      explain:
        'A strong answer weighs the certain losses (salary given up, savings at risk) against both financial and personal gains, and uses the case study figures to judge whether the risk has paid off so far.',
    },
    {
      id: 'w2',
      type: 'written',
      topic: '1.1',
      difficulty: 3,
      marks: 6,
      stem: 'Crumb & Craft could add an online ordering service with next-day delivery across Hertford. Analyse the impact this change could have on the bakery.',
      extract: {
        title: 'Crumb & Craft — online plans',
        text: 'The bakery currently sells only from its shop. Adding online ordering would cost £3,000 to set up and £400 a month to run. Nadia estimates it could add 60 extra sales a week at an average of £4.50 each.',
      },
      points: [
        { text: 'Revenue would rise by around £1,170 a week (£4.50 × 60 extra sales) from customers who cannot visit the shop', marks: 2 },
        { text: 'Costs rise too — £3,000 set-up plus £400 a month — so the change only pays off if the extra sales continue', marks: 2 },
        { text: 'Reaching online customers could build the brand beyond one shop, but delivery adds work and risks disappointing shop customers if bread sells out', marks: 2 },
      ],
      explain:
        'Use the figures: £1,170 a week against £400 a month running costs suggests a healthy return, but the £3,000 set-up must first be recovered — judgement on whether it is worth it.',
    },
    {
      id: 'w3',
      type: 'written',
      topic: '1.2',
      difficulty: 3,
      marks: 9,
      stem: 'Discuss how a rise in interest rates is likely to affect small UK businesses like Style on Wheels.',
      extract: {
        title: 'Style on Wheels',
        text: 'Style on Wheels is a mobile hairdressing business run by Priya. She borrowed £8,000 at a variable interest rate to buy her van and equipment, and repays £260 a month. Many of her customers pay for haircuts from their spare income.',
      },
      points: [
        { text: 'Variable-rate loan repayments rise when interest rates rise, increasing Priya’s costs and squeezing her profit', marks: 2 },
        { text: 'Higher rates make saving more attractive than spending, so customers may cut back on non-essential services like hairdressing', marks: 2 },
        { text: 'Some customers with mortgages have less spare income when rates rise, reducing demand further', marks: 2 },
        { text: 'Priya may be unable to pass on higher costs by raising prices if customers are already feeling squeezed', marks: 2 },
        { text: 'The severity depends on how much of her revenue depends on loan repayments and discretionary spending — her £8,000 loan is modest, so the effect is real but manageable', marks: 1 },
      ],
      explain:
        'The chain runs from interest rates → loan costs and customer incomes → Priya’s costs and demand → profit. Evaluate the size of the effect using the case figures.',
    },
    {
      id: 'w4',
      type: 'written',
      topic: '1.3',
      difficulty: 3,
      marks: 6,
      stem: 'Crumb & Craft is considering changing its suppliers to a cheaper wholesaler with a wider range. Analyse the potential impact of this change.',
      extract: {
        title: 'Crumb & Craft — supplier choice',
        text: 'The bakery buys flour, yeast and salt from a local mill for £1.20 of ingredients per loaf. A national wholesaler could supply the same volume for £0.85 per loaf, but delivery is only twice a week and the flour is not organic.',
      },
      points: [
        { text: 'Ingredient cost per loaf falls by £0.35 (from £1.20 to £0.85), raising the value added and profit margin on each loaf', marks: 2 },
        { text: 'Only two deliveries a week means Nadia must store more stock and could run out between deliveries, risking lost sales', marks: 2 },
        { text: 'Losing the organic claim could damage the premium image that lets her charge £3.20 a loaf, so the cheaper supply might reduce revenue instead', marks: 2 },
      ],
      explain:
        'The best answers weigh a certain 29% ingredient saving against image damage and stock risk — and note the two effects pull in opposite directions.',
    },
    {
      id: 'w5',
      type: 'written',
      topic: '1.4',
      difficulty: 3,
      marks: 9,
      stem: 'Discuss whether the marketing mix of Rise & Shine supports its aim of growing from one market stall into a chain of cafés.',
      extract: {
        title: 'Rise & Shine',
        text: 'Rise & Shine began as a coffee market stall and now runs six cafés and a small roastery. Its coffee is premium-priced at £3.40 a cup against £2.80 at chains; it uses recycled cups, sells through its own cafés, and promotes mainly through local events and social media.',
      },
      points: [
        { text: 'The premium price (£3.40) positions the brand as higher quality, which supports charging more than big chains', marks: 2 },
        { text: 'The product is differentiated by the roastery and sustainability — recycled cups give ethical customers a reason to choose it', marks: 2 },
        { text: 'Selling only through its own cafés keeps control of the customer experience but limits reach compared with wholesale deals', marks: 2 },
        { text: 'Low-cost promotion through local events and social media suits a small firm but may limit how quickly new customers hear about it as it grows', marks: 2 },
        { text: 'Judgement: overall the mix is consistent with premium positioning, though place and promotion may need investment to sustain further growth', marks: 1 },
      ],
      explain:
        'Analyse each of the 4Ps against the growth aim, then judge which elements most help and which may hold the business back — that judgement earns the final marks.',
    },
    {
      id: 'w6',
      type: 'written',
      topic: '1.4',
      difficulty: 3,
      marks: 6,
      stem: 'Explain one benefit and one drawback to a small business of using social media influencers instead of paid advertising.',
      points: [
        { text: 'Benefit: influencers reach a large, engaged audience cheaply compared with TV or print advertising, raising brand awareness at low cost', marks: 3 },
        { text: 'Drawback: the business cannot fully control what the influencer says — a poorly judged post could damage the brand, and the audience may not trust the endorsement', marks: 3 },
      ],
      explain:
        'One well-developed benefit and one well-developed drawback, each with a consequence for the business — two brief points with no development will not earn full marks.',
    },
    {
      id: 'w7',
      type: 'written',
      topic: '1.5',
      difficulty: 3,
      marks: 12,
      stem: 'The owners of The Dough House want to open a second bakery in a neighbouring town. Justify whether they should use retained profit or a bank loan to finance the expansion.',
      extract: {
        title: 'The Dough House',
        text: 'The Dough House makes £46,000 profit a year and holds £30,000 of retained profit. The second bakery would cost £60,000 to set up and is forecast to add £18,000 of profit a year. Bank loans currently cost 8% interest a year.',
      },
      points: [
        { text: 'Retained profit avoids interest and repayments, so no extra costs and no risk to cash flow', marks: 2 },
        { text: 'But £30,000 of retained profit cannot cover the £60,000 cost — it is not enough on its own, and keeping a cash buffer matters', marks: 2 },
        { text: 'A bank loan provides the full £60,000 immediately, allowing faster expansion', marks: 2 },
        { text: 'The loan costs 8% a year — about £4,800 — which must be repaid from the £18,000 forecast extra profit, leaving a reasonable margin', marks: 2 },
        { text: 'Loan repayments are fixed commitments even if the new bakery underperforms, increasing risk', marks: 2 },
        { text: 'Justified recommendation: use the £30,000 retained profit and borrow the remaining £30,000, spreading risk while keeping interest costs around £2,400 a year — the forecast profit covers this comfortably', marks: 2 },
      ],
      explain:
        'For 12 marks, analyse both options against the figures, then make and justify a recommendation — the strongest answers suggest the mix of the two sources and test it against the £18,000 forecast.',
    },
    {
      id: 'w8',
      type: 'written',
      topic: '1.5',
      difficulty: 3,
      marks: 6,
      stem: 'Analyse the impact on a small firm of the flow of cash into and out of the business being poorly timed, even when the business is profitable.',
      extract: {
        title: 'Style on Wheels — cash timing',
        text: 'Priya charges clients on 30-day invoices. Her van lease, insurance and phone bill are all due in the first week of each month, totalling £620.',
      },
      points: [
        { text: 'Profit is measured over time, but bills are paid on specific dates — if clients pay late, Priya can lack cash when the £620 of bills fall due', marks: 2 },
        { text: 'Poor cash flow can force her to borrow (adding interest costs) or delay payments, damaging supplier relationships', marks: 2 },
        { text: 'In the worst case a profitable business fails because it cannot pay its bills — cash flow, not profit, pays the bills', marks: 2 },
      ],
      explain:
        'The key idea is the difference between profit and cash: timing, not total, causes the problem — developed with the case figures.',
    },
    /* ---------------- Theme 2 ---------------- */
    {
      id: 'w9',
      type: 'written',
      topic: '2.1',
      difficulty: 3,
      marks: 9,
      stem: 'Discuss how a rise in UK inflation is likely to affect Rise & Shine and its customers.',
      extract: {
        title: 'Rise & Shine — cost pressure',
        text: 'Rise & Shine pays its 14 staff the National Living Wage. Its ingredient and energy costs have risen 12% in a year. Its customers are largely commuters and students.',
      },
      points: [
        { text: 'Ingredient and energy costs rising 12% squeezes profit margins unless prices rise to match', marks: 2 },
        { text: 'If wages must also rise, staff costs — usually the biggest cost in cafés — climb too', marks: 2 },
        { text: 'Inflation cuts customers’ real income, so commuters and students may trade down or visit less often', marks: 2 },
        { text: 'Raising the £3.40 cup price protects margins but may accelerate the loss of price-sensitive students', marks: 2 },
        { text: 'Judgement: Rise & Shine faces the squeeze from both directions — costs rising faster than it can safely raise prices', marks: 1 },
      ],
      explain:
        'Inflation hits the business through costs and through customers’ incomes — the strongest answers show both channels and the pricing dilemma between them.',
    },
    {
      id: 'w10',
      type: 'written',
      topic: '2.1',
      difficulty: 3,
      marks: 6,
      stem: 'Analyse how a fall in the value of the pound against the euro would affect a UK bakery that imports flour from France and exports bread to Ireland.',
      extract: {
        title: 'Crumb & Craft goes international',
        text: 'Crumb & Craft buys 40% of its flour from a French mill and has begun selling artisan loaves to a Dublin delicatessen, worth about £900 a month.',
      },
      points: [
        { text: 'A weaker pound makes the French flour more expensive in pounds, raising costs on 40% of its main ingredient', marks: 2 },
        { text: 'The same fall makes its loaves cheaper for the Irish buyer in euros, so the £900-a-month export demand could grow', marks: 2 },
        { text: 'The net effect depends on which is bigger — the extra ingredient cost on all its flour or the extra revenue from one export customer', marks: 2 },
      ],
      explain:
        'Exchange-rate questions reward showing both directions: dearer imports AND more competitive exports — then weighing them with the case figures.',
    },
    {
      id: 'w11',
      type: 'written',
      topic: '2.2',
      difficulty: 3,
      marks: 9,
      stem: 'Discuss how a business could increase labour productivity, and analyse one limitation of measuring productivity using output per worker.',
      extract: {
        title: 'The Dough House — productivity',
        text: 'The Dough House bakes 900 loaves a week with 6 bakers — 150 loaves per baker. The owner is considering training and a new £12,000 dough-mixing machine.',
      },
      points: [
        { text: 'Training raises each baker’s skill and speed, increasing loaves per worker without extra staff', marks: 2 },
        { text: 'The mixing machine automates the slowest task, lifting output per worker but costing £12,000 upfront', marks: 2 },
        { text: 'Motivating staff (e.g. performance pay) can also raise effort and therefore productivity', marks: 2 },
        { text: 'Limitation: output per worker ignores quality — a baker producing 180 poorer loaves looks “more productive” but could lose customers', marks: 2 },
        { text: 'It also ignores the cost of achieving the output — the machine raises productivity while adding capital costs', marks: 1 },
      ],
      explain:
        'Two sides to this one: developed methods (training/technology/motivation) then a genuine limitation of the measure itself, applied to the bakery.',
    },
    {
      id: 'w12',
      type: 'written',
      topic: '2.2',
      difficulty: 3,
      marks: 6,
      stem: 'Analyse the impact on Crumb & Craft of introducing quality control checks at the end of each baking batch.',
      extract: {
        title: 'The Dough House — checking the loaves',
        text: 'Crumb & Craft currently has no formal checks. Introducing end-of-batch checks would reject around 4% of loaves and take each baker 20 minutes a day.',
      },
      points: [
        { text: 'Checks catch poor loaves before customers see them, protecting the premium reputation that supports the £3.20 price', marks: 2 },
        { text: 'But 20 minutes per baker per day is paid time producing no bread, and rejecting 4% of output raises the average cost per loaf sold', marks: 2 },
        { text: 'Finding problems only at the END of a batch means the whole batch may already be wrong — checks at several stages catch faults sooner', marks: 2 },
      ],
      explain:
        'Weigh brand protection against higher unit costs, and note the timing weakness of end-of-process inspection.',
    },
    {
      id: 'w13',
      type: 'written',
      topic: '2.3',
      difficulty: 3,
      marks: 12,
      stem: 'Evaluate whether Rise & Shine should grow by opening more of its own cafés (organic growth) or by forming a franchise agreement.',
      extract: {
        title: 'Rise & Shine — two ways to grow',
        text: 'Rise & Shine runs six cafés and a roastery, with profits of £120,000 a year. A new café costs about £95,000 and takes a year to break even. A franchise would let franchisees open cafés using the brand for a £15,000 fee plus 6% of sales, with almost no cost to Rise & Shine.',
      },
      points: [
        { text: 'Organic growth keeps full control of quality and every pound of profit from each new café', marks: 2 },
        { text: 'But each café costs £95,000 and takes a year to break even — slow, risky growth that strains cash and management time', marks: 2 },
        { text: 'Franchising grows the brand fast with almost no capital risk — franchisees pay to use the name', marks: 2 },
        { text: 'However, Rise & Shine earns only 6% of franchise sales and loses direct control — a poor franchisee can damage the whole brand', marks: 2 },
        { text: 'A mix could work: keep opening company-owned cafés where demand is proven, franchise in distant towns it cannot supervise', marks: 2 },
        { text: 'Justified judgement: given £120,000 profit, it could self-fund only about one café a year, so franchising (with tight quality contracts) is the faster route to a national brand', marks: 2 },
      ],
      explain:
        'For full marks compare both routes against the figures (cost, speed, control, risk), then commit to a recommendation and defend it.',
    },
    {
      id: 'w14',
      type: 'written',
      topic: '2.3',
      difficulty: 3,
      marks: 6,
      stem: 'Analyse the likely effects on employees and customers of The Dough House merging with a rival bakery chain.',
      extract: {
        title: 'A bakery merger',
        text: 'The Dough House plans to merge with a five-branch rival. The combined business would close two overlapping shops and centralise purchasing.',
      },
      points: [
        { text: 'Employees in the two closed shops face redundancy — job losses and insecurity even for those who remain', marks: 2 },
        { text: 'Customers near closed shops lose their local bakery and may defect to supermarkets', marks: 2 },
        { text: 'Centralised purchasing cuts ingredient costs, which could lower prices or improve quality for the customers who remain', marks: 2 },
      ],
      explain:
        'One effect on employees and one on customers, each developed with a consequence — use the closures and the purchasing detail from the case.',
    },
    {
      id: 'w15',
      type: 'written',
      topic: '2.4',
      difficulty: 3,
      marks: 9,
      stem: 'Discuss the importance of the product life cycle for a business deciding when to invest in a new product.',
      extract: {
        title: 'Rise & Shine — cold brew cans',
        text: 'Rise & Shine launched canned cold brew coffee from its roastery. Sales grew 80% in the first year, but two national chains have now launched their own canned cold brew.',
      },
      points: [
        { text: 'The 80% growth shows the product is in the growth stage — the peak opportunity to invest while sales are rising fast', marks: 2 },
        { text: 'Life-cycle thinking warns that growth cannot last: as rivals enter, the market moves to maturity, prices fall and margins shrink', marks: 2 },
        { text: 'Investing NOW captures market share before maturity; waiting risks arriving when the market is crowded and unprofitable', marks: 2 },
        { text: 'The life cycle is a model, not a forecast — its length varies, so Rise & Shine should also watch sales data and rivals’ launches rather than assume a pattern', marks: 2 },
        { text: 'Extension strategies (new flavours, seasonal editions) can prolong the cycle once maturity nears', marks: 1 },
      ],
      explain:
        'Explain the stages, link the case evidence to the growth stage, then evaluate: the model guides timing but real sales data should confirm it.',
    },
    {
      id: 'w16',
      type: 'written',
      topic: '2.4',
      difficulty: 3,
      marks: 6,
      stem: 'Analyse the impact on Crumb & Craft of adopting a competitive pricing strategy to match supermarket sourdough prices.',
      extract: {
        title: 'Crumb & Craft — pricing pressure',
        text: 'Supermarkets now sell sourdough loaves for £1.40. Crumb & Craft charges £3.20. Its variable cost per loaf is £1.20, and its hand-made output is 900 loaves a week, near capacity.',
      },
      points: [
        { text: 'Matching £1.40 would leave only £0.20 per loaf over variable cost — contribution would collapse by 87%, barely covering fixed costs like rent', marks: 2 },
        { text: 'At near-full capacity it cannot win on volume, so lower prices would mainly destroy profit', marks: 2 },
        { text: 'Its differentiation (hand-made, local, premium) is what justifies £3.20 — competitive pricing would blur that position and attract price-focused customers it cannot serve profitably', marks: 2 },
      ],
      explain:
        'The arithmetic is the heart of it: at £1.40 the margin per loaf is £0.20. A strong answer connects that to capacity and brand position.',
    },
    {
      id: 'w17',
      type: 'written',
      topic: '2.5',
      difficulty: 3,
      marks: 9,
      stem: 'A UK shoe retailer sources 70% of its products from overseas factories. Discuss the possible effects on the business and its stakeholders of bringing production back to the UK.',
      extract: {
        title: 'Reshoring decision',
        text: 'The retailer employs 40 staff in UK shops and none in production. Overseas production is 30% cheaper per pair, but shipping takes 8 weeks and fashion changes quickly.',
      },
      points: [
        { text: 'Production costs per pair would rise (overseas is 30% cheaper), squeezing margins or forcing higher prices on customers', marks: 2 },
        { text: 'UK production allows much shorter lead times — the retailer can respond to fashion changes instead of guessing 8 weeks ahead', marks: 2 },
        { text: 'Stakeholders: new UK manufacturing jobs are created; existing shop staff benefit from a “made in Britain” story; overseas factory workers may lose orders', marks: 2 },
        { text: 'Fewer long shipments could cut transport emissions and supply-chain risk (port delays, currency swings)', marks: 2 },
        { text: 'Judgement: the 30% cost rise must be weighed against fewer unsold stock write-offs from missed trends — for a fashion retailer, speed often wins', marks: 1 },
      ],
      explain:
        'Cover business effects (cost vs speed) AND stakeholder effects (workers at home and abroad, customers), then judge using the 8-week lead time detail.',
    },
    {
      id: 'w18',
      type: 'written',
      topic: '2.5',
      difficulty: 3,
      marks: 6,
      stem: 'Explain one way in which ethical behaviour could increase costs for a business, and one way in which it could increase revenue.',
      points: [
        { text: 'Costs: paying suppliers a fair price or using sustainable packaging raises unit costs — e.g. recycled cups cost more than standard ones', marks: 3 },
        { text: 'Revenue: ethical behaviour builds trust and brand loyalty, attracting customers who actively choose responsible businesses and are willing to pay more', marks: 3 },
      ],
      explain:
        'One developed cost point and one developed revenue point, each showing the mechanism (higher inputs vs stronger demand).',
    },
    {
      id: 'w19',
      type: 'written',
      topic: '1.3',
      difficulty: 3,
      marks: 6,
      stem: 'Crumb & Craft is considering hiring a part-time assistant baker on a zero-hours contract instead of a fixed part-time contract. Analyse the impact of this choice on the business and on the assistant.',
      points: [
        { text: 'The business gains flexibility — staffing can match busy weekends and drop in quiet weeks, keeping wage costs down', marks: 2 },
        { text: 'The assistant has no guaranteed hours or income, making their pay unreliable and their financial planning hard', marks: 2 },
        { text: 'Unhappy, insecure staff may leave or perform less well, and the bakery’s reputation as an employer could suffer in a small town', marks: 2 },
      ],
      explain:
        'Impact on BOTH sides is required — flexibility for the firm, insecurity for the worker — with the link between insecure staff and business performance developed.',
    },
    {
      id: 'w20',
      type: 'written',
      topic: '2.2',
      difficulty: 3,
      marks: 6,
      stem: 'Style on Wheels is deciding between storing hairdressing supplies at home (holding stock) and ordering small amounts weekly from a wholesaler. Analyse the impact of holding more stock on the business.',
      extract: {
        title: 'Style on Wheels — stock choice',
        text: 'Priya uses about £180 of supplies a week. A wholesaler offers free delivery on orders over £250, or a £12 delivery charge on smaller orders.',
      },
      points: [
        { text: 'Ordering over £250 to get free delivery saves the £12 charge on every small order — bulk buying cuts unit costs', marks: 2 },
        { text: 'But holding more stock ties up money in supplies sitting on shelves and needs secure storage space at home', marks: 2 },
        { text: 'Fashion products change — large stock of last season’s colours may never be used, so the saving becomes waste', marks: 2 },
      ],
      explain:
        'Bulk-buy savings must be weighed against tied-up cash, storage and the risk of stock becoming obsolete — the strongest answers quantify the £12 vs £180.',
    },
  ],
};

export default longform;

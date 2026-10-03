// Revision notes for the student Revise section — one structured note per
// spec topic. Structured and condensed from KNOWLEDGE (src/data/knowledge.ts),
// which is derived from the endorsed Hodder textbook (2nd ed) + the Pearson
// 1BS0 specification. Everything here restates that source — no invented
// facts. British English; bullets kept short and scannable.

export interface NoteSection {
  heading: string;
  points: string[];
}

export interface KeyTerm {
  term: string;
  def: string;
}

export interface Formula {
  name: string;
  formula: string;
  example: string;
}

export interface TopicNote {
  topic: string; // '1.1' … '2.5'
  title: string;
  blurb: string; // one line
  readMins: number; // estimated reading time
  sections: NoteSection[]; // 3-6 sections
  keyTerms: KeyTerm[]; // 6-10 key terms with crisp definitions
  formulas?: Formula[]; // only for quantitative topics (1.3, 2.4)
  examTips: string[]; // 2-4 examiner-style tips
}

export const TOPIC_NOTES: Record<string, TopicNote> = {
  '1.1': {
    topic: '1.1',
    title: 'Enterprise and entrepreneurship',
    blurb: 'Why business ideas happen, risk versus reward, and how entrepreneurs add value.',
    readMins: 3,
    sections: [
      {
        heading: 'The dynamic nature of business',
        points: [
          'Business is dynamic — it changes constantly in response to technology, tastes and competition.',
          'Changed technology creates openings: e-commerce, smartphone apps, 3D printing, contactless payments.',
          'Changed consumer tastes create demand — healthier food and ethical products are the classic examples.',
          'Changes in what is possible let products be made and sold in entirely new ways.',
          'Entrepreneurs spot the gaps in the market that these changes leave behind.',
        ],
      },
      {
        heading: 'Risk and reward',
        points: [
          'Entrepreneurs take a risk with their own money and their own time.',
          'The reward for success is profit, independence and personal satisfaction.',
          'The risk is business failure, loss of savings and debt.',
        ],
      },
      {
        heading: 'Adding value',
        points: [
          'Adding value: selling a product for more than the cost of the bought-in materials used to make it.',
          'Value added = selling price − cost of bought-in materials.',
          'Ways to add value: branding, excellent service, convenience or speed, unique design, quality, packaging.',
          'A franchise adds value through a recognised brand.',
        ],
      },
      {
        heading: 'Enterprise and the entrepreneur',
        points: [
          'Enterprise involves risk-taking to produce goods or services.',
          'Successful enterprise creates jobs and wealth for the economy.',
          'Entrepreneurship is the act of setting up a business, taking financial risk in the hope of profit.',
          'Successful entrepreneurs show determination and initiative.',
          'They take advice willingly and learn from failure.',
        ],
      },
      {
        heading: 'Case study: Innocent Drinks',
        points: [
          'Started in 1999 by three friends: Richard Reed, Adam Balon and Jon Wright.',
          'They spent £500 on fruit for a smoothie stall at a music festival.',
          'Customers posted bottles into bins marked “yes” or “no” — should the friends quit their jobs?',
          'The “yes” bin filled first, so they launched the business.',
          'Coca-Cola became the majority owner from 2013.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Entrepreneur', def: 'A person who sets up a business, taking on financial risk in the hope of profit.' },
      { term: 'Entrepreneurship', def: 'The act of setting up a business, taking on financial risk in the hope of profit.' },
      { term: 'Dynamic nature of business', def: 'Business changes constantly, because technology, consumer tastes and competition never stand still.' },
      { term: 'Business enterprise', def: 'Risk-taking to produce goods or services, creating jobs and wealth for the economy.' },
      { term: 'Adding value', def: 'Selling a product for more than the cost of the bought-in materials used to make it.' },
      { term: 'Reward', def: 'The return for entrepreneurial risk: profit, independence and personal satisfaction.' },
      { term: 'Risk', def: 'The downside an entrepreneur accepts: business failure, loss of savings and debt.' },
    ],
    examTips: [
      'Learn the three reasons new ideas emerge — technology, consumer tastes, what is possible. “State two reasons” questions come up every year.',
      'Adding-value questions want the formula AND examples — give two ways of adding value (e.g. branding, convenience) for two marks.',
      'Know one entrepreneur case study in detail (Innocent) — real examples earn application marks.',
      'Innocent details earn marks: 1999, £500 of fruit, and the “yes” bin — learn them precisely.',
    ],
  },

  '1.2': {
    topic: '1.2',
    title: 'Spotting a business opportunity',
    blurb: 'Customer needs, market research, segmentation, market mapping and reading the competition.',
    readMins: 4,
    sections: [
      {
        heading: 'Customer needs',
        points: [
          'Businesses succeed by meeting customer needs better than rivals do.',
          'Price — must reflect perceived value and be affordable for the target segment.',
          'Quality — fitness for purpose and reliability.',
          'Choice — a range of products, so customers feel in control.',
          'Convenience — easy to find, opening hours that suit, online access.',
        ],
      },
      {
        heading: 'Market research',
        points: [
          'Market research reduces risk and uncertainty by finding out what customers want.',
          'Primary (field) research gathers new data first-hand: surveys, questionnaires, focus groups, observation.',
          'Primary data is new and specific to the business — but costly and possibly biased.',
          'Secondary (desk) research uses existing sources: websites, reports, government statistics, competitor data.',
          'Secondary research is cheap and quick — but may be out of date or not fit for purpose.',
          'Qualitative research explores opinions (focus groups); quantitative research counts (survey data).',
        ],
      },
      {
        heading: 'Market segmentation',
        points: [
          'Segmentation splits a market into groups of customers with similar characteristics.',
          'By location — region, city or countryside.',
          'By demographics — age, gender, income, religion, ethnicity, family size.',
          'By lifestyle — interests, hobbies and opinions.',
          'Around 1.2 million UK vegetarians prompted food firms to launch veggie ranges.',
          'Segmentation lets a business target its products and promotions precisely.',
        ],
      },
      {
        heading: 'Market mapping',
        points: [
          'A market map plots businesses on two axes — for example price against quality.',
          'It shows where the market is crowded and where gaps exist.',
          'A gap suggests an unmet customer need that a new business could fill.',
        ],
      },
      {
        heading: 'The competitive environment',
        points: [
          'Markets with many strong competitors are hard to enter.',
          'UK supermarkets — Tesco, Sainsbury’s, Asda, Morrisons, Aldi, Lidl — are the classic crowded market.',
          'A competitor’s strengths include price, quality, brand, service and location.',
          'Start-ups should study rivals before launching; small firms survive by differentiating.',
          'Technology lets even tiny firms compete online — ASOS grew because online fashion suits young customers.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Market research', def: 'Gathering information about what customers want, to reduce the risk and uncertainty of business decisions.' },
      { term: 'Primary (field) research', def: 'New, first-hand data gathered directly — surveys, questionnaires, focus groups or observation.' },
      { term: 'Secondary (desk) research', def: 'Using data that already exists — websites, reports, government statistics and competitor data.' },
      { term: 'Qualitative research', def: 'Research that explores opinions and reasons — e.g. focus group discussions.' },
      { term: 'Quantitative research', def: 'Research that counts and measures — e.g. survey data expressed in numbers.' },
      { term: 'Market segmentation', def: 'Splitting a market into groups of customers with similar characteristics.' },
      { term: 'Demographics', def: 'Statistics describing a population — age, gender, income, religion, ethnicity, family size.' },
      { term: 'Market map', def: 'A diagram plotting businesses on two axes (e.g. price vs quality) to reveal crowded areas and gaps.' },
      { term: 'Gap in the market', def: 'An unmet customer need — an area where few or no existing businesses operate.' },
    ],
    examTips: [
      'Evaluate research from both sides: primary is specific but costly; secondary is cheap but may be out of date.',
      'Learn the three segmentation bases — location, demographics, lifestyle — with one example of each.',
      'When reading a market map, describe the GAP (e.g. high quality at low price), not just the axes.',
    ],
  },

  '1.3': {
    topic: '1.3',
    title: 'Putting a business idea into practice',
    blurb: 'Aims and objectives, revenue and costs, break-even, cash flow and sources of finance.',
    readMins: 5,
    sections: [
      {
        heading: 'Aims and objectives',
        points: [
          'Aims are long-term goals: survival, profit, growth, market share, providing a service to the community.',
          'Objectives are SMART targets that help a business measure progress.',
          'Common financial objectives: survival, profit maximisation, sales growth, market share.',
          'Objectives differ because owners differ.',
          'A sole trader may aim for a comfortable living; a charity aims to serve the community.',
        ],
      },
      {
        heading: 'Revenue, costs and profit',
        points: [
          'Revenue = price × quantity sold.',
          'Total costs = fixed costs + variable costs.',
          'Fixed costs do not change with output (rent); variable costs do (materials).',
          'Profit = total revenue − total costs; a loss occurs when costs exceed revenue.',
          'Start-ups often make losses in their early months.',
        ],
      },
      {
        heading: 'Break-even',
        points: [
          'Break-even is the output level where total revenue equals total costs — no profit, no loss.',
          'Contribution per unit = selling price − variable cost per unit.',
          'Break-even output = fixed costs ÷ contribution per unit.',
          'Margin of safety = actual (or budgeted) output − break-even output.',
          'A break-even chart plots total revenue and total costs against output; break-even is where the lines cross.',
          'Banks use break-even to judge loan applications; it also shows the effect of price changes.',
        ],
      },
      {
        heading: 'Cash is not the same as profit',
        points: [
          'A profitable business can still run out of cash.',
          'Causes: buying too much stock, or customers paying late.',
          'Cash inflow: money entering the business — cash sales, loans, capital.',
          'Cash outflow: money leaving — wages, rent, materials.',
          'Net cash flow = inflows − outflows; closing balance = opening balance + net cash flow.',
          'A cash flow forecast predicts flows month by month, warning of shortages so an overdraft can be arranged.',
        ],
      },
      {
        heading: 'Sources of finance for a small business',
        points: [
          'Personal savings — the owner’s own capital.',
          'Retained profit — earnings reinvested back into the business.',
          'Loans from family and friends; bank loans, repaid with interest.',
          'Overdrafts cover small, short-term cash gaps.',
          'Trade credit — paying suppliers later.',
          'Leasing — renting equipment instead of buying it.',
          'Crowdfunding raises small amounts from many people online (e.g. Kickstarter).',
          'Grants from government or local authorities, often for businesses in areas needing jobs.',
        ],
      },
      {
        heading: 'Capital vs revenue expenditure',
        points: [
          'Capital expenditure buys fixed assets that last — premises, machinery.',
          'Revenue expenditure covers day-to-day running costs.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Aims vs objectives', def: 'Aims are long-term goals; objectives are the SMART targets used to measure progress towards them.' },
      { term: 'Fixed costs', def: 'Costs that do not change with the level of output, such as rent.' },
      { term: 'Variable costs', def: 'Costs that rise and fall with the level of output, such as materials.' },
      { term: 'Break-even', def: 'The level of output where total revenue equals total costs — no profit, no loss.' },
      { term: 'Margin of safety', def: 'The amount by which actual (or budgeted) output exceeds break-even output.' },
      { term: 'Cash flow forecast', def: 'A month-by-month prediction of cash inflows and outflows, warning of shortages in advance.' },
      { term: 'Trade credit', def: 'An arrangement to pay suppliers later, after receiving the goods.' },
      { term: 'Crowdfunding', def: 'Raising small amounts of money from a large number of people, usually online.' },
      { term: 'Capital expenditure', def: 'Spending on fixed assets that last, such as premises and machinery.' },
      { term: 'Revenue expenditure', def: 'Spending on the day-to-day running costs of the business.' },
    ],
    formulas: [
      { name: 'Revenue', formula: 'revenue = price × quantity sold', example: 'Sell 500 smoothies at £3 each → revenue = £1,500.' },
      { name: 'Total costs', formula: 'total costs = fixed costs + variable costs', example: 'Fixed costs £800 + variable costs £200 (400 units × £0.50) = £1,000.' },
      { name: 'Profit', formula: 'profit = total revenue − total costs', example: 'Revenue £1,500 − total costs £1,000 = £500 profit.' },
      { name: 'Contribution per unit', formula: 'contribution = selling price − variable cost per unit', example: 'Price £3.00 − variable cost £1.00 = £2.00 contribution per unit.' },
      { name: 'Break-even output', formula: 'break-even output = fixed costs ÷ contribution per unit', example: 'Fixed costs £800 ÷ £2.00 contribution = 400 units to break even.' },
      { name: 'Margin of safety', formula: 'margin of safety = actual output − break-even output', example: 'Actual output 550 units − break-even 400 = margin of safety of 150 units.' },
      { name: 'Net cash flow', formula: 'net cash flow = cash inflows − cash outflows', example: 'Inflows £4,000 − outflows £3,200 = net cash flow of +£800.' },
      { name: 'Closing balance', formula: 'closing balance = opening balance + net cash flow', example: 'Opening balance £200 + net cash flow £800 = £1,000 closing balance.' },
    ],
    examTips: [
      'Show every stage of a break-even calculation — formula, substitution, answer. Missing stages lose marks.',
      'Define contribution before using it: selling price minus variable cost per unit. The definition is worth a mark on its own.',
      'Cash vs profit is an examiner favourite: a profitable firm can fail if stock ties up cash or customers pay late.',
      'Match each source of finance to its use — overdrafts for small short-term gaps; loans for large long-term spending.',
    ],
  },

  '1.4': {
    topic: '1.4',
    title: 'Making the business effective',
    blurb: 'Ownership options, franchising, location, the marketing mix, business plans and stakeholders.',
    readMins: 4,
    sections: [
      {
        heading: 'Sole traders and partnerships',
        points: [
          'A sole trader has one owner — quick decisions, and all profit goes to the owner.',
          'Sole traders have unlimited liability: personal assets are at risk if the business fails.',
          'The owner is personally responsible for all the business’s debts.',
          'A partnership has 2–20 owners sharing skills and capital — and usually unlimited liability too.',
          'Partners can share decisions, making the business more risk-tolerant.',
        ],
      },
      {
        heading: 'Limited companies',
        points: [
          'A limited company (Ltd) is a separate legal entity from its owners.',
          'Limited liability: owners can only lose the amount they invested.',
          'But accounts must be filed publicly, and raising money is harder than as a PLC.',
        ],
      },
      {
        heading: 'Franchising',
        points: [
          'Franchising buys the right to trade under an established brand (McDonald’s, Krispy Kreme outlets in the UK).',
          'The franchisee pays a fee and a share of revenue (a royalty) to the franchisor.',
          'Benefits: a recognised brand, training, national marketing and a lower failure rate.',
          'Drawbacks: less independence, revenue shared away, and the franchisor’s rules must be followed.',
        ],
      },
      {
        heading: 'Business location',
        points: [
          'For retail, location means footfall, nearby competition and the cost of premises.',
          'Manufacturing wants nearness to raw materials, motorways and labour.',
          'E-commerce can remove the need for a physical shop entirely.',
          'ASOS sells fashion online only — having no stores keeps costs low.',
        ],
      },
      {
        heading: 'The marketing mix (4Ps)',
        points: [
          'Product — design, quality, branding, USP.',
          'Price — list price, discounts, credit.',
          'Promotion — advertising, social media, sponsorship, PR.',
          'Place — distribution: where the product is sold (shops, online, mail order).',
          'The four Ps must work together for the target market.',
        ],
      },
      {
        heading: 'Business plans and stakeholders',
        points: [
          'A business plan sets out the idea, target market, marketing plan, costs, revenues and cash flow forecast.',
          'It persuades lenders and investors, and reduces the risk of failure.',
          'A poor or missing plan is a common cause of business failure.',
          'Stakeholders are any individuals or groups affected by, or with an interest in, the business.',
          'Owners, employees, customers, suppliers, lenders, the local community and government are all stakeholders.',
          'Interests conflict — employees want higher wages; owners want lower costs — so the business must balance them.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Sole trader', def: 'A business owned by one person, who keeps all the profit and has unlimited liability.' },
      { term: 'Unlimited liability', def: 'The owner is personally responsible for all business debts — personal assets are at risk.' },
      { term: 'Partnership', def: 'A business with 2–20 owners who share skills, capital and usually unlimited liability.' },
      { term: 'Limited liability', def: 'Owners can only lose the amount they invested — personal assets are protected.' },
      { term: 'Limited company (Ltd)', def: 'A business that is a separate legal entity from its owners, whose accounts must be filed publicly.' },
      { term: 'Franchisee', def: 'A person who buys the right to trade under an established brand, paying a fee and royalties.' },
      { term: 'Franchisor', def: 'The business that sells the right to trade under its brand and sets the rules franchisees follow.' },
      { term: 'Marketing mix', def: 'The combination of product, price, promotion and place used to meet the target market’s needs.' },
      { term: 'Business plan', def: 'A document setting out the idea, target market, marketing plan, costs, revenues and cash flow forecast.' },
      { term: 'Stakeholder', def: 'Any individual or group affected by, or with an interest in, the business.' },
    ],
    examTips: [
      'Ownership questions are trade-off questions — give a benefit AND a drawback, then recommend with a reason.',
      'Franchising: learn the pairs — recognised brand vs lost independence; national marketing vs royalties paid away.',
      'Business plan answers should explain WHY it matters (persuades lenders, reduces failure risk), not just list contents.',
    ],
  },

  '1.5': {
    topic: '1.5',
    title: 'Understanding external influences',
    blurb: 'Technology, ethics and the environment, the economy, and the laws every business must follow.',
    readMins: 5,
    sections: [
      {
        heading: 'Technology and business',
        points: [
          'Technology changes how businesses operate — e-commerce and smartphone apps have changed shopping.',
          'Automation changes how products are made.',
          'Firms that fail to adapt can be destroyed by change — think Blockbuster and Kodak.',
          'Stakeholders feel the change: employees may need retraining; customers expect 24/7 service.',
        ],
      },
      {
        heading: 'Business ethics',
        points: [
          'Ethics means doing what is morally right, beyond the legal minimum.',
          'Examples: fair treatment of suppliers (Fairtrade), fair wages, honest marketing, avoiding pollution.',
          'Ethical behaviour can attract customers and make recruitment easier — but it may raise costs.',
          'Unethical behaviour — child labour, pollution, false claims — can cause boycotts and lost sales.',
        ],
      },
      {
        heading: 'The environment',
        points: [
          'Environmental issues: pollution of land, air and water; waste disposal; recycling.',
          'Pressure groups and customers push firms to act — Innocent uses 100% recycled bottles.',
          'Being greener can cut costs (less packaging, less energy) — or raise them.',
        ],
      },
      {
        heading: 'The economy',
        points: [
          'Interest rates: when the Bank of England raises rates, borrowing costs more.',
          'Higher rates hit demand for houses, cars and loans.',
          'Inflation: rising prices squeeze customer spending and raise business costs — firms must decide whether to raise prices.',
          'Unemployment: fewer customers have income — but recruiting is easier and wages are lower.',
          'Income changes: growing incomes raise demand; falling incomes hit sales of luxuries.',
          'Exchange rates are quoted as £1 = $X; if £1 buys more dollars, sterling is strong.',
          'A weaker pound makes exports cheaper abroad and imports dearer.',
          'The UK’s trade balance is the difference between the value of exports and imports.',
        ],
      },
      {
        heading: 'Legislation',
        points: [
          'Consumer Rights Act 2015: goods must be satisfactory quality, fit for purpose and as described.',
          'Health and Safety at Work Act 1974: a safe workplace, training and protective equipment.',
          'National Minimum Wage: a legal floor on hourly pay that rises most years.',
          'Equality Act 2010: no discrimination on grounds of age, gender, race, religion, sexuality or disability.',
          'Breaking laws brings fines, claims and reputational damage.',
        ],
      },
      {
        heading: 'Staying competitive',
        points: [
          'New competitors can enter markets quickly.',
          'Businesses must keep improving quality and productivity to survive.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Ethics', def: 'Doing what is morally right, beyond the legal minimum.' },
      { term: 'Pressure group', def: 'An organisation that campaigns to change business or government behaviour, e.g. on the environment.' },
      { term: 'Interest rate', def: 'The cost of borrowing money, influenced by the Bank of England; higher rates make loans dearer.' },
      { term: 'Inflation', def: 'A general rise in prices over time; it squeezes customer spending and raises business costs.' },
      { term: 'Unemployment', def: 'When people who want work cannot find it — it cuts customer income but eases recruitment.' },
      { term: 'Exchange rate', def: 'The price of one currency in another, e.g. £1 = $X; a weaker pound makes exports cheaper and imports dearer.' },
      { term: 'Trade balance', def: 'The difference between the value of a country’s exports and its imports.' },
      { term: 'Consumer Rights Act 2015', def: 'Goods must be of satisfactory quality, fit for purpose and as described; faulty goods can be returned.' },
      { term: 'Health and Safety at Work Act 1974', def: 'Requires a safe workplace, training and protective equipment for employees.' },
      { term: 'Equality Act 2010', def: 'Outlaws discrimination in hiring or service on grounds of age, gender, race, religion, sexuality or disability.' },
    ],
    examTips: [
      'Learn the four laws by name and year — and what each demands of a business. Matching law to scenario is a classic MCQ.',
      'Exchange rate logic: weaker pound → exports cheaper, imports dearer. Practise saying it both ways round.',
      'Ethics and environment answers need judgement: acknowledge the higher costs, then weigh reputation, customers and recruitment.',
    ],
  },

  '2.1': {
    topic: '2.1',
    title: 'Growing the business',
    blurb: 'Organic growth, mergers and takeovers, PLCs, economies of scale and globalisation.',
    readMins: 4,
    sections: [
      {
        heading: 'Organic growth',
        points: [
          'Organic (internal) growth comes from within the business.',
          'Routes: opening more branches, launching new products, growing sales.',
          'Lidl and Aldi grew rapidly in the UK by opening hundreds of new stores.',
        ],
      },
      {
        heading: 'Inorganic growth: mergers and takeovers',
        points: [
          'A merger combines two firms; a takeover (acquisition) is one firm buying another.',
          'A hostile takeover happens against the wishes of the target’s board.',
          'Sainsbury’s bought Argos in 2016 for £1.4bn — gaining Argos concessions inside its supermarkets.',
          'Morrisons bought the convenience chain McColl’s out of administration in 2022 for £190m.',
          'Facebook bought Instagram in 2012 for about $1bn.',
          'Kraft’s 2010 takeover of Cadbury (around £11.5bn) was hostile until the board accepted.',
          'Online estate agent Purplebricks was sold to rival Strike for £1 in 2023 after its share price collapsed.',
        ],
      },
      {
        heading: 'Becoming a PLC',
        points: [
          'A PLC (public limited company) can sell shares on a stock exchange such as the London Stock Exchange.',
          'This raises large sums for growth.',
          'Drawback: risk of takeover — another firm can buy enough shares.',
          'Drawback: pressure from shareholders for short-term profit.',
          'Accounts must be published, and ownership and control are divorced.',
        ],
      },
      {
        heading: 'Horizontal and vertical integration',
        points: [
          'A merger combining two competitors is horizontal integration.',
          'Buying a supplier is vertical (backward) integration.',
        ],
      },
      {
        heading: 'Economies and diseconomies of scale',
        points: [
          'Economies of scale lower average costs as output grows.',
          'Purchasing (bulk discounts); technical (bigger machines); managerial; financial (cheaper loans); risk-bearing.',
          'Diseconomies of scale raise average costs when firms become too big to manage.',
          'Poor communication is the classic cause of diseconomies.',
        ],
      },
      {
        heading: 'Globalisation',
        points: [
          'Globalisation is the increasing integration of world economies.',
          'Multinationals — Apple, Nike, Unilever — operate in many countries.',
          'Trade is encouraged by the internet, cheaper transport and trade blocs such as the EU single market.',
          'Globalisation brings import competition, cheaper labour and suppliers abroad, and export opportunities.',
          'Growth must increasingly be sustainable — firms publish carbon targets.',
          'Fast growth can strain quality and cash.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Organic growth', def: 'Expansion from within the business — more branches, new products, growing sales.' },
      { term: 'Merger', def: 'Two firms agree to combine into one business.' },
      { term: 'Takeover (acquisition)', def: 'One firm buys another — sometimes against the target board’s wishes.' },
      { term: 'Hostile takeover', def: 'A takeover opposed by the target company’s board of directors.' },
      { term: 'Public limited company (PLC)', def: 'A company whose shares can be sold on a stock exchange to raise large sums.' },
      { term: 'Horizontal integration', def: 'Combining two businesses at the same stage of the market — e.g. two competitors.' },
      { term: 'Vertical integration', def: 'Combining businesses at different stages — e.g. buying a supplier (backward integration).' },
      { term: 'Economies of scale', def: 'Falling average costs as output grows — purchasing, technical, managerial, financial, risk-bearing.' },
      { term: 'Diseconomies of scale', def: 'Rising average costs when a firm becomes too big to manage efficiently.' },
      { term: 'Globalisation', def: 'The increasing integration of world economies through trade, technology and multinationals.' },
    ],
    examTips: [
      'Learn one real merger AND one real takeover with figures — real examples earn application marks.',
      'PLC drawbacks are evaluation gold: takeover risk, short-term shareholder pressure, published accounts.',
      'Name all five economies of scale — purchasing, technical, managerial, financial, risk-bearing — for full marks.',
    ],
  },

  '2.2': {
    topic: '2.2',
    title: 'Making marketing decisions',
    blurb: 'Product, price, promotion and place — the decisions that put a product in front of customers.',
    readMins: 5,
    sections: [
      {
        heading: 'Product',
        points: [
          'Design and quality must fit the target market.',
          'A USP differentiates: Innocent’s natural ingredients, Dyson’s design.',
          'Branding builds recognition and allows premium pricing — Apple is the classic case.',
        ],
      },
      {
        heading: 'The product life cycle',
        points: [
          'Development — no sales yet, high costs.',
          'Introduction — low sales, promotion-heavy.',
          'Growth — sales and profits rise.',
          'Maturity — sales peak; competition is strong.',
          'Extension strategies: update the product or find new markets.',
          'Decline — sales fall; the product may be withdrawn.',
          'A product portfolio (Unilever has 400+ brands) spreads risk across products at different stages.',
        ],
      },
      {
        heading: 'Pricing strategies',
        points: [
          'Price skimming: launch high, then lower the price — common with new technology.',
          'Penetration pricing: launch low to win market share, then raise the price.',
          'Price discrimination: different prices for different groups — off-peak cinema.',
          'Psychological pricing: £9.99 instead of £10.',
          'Loss leaders: some items sold below cost to attract custom — used by supermarkets.',
          'Cost-plus pricing: a markup on unit cost; competitive pricing: matching rivals.',
          'Dynamic pricing: prices change with demand — Uber surge pricing, airline seats.',
          'Ryanair keeps prices low: no frills, fast turnarounds, secondary airports.',
        ],
      },
      {
        heading: 'Promotion',
        points: [
          'Advertising: TV, radio, print, cinema.',
          'Social media and influencers (Instagram, TikTok) — cheap and precisely targeted.',
          'Sponsorship and PR (press coverage).',
          'Special offers such as BOGOF; direct mail.',
          'Search advertising: businesses bid on keywords (Google Ads).',
          'Promotion must suit the target market and be affordable.',
          'Digital promotion can be measured precisely.',
        ],
      },
      {
        heading: 'Place',
        points: [
          'Direct to the customer: farmer’s market, own website — ASOS is online only.',
          'Via a retailer (e.g. Tesco), or via a wholesaler and then a retailer.',
          'E-commerce has changed place: click and collect, home delivery, apps.',
          'Channel choice balances cost, control and customer convenience.',
          'Selling via retailers sacrifices margin.',
        ],
      },
      {
        heading: 'An integrated mix',
        points: [
          'The 4Ps must work together for the target market.',
          'A premium product needs a premium price, quality promotion and an upmarket place.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Unique selling point (USP)', def: 'The feature that makes a product different from rivals — e.g. Innocent’s natural ingredients.' },
      { term: 'Brand', def: 'The identity of a product in customers’ minds; strong brands command premium prices.' },
      { term: 'Product life cycle', def: 'The stages a product passes through: development, introduction, growth, maturity, decline.' },
      { term: 'Extension strategy', def: 'Action to prolong maturity — updating the product or finding new markets.' },
      { term: 'Price skimming', def: 'Launching at a high price, then lowering it over time — common with new technology.' },
      { term: 'Penetration pricing', def: 'Launching at a low price to win market share, then raising it.' },
      { term: 'Loss leader', def: 'A product sold below cost to attract customers who then buy other items.' },
      { term: 'Dynamic pricing', def: 'Prices that move with demand — e.g. Uber surge pricing.' },
      { term: 'Promotion', def: 'How a business communicates with customers — advertising, social media, sponsorship, PR, offers.' },
      { term: 'Distribution channel', def: 'The route a product takes to reach the customer — direct, via a retailer, or via a wholesaler.' },
    ],
    examTips: [
      'Learn the life cycle stages IN ORDER, with one strategy matched to each stage.',
      'For every pricing strategy, know a product example — applied definitions score, bare definitions don’t.',
      'Top answers link the 4Ps: never evaluate price without connecting it to product, promotion and place.',
    ],
  },

  '2.3': {
    topic: '2.3',
    title: 'Making operational decisions',
    blurb: 'Production methods, technology and productivity, stock, suppliers, quality and the sales process.',
    readMins: 5,
    sections: [
      {
        heading: 'Production methods',
        points: [
          'Operations transform inputs — materials, labour, capital — into outputs: goods and services.',
          'Job production: one-off, customised products — a wedding cake, a bespoke suit.',
          'Job is high skill, high price and slow.',
          'Batch production: groups of identical items move through stages together — a bakery’s different breads.',
          'Batch is more flexible than flow, but needs cleaning and changeover between batches.',
          'Flow (line) production: continuous mass production of identical items — Cadbury and Mars bars.',
          'Flow gives very low unit costs but is inflexible and costly to set up.',
        ],
      },
      {
        heading: 'Technology and productivity',
        points: [
          'Productivity = output ÷ number of employees (or per machine-hour).',
          'Automation and robotics raise productivity and consistency.',
          'CAD/CAM speeds up design and production.',
          '3D printing allows rapid prototyping.',
        ],
      },
      {
        heading: 'Managing stock',
        points: [
          'Buffer stock protects against late deliveries.',
          'Too much stock ties up cash and risks damage or theft.',
          'Too little stock causes stockouts and lost sales.',
          'Just-in-time (JIT) keeps stock near zero — parts arrive exactly when needed (Toyota).',
          'JIT benefits: lower storage costs and less waste.',
          'JIT risk: any supply hiccup halts production.',
          'Re-order level = (average usage per day × lead time in days) + buffer stock.',
        ],
      },
      {
        heading: 'Working with suppliers',
        points: [
          'Reliable suppliers — good quality, on-time delivery — matter more than the lowest price.',
          'Long-term partnerships improve quality and trust.',
          'Changing supplier has costs: re-tooling and risk.',
          'Never depend on a single supplier.',
        ],
      },
      {
        heading: 'Managing quality',
        points: [
          'Quality control inspects finished products — faults are found late and wastage is high.',
          'Quality assurance checks quality at every stage.',
          'Total Quality Management (TQM) makes every employee responsible for quality.',
          'Kaizen means continuous improvement in small steps — a Japanese idea used worldwide.',
          'Poor quality causes returns, complaints, lost reputation and higher costs.',
        ],
      },
      {
        heading: 'The sales process',
        points: [
          'Pre-sales: handling enquiries.',
          'The sale itself: advice, demonstrating, closing.',
          'Post-sales: delivery, installation, after-sales service and support.',
          'Good customer service builds repeat custom and recommendations.',
          'Technology has changed selling: live chat, online reviews, one-click ordering.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Job production', def: 'Producing one-off, customised items to order — high skill, high price, slow.' },
      { term: 'Batch production', def: 'Producing groups of identical items that move through stages together.' },
      { term: 'Flow production', def: 'Continuous mass production of identical items — very low unit costs, inflexible.' },
      { term: 'Productivity', def: 'Output per employee (or per machine-hour); it measures how efficiently inputs are used.' },
      { term: 'Buffer stock', def: 'Extra stock held to keep production running if a delivery is late.' },
      { term: 'Just-in-time (JIT)', def: 'Stock system where parts arrive exactly when needed — near-zero storage, but vulnerable to supply hiccups.' },
      { term: 'Quality control', def: 'Inspecting finished products for faults — problems are found late, so wastage is high.' },
      { term: 'Quality assurance', def: 'Checking quality at every stage of production, not just at the end.' },
      { term: 'Total Quality Management (TQM)', def: 'A culture where every employee is responsible for quality.' },
      { term: 'Kaizen', def: 'Continuous improvement in small steps — a Japanese idea used worldwide.' },
    ],
    examTips: [
      'Match the method to the product and justify it: job = one-off premium; batch = variety; flow = mass market at low unit cost.',
      'JIT is always two-sided: lower storage costs and less waste, versus a full stoppage when a delivery is late.',
      'Quality control vs quality assurance is a favourite compare question: inspection at the end vs checks at every stage.',
    ],
  },

  '2.4': {
    topic: '2.4',
    title: 'Making financial decisions',
    blurb: 'Profit margins, ROCE, break-even and how to interpret a business’s figures.',
    readMins: 5,
    sections: [
      {
        heading: 'Profit calculations',
        points: [
          'Gross profit = revenue − cost of sales.',
          'Cost of sales is the cost of making or buying the products sold.',
          'Net (operating) profit = gross profit − other operating expenses (overheads).',
          'Margins express profit as a percentage, so firms of different sizes can be compared.',
        ],
      },
      {
        heading: 'ROCE — return on capital employed',
        points: [
          'ROCE measures how efficiently a business uses the money invested in it.',
          'Capital employed = total equity + long-term (non-current) liabilities.',
          'Investors compare ROCE across years and against rivals.',
        ],
      },
      {
        heading: 'Break-even and margin of safety',
        points: [
          'Contribution per unit = selling price − variable cost per unit.',
          'Break-even output = fixed costs ÷ contribution per unit.',
          'Margin of safety = current output − break-even output.',
        ],
      },
      {
        heading: 'Percentage change',
        points: [
          'Percentage change = ((new − original) ÷ original) × 100.',
          'Use it to compare performance between years.',
        ],
      },
      {
        heading: 'Interpreting financial data',
        points: [
          'Compare figures with previous years (trends) and with competitors (benchmarks).',
          'Ask whether a difference is significant.',
          'Published accounts include a statement of financial position (balance sheet) and an income statement (profit and loss).',
          'Liquidity compares current assets with current liabilities; a current ratio of 1.5–2 is comfortable.',
          'Cash flow must be managed even when a business is profitable.',
          'Investors watch gross margin, net margin, ROCE and cash flow to judge performance.',
        ],
      },
      {
        heading: 'Limitations of the numbers',
        points: [
          'One year can mislead — trends matter more.',
          'Figures can be window-dressed.',
          'Non-financial factors — quality, staff morale, reputation — are not captured.',
          'Apple shows the point: a falling margin can still mean rising profits if revenue grows fast.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Cost of sales', def: 'The cost of making or buying the products that were sold.' },
      { term: 'Gross profit', def: 'Revenue minus the cost of sales.' },
      { term: 'Gross profit margin', def: 'Gross profit as a percentage of revenue.' },
      { term: 'Net (operating) profit', def: 'Gross profit minus other operating expenses (overheads).' },
      { term: 'Net profit margin', def: 'Net profit as a percentage of revenue.' },
      { term: 'Capital employed', def: 'Total equity plus long-term (non-current) liabilities — the money invested in the business.' },
      { term: 'ROCE', def: 'Return on capital employed: operating profit as a percentage of capital employed.' },
      { term: 'Liquidity', def: 'A business’s ability to meet its short-term debts with its current assets.' },
      { term: 'Income statement', def: 'A published account showing revenue, costs and profit over a period (profit and loss).' },
      { term: 'Statement of financial position', def: 'A published account listing assets, liabilities and equity at a point in time (balance sheet).' },
    ],
    formulas: [
      { name: 'Gross profit', formula: 'gross profit = revenue − cost of sales', example: 'Revenue £50,000 − cost of sales £30,000 = £20,000 gross profit.' },
      { name: 'Gross profit margin', formula: 'gross profit margin (%) = (gross profit ÷ revenue) × 100', example: '£20,000 ÷ £50,000 × 100 = 40%.' },
      { name: 'Net profit', formula: 'net profit = gross profit − other operating expenses', example: 'Gross profit £20,000 − overheads £8,000 = £12,000 net profit.' },
      { name: 'Net profit margin', formula: 'net profit margin (%) = (net profit ÷ revenue) × 100', example: '£12,000 ÷ £50,000 × 100 = 24%.' },
      { name: 'ROCE', formula: 'ROCE (%) = (operating profit ÷ capital employed) × 100', example: '£12,000 ÷ £60,000 capital employed × 100 = 20%.' },
      { name: 'Percentage change', formula: 'percentage change = ((new − original) ÷ original) × 100', example: 'Revenue rose from £40,000 to £50,000: (£10,000 ÷ £40,000) × 100 = 25%.' },
      { name: 'Current ratio', formula: 'current ratio = current assets ÷ current liabilities', example: '£30,000 ÷ £20,000 = 1.5 — around 1.5–2 is comfortable.' },
      { name: 'Break-even output', formula: 'break-even output = fixed costs ÷ contribution per unit', example: 'Fixed costs £9,000 ÷ £4.50 contribution = 2,000 units.' },
    ],
    examTips: [
      'Show the × 100 in every margin and ROCE calculation — omitting it costs the accuracy mark.',
      'Interpretation answers compare: this year vs last year (trend), and this firm vs a rival (benchmark).',
      'Never forget liquidity and cash: a profitable firm can still fail if it cannot pay its bills.',
      'A falling margin can coexist with rising profits if revenue grows fast — a strong evaluation point.',
    ],
  },

  '2.5': {
    topic: '2.5',
    title: 'Making human resource decisions',
    blurb: 'Structures, communication, ways of working, recruitment, training and motivation.',
    readMins: 5,
    sections: [
      {
        heading: 'Organisational structures',
        points: [
          'A hierarchy has many layers — a tall structure.',
          'Tall structures: narrow span of control at the top, close supervision, slower communication.',
          'A flat structure has few layers: wide span of control, faster communication, more delegation.',
          'Delayering removes layers to cut costs and speed decisions — but can demotivate the survivors.',
          'Structures can be organised by function (marketing, operations, HR, finance), by product or by region.',
          'The chain of command runs from the top down; delegation passes authority downwards.',
        ],
      },
      {
        heading: 'Effective communication',
        points: [
          'Formal channels: meetings, reports, notices. Informal: everyday conversations.',
          'Communication can be one-way or two-way.',
          'Barriers: jargon, too much information, the wrong channel.',
          'Poor communication causes mistakes and conflict.',
        ],
      },
      {
        heading: 'Different ways of working',
        points: [
          'Full-time vs part-time; flexible hours.',
          'Zero-hours contracts guarantee no hours — Deliveroo and many gig-economy riders are self-employed.',
          'Firms say this gives flexibility; critics say it lacks security and benefits.',
          'Remote and home working grew sharply after 2020.',
          'Job shares and freelancers or consultants widen the talent pool.',
        ],
      },
      {
        heading: 'Recruitment',
        points: [
          'Internal recruitment promotes existing staff — cheaper, quicker, a known quantity.',
          'But it brings no new ideas and leaves another vacancy to fill.',
          'External recruitment: advertising, job sites, agencies, the university milk round.',
          'External brings fresh ideas but is slower and riskier.',
          'A job description lists duties; a person specification lists the qualities needed.',
        ],
      },
      {
        heading: 'Selection and training',
        points: [
          'Selection tools: CVs and application forms; interviews — the most common, but subjective.',
          'Also assessment centres, aptitude and psychometric tests, and references.',
          'Induction training covers a new employee’s first days.',
          'On-the-job training: learning while doing — cheap and practical, but errors cost customers.',
          'Off-the-job training: courses and college days — quality learning, but it costs time away.',
          'Retraining matters when technology changes roles.',
        ],
      },
      {
        heading: 'Motivation',
        points: [
          'Financial methods: pay (above the market rate reduces quitting — some retailers pay the Real Living Wage).',
          'Also piece rates, bonuses and promotion.',
          'Non-financial: job rotation (variety), job enrichment (more interesting tasks), empowerment, teamworking.',
          'Plus good working conditions, praise and recognition.',
          'Herzberg: hygiene factors (pay, conditions) stop dissatisfaction; motivators (recognition, achievement) create satisfaction.',
          'Motivated staff work harder, stay longer and need less supervision.',
          'A demotivated workforce raises costs: absence, mistakes and staff turnover.',
        ],
      },
    ],
    keyTerms: [
      { term: 'Span of control', def: 'The number of employees a manager directly supervises — narrow in tall structures, wide in flat ones.' },
      { term: 'Delegation', def: 'Passing authority down the hierarchy to a subordinate.' },
      { term: 'Delayering', def: 'Removing layers of management from a structure to cut costs and speed up decisions.' },
      { term: 'Zero-hours contract', def: 'A contract with no guaranteed hours of work — flexibility for firms, insecurity for workers.' },
      { term: 'Job description', def: 'A document listing the duties of a job.' },
      { term: 'Person specification', def: 'A document listing the qualities, skills and qualifications a candidate needs.' },
      { term: 'Induction training', def: 'Training given in a new employee’s first days with the business.' },
      { term: 'Job rotation', def: 'Moving employees between tasks to add variety to their work.' },
      { term: 'Job enrichment', def: 'Giving employees more interesting and challenging tasks to increase motivation.' },
      { term: 'Hygiene factors', def: 'Pay and working conditions — they stop dissatisfaction but do not create satisfaction (Herzberg).' },
    ],
    examTips: [
      'Tall vs flat is a trade-off: communication speed and delegation versus supervision and control.',
      'Internal vs external recruitment: plan two benefits and two drawbacks before you start writing.',
      'Be precise with Herzberg: hygiene factors REMOVE dissatisfaction; motivators CREATE satisfaction. Mixing them loses the mark.',
    ],
  },
};

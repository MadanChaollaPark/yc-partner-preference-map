import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'src', 'data')
const CACHE_DIR = path.join(ROOT, '.cache', 'yc-company-pages')
const OUT_FILE = path.join(DATA_DIR, 'yc-preferences.json')

const SOURCES = {
  ycPeople: 'https://www.ycombinator.com/people',
  ycPartners: 'https://www.ycombinator.com/partners',
  ycCompanies: 'https://yc-oss.github.io/api/companies/all.json',
  ycOssRepo: 'https://github.com/yc-oss/api',
}

const VISITING_PARTNERS = [
  {
    name: 'Matt Riley',
    role: 'Visiting Partner',
    batch: '2025 visiting partner announcement; later Fixture founder page says previously Visiting Partner W25/S25',
    bio:
      'Co-founder and CEO of Swiftype (YC W12), a search-as-a-service company acquired by Elastic in 2017.',
    sourceUrl: 'https://www.ycombinator.com/blog/ycs-newest-visiting-partners',
  },
  {
    name: 'Harshita Arora',
    role: 'Former Visiting Partner; promoted General Partner',
    batch: 'S25 visiting partner, promoted April 6 2026',
    bio:
      'Co-founder of AtoB (YC S20), building financial infrastructure for trucking and transportation; promoted to General Partner after serving as Visiting Partner.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-harshita',
  },
  {
    name: 'Eric Levine',
    role: 'Visiting Partner',
    batch: 'Current profile',
    bio:
      'Co-founder of Berbix (YC S18), an identity platform acquired by Socure; early Airbnb engineer and Trust & Safety engineering manager.',
    sourceUrl: 'https://www.ycombinator.com/people/eric-levine',
  },
  {
    name: 'Grey Baker',
    role: 'Visiting Partner',
    batch: '2025 visiting partner announcement',
    bio:
      'Co-founder of Pincites (YC S23) and Dependabot; previously led product and engineering at GoCardless.',
    sourceUrl: 'https://www.ycombinator.com/blog/ycs-newest-visiting-partners',
  },
  {
    name: 'Christopher Golda',
    role: 'Visiting Partner',
    batch: '2025 visiting partner announcement',
    bio:
      'Co-founder and CEO of BackType (YC S08), acquired by Twitter; public angel/backer of Benchling, Coinbase, Stoke, and Supabase.',
    sourceUrl: 'https://www.ycombinator.com/blog/ycs-newest-visiting-partners',
  },
  {
    name: 'Raphael Schaad',
    role: 'Visiting Partner',
    batch: '2025 visiting partner announcement',
    bio: 'Founder and CEO of Cron (YC W20), acquired by Notion in 2022.',
    sourceUrl: 'https://www.ycombinator.com/blog/ycs-newest-visiting-partners',
  },
  {
    name: 'Christina Gilbert',
    role: 'Visiting Partner',
    batch: '2025 visiting partner announcement',
    bio:
      'Co-founder and former CEO of OneSchema (YC S21), a CSV ingestion platform for developer data pipelines.',
    sourceUrl: 'https://www.ycombinator.com/blog/ycs-newest-visiting-partners',
  },
  {
    name: 'Francois Chaubard',
    role: 'Visiting Partner',
    batch: '2025 visiting partner announcement',
    bio:
      'Founder of Focal Systems (YC W16), building AI systems across retail and other hard technical domains.',
    sourceUrl: 'https://www.ycombinator.com/blog/ycs-newest-visiting-partners',
  },
  {
    name: 'Vivian Shen',
    role: 'Visiting Partner',
    batch: '2025 visiting partner announcement',
    bio:
      'Founder of Acely and co-founder of Juni Learning (YC W18), with education, AI, and consumer growth experience.',
    sourceUrl: 'https://www.ycombinator.com/blog/ycs-newest-visiting-partners',
  },
  {
    name: 'James Evans',
    role: 'Visiting Partner',
    batch: '2025 visiting partner announcement',
    bio:
      'Co-founder and CEO of Command AI (YC S20), acquired by Amplitude in October 2024.',
    sourceUrl: 'https://www.ycombinator.com/blog/ycs-newest-visiting-partners',
  },
  {
    name: 'Diana Hu',
    role: 'Visiting Group Partner',
    batch: 'S21',
    bio:
      'Co-founder and CTO of Escher Reality (YC S17), an augmented reality backend acquired by Niantic.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-s21-visiting-group-partners',
  },
  {
    name: 'Calvin French-Owen',
    role: 'Visiting Group Partner',
    batch: 'S21',
    bio:
      'Co-founder and CTO of Segment, acquired by Twilio; focused on developer tools, enterprise software, and data infrastructure.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-s21-visiting-group-partners',
  },
  {
    name: 'JJ Fliegelman',
    role: 'Visiting Group Partner',
    batch: 'S22',
    bio:
      'Co-founder and CTO of WayUp (YC W15), a DEI recruiting platform used by millions.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-s22-visiting-group-partners',
  },
  {
    name: 'Liz Wessel',
    role: 'Visiting Group Partner',
    batch: 'S22',
    bio:
      'Co-founder and CEO of WayUp (YC W15), a diversity and inclusion recruiting platform.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-s22-visiting-group-partners',
  },
  {
    name: 'Pete Koomen',
    role: 'Visiting Group Partner',
    batch: 'S22',
    bio:
      'Co-founder of Optimizely (YC W10), which grew to $100M+ ARR before acquisition.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-s22-visiting-group-partners',
  },
  {
    name: 'Puneet Kumar',
    role: 'Visiting Group Partner',
    batch: 'S22',
    bio:
      'Founder and CEO of Supr Daily (YC W17), a consumer grocery startup in India acquired by Swiggy.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-s22-visiting-group-partners',
  },
  {
    name: 'Rich Aberman',
    role: 'Visiting Group Partner',
    batch: 'S22',
    bio:
      'Co-founder of WePay (YC S09), a payments API company acquired by JPMorgan Chase.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-s22-visiting-group-partners',
  },
  {
    name: 'Emmett Shear',
    role: 'Visiting Group Partner',
    batch: '2023',
    bio: 'Co-founder and CEO of Twitch.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-back-to-yc-emmett-shear-and-wayne-crosby',
  },
  {
    name: 'Wayne Crosby',
    role: 'Visiting Group Partner',
    batch: '2023',
    bio: 'Co-founder of Zenter and 500px; returned to YC as a Visiting Group Partner in 2023.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-back-to-yc-emmett-shear-and-wayne-crosby',
  },
  {
    name: 'Aaron Epstein',
    role: 'Visiting Partner',
    batch: 'W19',
    bio:
      'Co-founder of Creative Market (YC W10), acquired by Autodesk and later spun out independently.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-elizabeth-lindsay-aaron-kevin-solomon-holly-mia-casey-sachin-rachel-and-janelle',
  },
  {
    name: 'Kevin Hale',
    role: 'Visiting Partner',
    batch: 'W19',
    bio: 'Co-founder of Wufoo (YC W06), acquired by SurveyMonkey.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-elizabeth-lindsay-aaron-kevin-solomon-holly-mia-casey-sachin-rachel-and-janelle',
  },
]

const HISTORICAL_PARTNERS = [
  {
    name: 'Sam Altman',
    role: 'Former YC President; earlier part-time partner',
    batch: 'part-time by 2013; President 2014-2019',
    bio: 'Loopt (YC S05) founder and later OpenAI CEO.',
    sourceUrl: 'https://www.ycombinator.com/blog/sam-altman-for-president/',
    confidence: 'high',
  },
  {
    name: 'Michael Seibel',
    role: 'Former Group Partner; former YC accelerator CEO; Partner Emeritus',
    batch: 'part-time partner 2013; active through March 2025',
    bio: 'Co-founder/CEO of Justin.tv (YC W07) and Socialcam (YC W12).',
    sourceUrl:
      'https://www.ycombinator.com/blog/michael-seibels-legacy-continues-at-yc-transition-to-partner-emeritus',
    confidence: 'high',
  },
  {
    name: 'Geoff Ralston',
    role: 'Former Partner; former President',
    batch: 'Partner announced January 2012; President 2019-2023 inferred',
    bio: 'RocketMail/Four11, Yahoo Mail, Lala, and Imagine K12 background.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-geoff',
    confidence: 'high',
  },
  {
    name: 'Paul Buchheit',
    role: 'Former or emeritus YC Partner',
    batch: 'Partner from November 2010',
    bio: 'Creator of Gmail, AdSense prototype builder, and FriendFeed founder.',
    sourceUrl:
      'https://www.ycombinator.com/blog/y-combinator-announces-two-new-partners-paul',
    confidence: 'high',
  },
  {
    name: 'Dalton Caldwell',
    role: 'Former Managing Partner; Partner Emeritus',
    batch: 'Joined YC 2011; Partner Emeritus June 2025',
    bio: 'Founder of Imeem and App.net; co-founder of Standard Capital.',
    sourceUrl: 'https://www.ycombinator.com/blog/dalton-caldwell-partner-emeritus',
    confidence: 'high',
  },
  {
    name: 'Kevin Hale',
    role: 'Former Partner; later Visiting Partner',
    batch: 'Partner 2013; Visiting Partner W19',
    bio: 'Co-founder of Wufoo (YC W06), acquired by SurveyMonkey.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-kevin-michael-steve-dalton-and-andrew',
    confidence: 'high',
  },
  {
    name: 'Justin Kan',
    role: 'Former part-time partner; Partner',
    batch: 'part-time from 2011; Partner announced March 2014',
    bio: 'Founder of Kiko, Justin.tv/Twitch, Socialcam, and Exec.',
    sourceUrl:
      'https://www.ycombinator.com/blog/two-new-yc-partners-justin-kan-and-aaron-harris',
    confidence: 'high',
  },
  {
    name: 'Aaron Harris',
    role: 'Former Partner',
    batch: 'Partner since October 2013',
    bio: 'Founder of Tutorspree (YC W11), later known for finance-focused YC advice.',
    sourceUrl:
      'https://www.ycombinator.com/blog/two-new-yc-partners-justin-kan-and-aaron-harris',
    confidence: 'high',
  },
  {
    name: 'Kirsty Nathoo',
    role: 'Former or inactive Partner and CFO',
    batch: 'Partner/CFO announced June 2012',
    bio: 'YC finance and operations leader.',
    sourceUrl:
      'https://www.ycombinator.com/blog/two-new-yc-partners-kirsty-nathoo-and-carolyn/',
    confidence: 'high',
  },
  {
    name: 'Carolynn Levy',
    role: 'Former or inactive Partner; General Counsel',
    batch: 'Partner announced June 2012',
    bio: 'Wilson Sonsini lawyer for YC before joining.',
    sourceUrl:
      'https://www.ycombinator.com/blog/two-new-yc-partners-kirsty-nathoo-and-carolyn/',
    confidence: 'high',
  },
  {
    name: 'Ali Rowghani',
    role: 'Former part-time partner; full-time partner; YC Continuity leader',
    batch: 'part-time November 2014; full-time October 2015',
    bio: 'Former Pixar CFO and Twitter CFO/COO.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-ali',
    confidence: 'high',
  },
  {
    name: 'Kat Manalac',
    role: 'Former Partner; Managing Outreach Officer',
    batch: 'Director of Outreach 2013; Partner April 2014',
    bio: 'Former chief of staff to Alexis Ohanian; founder outreach and PR focus.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-kat-yuri-patrick-and-elizabeth/',
    confidence: 'high',
  },
  {
    name: 'Tim Brady',
    role: 'Former Partner / Group Partner',
    batch: 'Joined March 2016; left April 2022',
    bio: 'Imagine K12 partner, Yahoo first employee/CPO, and QuestBridge CEO.',
    sourceUrl: 'https://www.ycombinator.com/blog/tim-brady-is-leaving-yc/',
    confidence: 'high',
  },
  {
    name: 'Qasar Younis',
    role: 'Former part-time partner; full-time partner; COO',
    batch: 'part-time 2013; full-time 2014; COO August 2015',
    bio: 'TalkBin (YC W11) founder; Google Maps business products background.',
    sourceUrl: 'https://www.ycombinator.com/blog/a-new-role-for-qasar',
    confidence: 'high',
  },
  {
    name: 'Steve Huffman',
    role: 'Former part-time partner',
    batch: 'announced May 2013',
    bio: 'Co-founder of Reddit (YC S05) and Hipmunk (YC S10).',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-kevin-michael-steve-dalton-and-andrew',
    confidence: 'high',
  },
  {
    name: 'Andrew Mason',
    role: 'Former part-time partner',
    batch: 'announced May 2013',
    bio: 'Co-founder and former CEO of Groupon.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-kevin-michael-steve-dalton-and-andrew',
    confidence: 'high',
  },
  {
    name: 'Emmett Shear',
    role: 'Former part-time partner; Visiting Group Partner',
    batch: 'part-time by 2013; Visiting Group Partner announced May 2023',
    bio: 'Co-founder of Justin.tv/Twitch (YC W07), acquired by Amazon.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-back-to-yc-emmett-shear-and-wayne-crosby',
    confidence: 'high',
  },
  {
    name: 'Yuri Sagalov',
    role: 'Former part-time partner',
    batch: 'joined September 2013; former partner 2014-2019 per YC company profile',
    bio: 'AeroFS (YC S10) founder; enterprise software and investing background.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-kat-yuri-patrick-and-elizabeth/',
    confidence: 'high',
  },
  {
    name: 'Patrick Collison',
    role: 'Former part-time partner',
    batch: 'announced April 2014',
    bio: 'Stripe co-founder/CEO and Auctomatic co-founder.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-kat-yuri-patrick-and-elizabeth/',
    confidence: 'high',
  },
  {
    name: 'Elizabeth Iorns',
    role: 'Former part-time partner / YC Partner',
    batch: 'announced April 2014',
    bio: 'Science Exchange co-founder/CEO; cancer biology PhD; life sciences focus.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-kat-yuri-patrick-and-elizabeth/',
    confidence: 'high',
  },
  {
    name: 'Peter Thiel',
    role: 'Former part-time partner; no longer affiliated',
    batch: 'joined March 2015',
    bio: 'PayPal, Palantir, Founders Fund, and first outside Facebook investor.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-peter/',
    confidence: 'high',
  },
  {
    name: 'Adora Cheung',
    role: 'Former Partner',
    batch: 'Partner announced June 2016',
    bio: 'Homejoy co-founder/CEO; former Slide PM.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-adora-nicole-elizabeth-case-and-robby',
    confidence: 'high',
  },
  {
    name: 'Robby Walker',
    role: 'Former part-time partner; nonprofit program lead',
    batch: 'announced June 2016',
    bio: 'Zenter (YC W07), Cue (YC W10), and Apple/Siri background.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-adora-nicole-elizabeth-case-and-robby',
    confidence: 'high',
  },
  {
    name: 'Bill Clerico',
    role: 'Former part-time partner',
    batch: 'announced March 2016',
    bio: 'WePay co-founder/CEO (YC S09).',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-x11',
    confidence: 'high',
  },
  {
    name: 'Sharon Pope',
    role: 'Former part-time partner',
    batch: 'announced March 2016',
    bio: 'Green Dot CMO and former Loopt marketing/communications leader.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-x11',
    confidence: 'high',
  },
  {
    name: 'Immad Akhund',
    role: 'Former part-time partner',
    batch: 'W17 part-time partner',
    bio: 'Heyzap (YC W09) and Clickpass (YC S07) founder.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-aaron-gustaf-lyle-immad-and-marcus',
    confidence: 'high',
  },
  {
    name: 'Marcus Segal',
    role: 'Former part-time partner',
    batch: 'W17 part-time partner',
    bio: 'Former Zynga SVP Global Operations, Vindicia CFO, and eMusic COO.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-aaron-gustaf-lyle-immad-and-marcus',
    confidence: 'high',
  },
  {
    name: 'Lyle Fong',
    role: 'Former Visiting Partner',
    batch: 'W17 Visiting Partner',
    bio: 'Lithium Technologies founder and Hobo Labs founder/CEO.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-aaron-gustaf-lyle-immad-and-marcus',
    confidence: 'high',
  },
  {
    name: 'Eric Migicovsky',
    role: 'Former Partner',
    batch: 'Partner announced February 2018',
    bio: 'Pebble Technology (YC W11) founder, acquired by Fitbit.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-eric-holly-diego-matt-nic-kyle-adele-jose-matt-ramon-and-gia/',
    confidence: 'high',
  },
  {
    name: 'Holly Liu',
    role: 'Former Visiting Partner',
    batch: 'Visiting Partner announced February 2018',
    bio: 'Kabam founder with gaming, product, and people operations background.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-eric-holly-diego-matt-nic-kyle-adele-jose-matt-ramon-and-gia/',
    confidence: 'high',
  },
  {
    name: 'Diego Rey',
    role: 'Former Visiting Partner',
    batch: 'Visiting Partner announced February 2018',
    bio: 'GeneWEAVE co-founder/CTO, acquired by Roche.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-eric-holly-diego-matt-nic-kyle-adele-jose-matt-ramon-and-gia/',
    confidence: 'high',
  },
  {
    name: 'Solomon Hykes',
    role: 'Former Visiting Partner',
    batch: 'W19 Visiting Partner',
    bio: 'Docker/dotCloud (YC S10) founder; containers and cloud infrastructure.',
    sourceUrl:
      'https://www.ycombinator.com/blog/welcome-elizabeth-lindsay-aaron-kevin-solomon-holly-mia-casey-sachin-rachel-and-janelle',
    confidence: 'high',
  },
  {
    name: 'Tracy Young',
    role: 'Former Visiting Group Partner',
    batch: 'W21 Visiting Group Partner',
    bio: 'PlanGrid co-founder/CEO (YC W12), acquired by Autodesk.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-w21-visiting-group-partners/',
    confidence: 'high',
  },
  {
    name: 'Reshma Khilnani',
    role: 'Former Visiting Group Partner',
    batch: 'W21 and S21 Visiting Group Partner',
    bio: 'MedXT co-founder/CTO (YC 2013) and Droplet/Kit co-founder.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-w21-visiting-group-partners/',
    confidence: 'high',
  },
  {
    name: 'Ralph Gootee',
    role: 'Former Visiting Group Partner',
    batch: 'W21 Visiting Group Partner',
    bio: 'PlanGrid co-founder/CTO (YC W12), acquired by Autodesk.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-w21-visiting-group-partners/',
    confidence: 'high',
  },
  {
    name: 'Divya Bhat',
    role: 'Former Visiting Group Partner',
    batch: 'W22 Visiting Group Partner',
    bio: 'Jamglue (YC S06) and Rickshaw (YC W14) founder.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-surbhi-nicolas-divya-ashu-and-tom',
    confidence: 'high',
  },
  {
    name: 'Ashu Desai',
    role: 'Former Visiting Group Partner',
    batch: 'W22 Visiting Group Partner',
    bio: 'Make School co-founder; education company background.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-surbhi-nicolas-divya-ashu-and-tom',
    confidence: 'medium',
  },
  {
    name: 'Edrizio De La Cruz',
    role: 'Former Visiting Group Partner',
    batch: 'announced November 2022',
    bio: 'Arcus co-founder (YC W13); fintech/LatAm company acquired by Mastercard.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-diana-dave-edrizio-and-umur',
    confidence: 'medium',
  },
  {
    name: 'Umur Cubukcu',
    role: 'Former Visiting Group Partner',
    batch: 'announced November 2022; returning in 2023',
    bio: 'Citus Data co-founder/CEO (YC S11), acquired by Microsoft.',
    sourceUrl: 'https://www.ycombinator.com/blog/welcome-diana-dave-edrizio-and-umur',
    confidence: 'medium',
  },
  {
    name: 'Nate Smith',
    role: 'Former Visiting Group Partner',
    batch: 'announced October 2023',
    bio: 'Lever co-founder/CEO/CTO (YC S12), acquired by Employ; Google PM background.',
    sourceUrl:
      'https://www.ycombinator.com/blog/meet-ycs-newest-group-partner-and-visiting-group-partners',
    confidence: 'high',
  },
  {
    name: 'Ooshma Garg',
    role: 'Former Visiting Group Partner',
    batch: 'S24 Visiting Group Partner',
    bio: 'Gobble founder/CEO (YC W14), acquired by Intelligent Brands.',
    sourceUrl: 'https://www.ycombinator.com/blog/meet-ycs-newest-visiting-group-partners',
    confidence: 'high',
  },
]

const args = parseArgs(process.argv.slice(2))
const limit = toNumber(args.limit, Number.POSITIVE_INFINITY)
const concurrency = toNumber(args.concurrency, 10)
const onlyAttributed = args['only-attributed'] === true
const recentBatches = args['recent-batches'] === true

await mkdir(DATA_DIR, { recursive: true })
await mkdir(CACHE_DIR, { recursive: true })

const [peoplePage, partnersPage, allCompanies] = await Promise.all([
  fetchPageData(SOURCES.ycPeople),
  fetchPageData(SOURCES.ycPartners),
  fetchJson(SOURCES.ycCompanies),
])

const people = extractPeople(peoplePage)
const currentPartners = extractCurrentPartners(people, partnersPage)
const companiesToFetch = selectCompanies(allCompanies, { limit, recentBatches })

console.log(
  `Fetching ${companiesToFetch.length} company pages with concurrency ${concurrency}...`,
)

const scraped = await mapPool(companiesToFetch, concurrency, async (company, index) => {
  if ((index + 1) % 50 === 0) {
    console.log(`  ${index + 1}/${companiesToFetch.length}`)
  }
  return scrapeCompany(company)
})

const enrichedCompanies = scraped.filter(Boolean)
const attributedCompanies = enrichedCompanies.filter(
  (company) => company.primaryPartner?.name,
)
const companiesForAnalysis = onlyAttributed ? attributedCompanies : enrichedCompanies
const partnerProfiles = buildPartnerProfiles({
  currentPartners,
  visitingPartners: VISITING_PARTNERS,
  companies: companiesForAnalysis,
})

const output = {
  generatedAt: new Date().toISOString(),
  coverage: {
    allYcCompanyRecords: allCompanies.length,
    companyPagesFetched: enrichedCompanies.length,
    companiesWithPrimaryPartner: attributedCompanies.length,
    partnersFromYcPeoplePage: currentPartners.length,
    visitingPartnersSeeded: VISITING_PARTNERS.length,
    historicalPartnersSeeded: HISTORICAL_PARTNERS.length,
    caveat:
      'YC company pages expose primary group partner consistently for recent batches and sparsely for older companies. This dataset treats that as public attribution, not a complete investment ledger.',
  },
  sources: [
    {
      label: 'YC People',
      url: SOURCES.ycPeople,
      kind: 'official',
      note: 'Current YC team biographies and roles.',
    },
    {
      label: 'YC Partners',
      url: SOURCES.ycPartners,
      kind: 'official',
      note: 'Current YC partner roster and short bios.',
    },
    {
      label: 'YC company pages',
      url: 'https://www.ycombinator.com/companies',
      kind: 'official',
      note: 'Embedded company page data includes founders and primary_group_partner when public.',
    },
    {
      label: 'yc-oss company API',
      url: SOURCES.ycOssRepo,
      kind: 'community',
      note:
        'Unofficial daily mirror of YC company directory metadata, used as the crawl index.',
    },
    ...uniqueBy(
      [...VISITING_PARTNERS, ...HISTORICAL_PARTNERS].map((partner) => ({
        label: `${partner.batch} ${partner.role}`,
        url: partner.sourceUrl,
        kind: 'official',
        note: `Source for ${partner.name}.`,
      })),
      (source) => source.url,
    ),
  ],
  partners: partnerProfiles,
  companies: attributedCompanies,
}

await writeFile(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Wrote ${path.relative(ROOT, OUT_FILE)}`)

function parseArgs(argv) {
  const parsed = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      parsed[key] = true
    } else {
      parsed[key] = next
      index += 1
    }
  }
  return parsed
}

function toNumber(value, fallback) {
  if (value === undefined || value === true) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': userAgent() } })
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.json()
}

async function fetchPageData(url) {
  const html = await fetchText(url)
  const match = html.match(/data-page="([^"]+)"/)
  if (!match) throw new Error(`Could not find data-page in ${url}`)
  return JSON.parse(decodeHtml(match[1]))
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': userAgent() } })
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

function userAgent() {
  return 'yc-partner-preferences-local-research/1.0'
}

function decodeHtml(input) {
  return input
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function extractPeople(page) {
  return page.props.sections.flatMap((section) =>
    section.people.map((person) => ({
      ...person,
      section: decodeText(section.title),
      url: person.url ? toAbsolute(person.url) : null,
      photo: person.photo ? normalizeUrl(person.photo) : null,
      bio: person.bio ? stripMarkdown(decodeText(person.bio)) : '',
    })),
  )
}

function extractCurrentPartners(people, partnersPage) {
  const officialCards = new Map(
    (partnersPage.props.partners ?? []).map((partner) => [
      partner.name,
      {
        alumniCompany: partner.title,
        partnerCardBio: decodeText(partner.bio),
        partnerCardPhoto: normalizeUrl(partner.photo),
      },
    ]),
  )

  return people
    .filter(
      (person) =>
        person.section === 'President & CEO' || person.section === 'Partners',
    )
    .map((person) => {
      const card = officialCards.get(person.name)
      return {
        id: slugify(person.name),
        name: person.name,
        role: person.title,
        category: 'current',
        bio: person.bio,
        photo: person.photo ?? card?.partnerCardPhoto ?? null,
        url: person.url,
        alumniCompany: card?.alumniCompany ?? inferAlumniCompany(person.bio),
        sourceUrl: SOURCES.ycPeople,
      }
    })
}

function selectCompanies(companies, options) {
  const recentBatchNames = new Set([
    'Winter 2026',
    'Summer 2025',
    'Spring 2025',
    'Winter 2025',
    'Fall 2024',
    'Summer 2024',
  ])
  const selected = options.recentBatches
    ? companies.filter((company) => recentBatchNames.has(company.batch))
    : companies
  return selected.slice(0, options.limit)
}

async function scrapeCompany(indexCompany) {
  const cacheFile = path.join(CACHE_DIR, `${indexCompany.slug}.json`)
  if (existsSync(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, 'utf8'))
  }

  try {
    const page = await fetchPageData(indexCompany.url)
    const company = page.props.company
    const scraped = normalizeCompany(indexCompany, company)
    await writeFile(cacheFile, JSON.stringify(scraped))
    return scraped
  } catch (error) {
    console.warn(`Failed ${indexCompany.slug}: ${error.message}`)
    return null
  }
}

function normalizeCompany(indexCompany, company) {
  const primary = company.primary_group_partner
  const founders = (company.founders ?? []).map((founder) => ({
    name: founder.full_name,
    title: founder.title ?? '',
    bio: decodeText(founder.bio ?? ''),
    linkedinUrl: founder.linkedin_url ?? null,
    twitterUrl: founder.twitter_url ?? null,
  }))

  const formerNames = indexCompany.former_names ?? []
  const pivotSignals = inferPivotSignals(indexCompany, company, founders)

  return {
    id: company.id ?? indexCompany.id,
    slug: company.slug ?? indexCompany.slug,
    name: company.name ?? indexCompany.name,
    oneLiner: decodeText(company.one_liner ?? indexCompany.one_liner ?? ''),
    longDescription: decodeText(
      company.long_description ?? indexCompany.long_description ?? '',
    ),
    batch: company.batch_name ?? indexCompany.batch,
    yearFounded: company.year_founded ?? yearFromBatch(indexCompany.batch),
    status: company.ycdc_status ?? indexCompany.status,
    stage: indexCompany.stage ?? null,
    teamSize: company.team_size ?? indexCompany.team_size ?? null,
    location: company.location ?? indexCompany.all_locations ?? '',
    website: company.website ?? indexCompany.website ?? null,
    url: company.ycdc_url ?? indexCompany.url,
    tags: normalizeArray(company.tags?.length ? company.tags : indexCompany.tags),
    industries: normalizeArray(indexCompany.industries),
    primaryPartner: primary
      ? {
          name: primary.full_name,
          url: primary.ycdc_url ?? toAbsolute(`/people/${slugify(primary.full_name)}`),
          avatarUrl: primary.avatar_thumb_url ?? null,
        }
      : null,
    founders,
    formerNames,
    pivotSignals,
    sourceUrl: company.ycdc_url ?? indexCompany.url,
  }
}

function buildPartnerProfiles({ currentPartners, visitingPartners, companies }) {
  const byName = new Map()
  for (const partner of currentPartners) {
    byName.set(slugify(partner.name), {
      ...partner,
      signals: [],
      companies: [],
      agent: agentFor(partner.name, 'current-partner'),
    })
  }

  for (const partner of visitingPartners) {
    const existing = byName.get(slugify(partner.name))
    if (existing) {
      existing.signals.push({
        type: partner.role,
        label: partner.batch,
        sourceUrl: partner.sourceUrl,
        text: partner.bio,
      })
      continue
    }

    byName.set(slugify(partner.name), {
      id: slugify(partner.name),
      name: partner.name,
      role: partner.role,
      category: 'visiting',
      bio: partner.bio,
      photo: null,
      url: null,
      alumniCompany: null,
      sourceUrl: partner.sourceUrl,
      signals: [
        {
          type: partner.role,
          label: partner.batch,
          sourceUrl: partner.sourceUrl,
          text: partner.bio,
        },
      ],
      companies: [],
      agent: agentFor(partner.name, 'visiting-partner'),
    })
  }

  for (const partner of HISTORICAL_PARTNERS) {
    const existing = byName.get(slugify(partner.name))
    const signal = {
      type: partner.role,
      label: partner.batch,
      sourceUrl: partner.sourceUrl,
      text: `${partner.bio} Confidence: ${partner.confidence}.`,
    }

    if (existing) {
      existing.signals.push(signal)
      continue
    }

      byName.set(slugify(partner.name), {
      id: slugify(partner.name),
      name: partner.name,
      role: partner.role,
      category: 'historical',
      bio: partner.bio,
      photo: null,
      url: null,
      alumniCompany: null,
      sourceUrl: partner.sourceUrl,
      signals: [signal],
      companies: [],
      agent: agentFor(partner.name, 'historical-partner'),
    })
  }

  for (const company of companies) {
    if (!company.primaryPartner?.name) continue
    const partnerKey = slugify(company.primaryPartner.name)
    const partner = byName.get(partnerKey)
    if (!partner) {
      byName.set(partnerKey, {
        id: slugify(company.primaryPartner.name),
        name: company.primaryPartner.name,
        role: 'Primary Group Partner',
        category: 'attributed',
        bio: '',
        photo: company.primaryPartner.avatarUrl,
        url: company.primaryPartner.url,
        alumniCompany: null,
        sourceUrl: company.sourceUrl,
        signals: [],
        companies: [],
        agent: agentFor(company.primaryPartner.name, 'primary-partner'),
      })
    }
    byName.get(partnerKey).companies.push(summarizeCompany(company))
  }

  return [...byName.values()]
    .map((partner) => ({
      ...partner,
      preferences: summarizePreferences(partner.companies, partner.bio, partner.signals),
    }))
    .sort((a, b) => {
      const categoryRank = { current: 0, attributed: 1, visiting: 2 }
      return (
        (categoryRank[a.category] ?? 3) - (categoryRank[b.category] ?? 3) ||
        b.companies.length - a.companies.length ||
        a.name.localeCompare(b.name)
      )
    })
}

function summarizeCompany(company) {
  return {
    slug: company.slug,
    name: company.name,
    oneLiner: company.oneLiner,
    batch: company.batch,
    status: company.status,
    stage: company.stage,
    teamSize: company.teamSize,
    location: company.location,
    tags: company.tags,
    industries: company.industries,
    founders: company.founders,
    formerNames: company.formerNames,
    pivotSignals: company.pivotSignals.slice(0, 4),
    url: company.url,
  }
}

function summarizePreferences(companies, bio, signals) {
  const tags = countTop(companies.flatMap((company) => company.tags), 8)
  const industries = countTop(companies.flatMap((company) => company.industries), 8)
  const locations = countTop(
    companies
      .map((company) => normalizeLocation(company.location))
      .filter(Boolean),
    6,
  )
  const founderTerms = countTop(
    companies.flatMap((company) =>
      company.founders.flatMap((founder) => tokenizeFounderBio(founder.bio)),
    ),
    8,
  )

  return {
    investmentCount: companies.length,
    topTags: tags,
    topIndustries: industries,
    topLocations: locations,
    founderSignals: founderTerms,
    thesis: buildThesis({ companies, bio, signals, tags, industries, founderTerms }),
    confidence:
      companies.length >= 20 ? 'strong' : companies.length >= 5 ? 'directional' : 'thin',
  }
}

function buildThesis({ companies, bio, signals, tags, industries, founderTerms }) {
  const phrases = []
  const topIndustry = industries[0]?.label
  const topTag = tags[0]?.label
  const topFounderSignal = founderTerms[0]?.label

  if (topIndustry || topTag) {
    phrases.push(
      `Public primary-partner data clusters around ${[
        topIndustry,
        topTag,
      ].filter(Boolean).join(' / ')}.`,
    )
  }

  if (topFounderSignal) {
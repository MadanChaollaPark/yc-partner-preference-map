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
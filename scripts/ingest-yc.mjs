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
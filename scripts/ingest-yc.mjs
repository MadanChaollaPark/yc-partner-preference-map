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
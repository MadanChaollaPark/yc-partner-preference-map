import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowDownUp,
  Bot,
  Building2,
  CheckCircle2,
  Database,
  ExternalLink,
  Info,
  Link as LinkIcon,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react'
import rawData from './data/yc-preferences.json'
import './App.css'

type CountItem = {
  label: string
  value: number
}

type Founder = {
  name: string
  title: string
  bio: string
  linkedinUrl: string | null
  twitterUrl: string | null
}

type PivotSignal = {
  label: string
  text: string
  sourceUrl: string
}

type Company = {
  slug: string
  name: string
  oneLiner: string
  batch: string
  status: string
  stage: string | null
  teamSize: number | null
  location: string
  tags: string[]
  industries: string[]
  founders: Founder[]
  formerNames: string[]
  pivotSignals: PivotSignal[]
  url: string
}

type Signal = {
  type: string
  label: string
  sourceUrl: string
  text: string
}

type Partner = {
  id: string
  name: string
  role: string
  category: string
  bio: string
  photo: string | null
  url: string | null
  alumniCompany: string | null
  sourceUrl: string
  signals: Signal[]
  companies: Company[]
  agent: {
    id: string
    owner: string
    status: string
    task: string
  }
  preferences: {
    investmentCount: number
    topTags: CountItem[]
    topIndustries: CountItem[]
    topLocations: CountItem[]
    founderSignals: CountItem[]
    thesis: string[]
    confidence: 'strong' | 'directional' | 'thin'
  }
}

type Dataset = {
  generatedAt: string
  coverage: {
    allYcCompanyRecords: number
    companyPagesFetched: number
    companiesWithPrimaryPartner: number
    partnersFromYcPeoplePage: number
    visitingPartnersSeeded: number
    historicalPartnersSeeded: number
    caveat: string
  }
  sources: {
    label: string
    url: string
    kind: string
    note: string
  }[]
  partners: Partner[]
  companies: Company[]
}

const data = rawData as Dataset

const categoryLabels: Record<string, string> = {
  all: 'All',
  current: 'Current',
  visiting: 'Visiting',
  historical: 'Historical',
  attributed: 'Attributed',
}

const confidenceLabels: Record<string, string> = {
  all: 'All confidence',
  strong: 'Strong',
  directional: 'Directional',
  thin: 'Thin',
}

const sortLabels: Record<string, string> = {
  count: 'Most attributions',
  alpha: 'A-Z',
  confidence: 'Confidence',
}

const confidenceRank = {
  strong: 3,
  directional: 2,
  thin: 1,
}

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [confidence, setConfidence] = useState('all')
  const [sortBy, setSortBy] = useState('count')
  const [selectedId, setSelectedId] = useState(data.partners[0]?.id ?? '')
  const [companyQuery, setCompanyQuery] = useState('')

  const filteredPartners = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return data.partners
      .filter((partner) => {
        const matchesCategory =
          category === 'all' ||
          partner.category === category ||
          (category === 'visiting' && partner.category === 'historical')
        const matchesConfidence =
          confidence === 'all' || partner.preferences.confidence === confidence
        const searchable = [
          partner.name,
          partner.role,
          partner.bio,
          partner.alumniCompany ?? '',
          ...partner.preferences.topTags.map((tag) => tag.label),
          ...partner.preferences.topIndustries.map((industry) => industry.label),
        ]
          .join(' ')
          .toLowerCase()
        return (
          matchesCategory &&
          matchesConfidence &&
          (!normalizedQuery || searchable.includes(normalizedQuery))
        )
      })
      .sort((a, b) => {
        if (sortBy === 'alpha') return a.name.localeCompare(b.name)
        if (sortBy === 'confidence') {
          return (
            confidenceRank[b.preferences.confidence] -
              confidenceRank[a.preferences.confidence] ||
            b.companies.length - a.companies.length
          )
        }
        return b.companies.length - a.companies.length || a.name.localeCompare(b.name)
      })
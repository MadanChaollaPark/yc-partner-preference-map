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
  }, [category, confidence, query, sortBy])

  const selectedPartner =
    filteredPartners.find((partner) => partner.id === selectedId) ??
    filteredPartners[0] ??
    data.partners[0]

  const selectedCompanies = useMemo(() => {
    const normalizedQuery = companyQuery.trim().toLowerCase()
    if (!selectedPartner) return []
    return selectedPartner.companies.filter((company) => {
      const searchable = [
        company.name,
        company.oneLiner,
        company.batch,
        company.location,
        ...company.tags,
        ...company.industries,
        ...company.founders.map((founder) => `${founder.name} ${founder.bio}`),
      ]
        .join(' ')
        .toLowerCase()
      return !normalizedQuery || searchable.includes(normalizedQuery)
    })
  }, [companyQuery, selectedPartner])

  const topSourceKinds = useMemo(
    () =>
      data.sources.reduce<Record<string, number>>((counts, source) => {
        counts[source.kind] = (counts[source.kind] ?? 0) + 1
        return counts
      }, {}),
    [],
  )

  if (!selectedPartner) {
    return <main className="empty-state">No partner data loaded.</main>
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">Y</div>
        <div>
          <p className="eyebrow">YC Partner Preference Map</p>
          <h1>Partner signals from public YC data</h1>
        </div>
        <a
          className="source-link"
          href="https://www.ycombinator.com/companies"
          target="_blank"
          rel="noreferrer"
          title="Open YC company directory"
        >
          <ExternalLink size={16} aria-hidden="true" />
          YC Directory
        </a>
      </header>

      <section className="metrics-strip" aria-label="Dataset coverage">
        <Metric
          icon={<Database size={18} />}
          label="YC index"
          value={formatNumber(data.coverage.allYcCompanyRecords)}
        />
        <Metric
          icon={<Building2 size={18} />}
          label="Fetched pages"
          value={formatNumber(data.coverage.companyPagesFetched)}
        />
        <Metric
          icon={<CheckCircle2 size={18} />}
          label="Partner attributions"
          value={formatNumber(data.coverage.companiesWithPrimaryPartner)}
        />
        <Metric
          icon={<Users size={18} />}
          label="Agents tracked"
          value={formatNumber(data.partners.length)}
        />
      </section>

      <section className="notice" aria-label="Data caveat">
        <AlertTriangle size={18} aria-hidden="true" />
        <span>{data.coverage.caveat}</span>
      </section>

      <section className="workspace">
        <aside className="partner-panel">
          <div className="panel-heading">
            <div>
              <h2>Agents</h2>
              <p>
                {filteredPartners.length} profiles · {data.coverage.historicalPartnersSeeded}{' '}
                historical seeds
              </p>
            </div>
            <Bot size={20} aria-hidden="true" />
          </div>

          <label className="search-box">
            <Search size={16} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search partner, domain, founder signal"
            />
          </label>

          <div className="filter-group" aria-label="Partner category">
            {Object.keys(categoryLabels).map((key) => (
              <button
                className={category === key ? 'active' : ''}
                key={key}
                type="button"
                onClick={() => setCategory(key)}
              >
                {categoryLabels[key]}
              </button>
            ))}
          </div>

          <div className="select-row">
            <label>
              <SlidersHorizontal size={15} aria-hidden="true" />
              <select
                value={confidence}
                onChange={(event) => setConfidence(event.target.value)}
                aria-label="Confidence filter"
              >
                {Object.keys(confidenceLabels).map((key) => (
                  <option key={key} value={key}>
                    {confidenceLabels[key]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <ArrowDownUp size={15} aria-hidden="true" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort partners"
              >
                {Object.keys(sortLabels).map((key) => (
                  <option key={key} value={key}>
                    {sortLabels[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="partner-list" role="list">
            {filteredPartners.map((partner) => (
              <button
                className={selectedPartner.id === partner.id ? 'partner-row active' : 'partner-row'}
                key={partner.id}
                type="button"
                onClick={() => {
                  setSelectedId(partner.id)
                  setCompanyQuery('')
                }}
              >
                <Avatar partner={partner} />
                <span className="partner-row-main">
                  <span className="partner-row-name">{partner.name}</span>
                  <span className="partner-row-meta">
                    {partner.role} · {partner.companies.length} companies
                  </span>
                </span>
                <span className={`confidence-dot ${partner.preferences.confidence}`} />
              </button>
            ))}
          </div>
        </aside>

        <section className="detail-panel">
          <div className="profile-header">
            <Avatar partner={selectedPartner} large />
            <div className="profile-main">
              <div className="profile-title-row">
                <div>
                  <h2>{selectedPartner.name}</h2>
                  <p>
                    {selectedPartner.role}
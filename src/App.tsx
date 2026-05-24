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
                    {selectedPartner.alumniCompany ? ` · ${selectedPartner.alumniCompany}` : ''}
                  </p>
                </div>
                <StatusBadge confidence={selectedPartner.preferences.confidence} />
              </div>
              <p className="bio">{selectedPartner.bio || 'No public bio is loaded yet.'}</p>
              <div className="agent-line">
                <Bot size={16} aria-hidden="true" />
                <span>{selectedPartner.agent.id}</span>
                <strong>{selectedPartner.agent.status}</strong>
              </div>
            </div>
          </div>

          <div className="insight-grid">
            <InsightBlock title="Preference Thesis" items={selectedPartner.preferences.thesis} />
            <BarBlock title="Top Tags" items={selectedPartner.preferences.topTags} />
            <BarBlock title="Industries" items={selectedPartner.preferences.topIndustries} />
            <BarBlock title="Founder Signals" items={selectedPartner.preferences.founderSignals} />
          </div>

          {selectedPartner.signals.length > 0 ? (
            <section className="signal-band">
              <div className="section-title">
                <Info size={17} aria-hidden="true" />
                <h3>Visiting or Historical Signals</h3>
              </div>
              <div className="signal-list">
                {selectedPartner.signals.map((signal) => (
                  <a
                    href={signal.sourceUrl}
                    key={`${signal.label}-${signal.sourceUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <strong>{signal.type}</strong>
                    <span>{signal.label}</span>
                    <p>{signal.text}</p>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          <section className="company-section">
            <div className="company-heading">
              <div>
                <h3>Attributed Companies</h3>
                <p>
                  {selectedCompanies.length} of {selectedPartner.companies.length} public
                  primary-partner records
                </p>
              </div>
              <label className="search-box compact">
                <Search size={15} aria-hidden="true" />
                <input
                  value={companyQuery}
                  onChange={(event) => setCompanyQuery(event.target.value)}
                  placeholder="Filter companies or founders"
                />
              </label>
            </div>

            <div className="company-list">
              {selectedCompanies.slice(0, 24).map((company) => (
                <CompanyRow company={company} key={company.slug} />
              ))}
              {selectedCompanies.length === 0 ? (
                <div className="empty-inline">No companies match this filter.</div>
              ) : null}
            </div>
          </section>

          <section className="sources-section">
            <div className="section-title">
              <LinkIcon size={17} aria-hidden="true" />
              <h3>Source Mix</h3>
            </div>
            <div className="source-grid">
              {data.sources.slice(0, 8).map((source) => (
                <a href={source.url} key={source.url} target="_blank" rel="noreferrer">
                  <span>{source.kind}</span>
                  <strong>{source.label}</strong>
                  <p>{source.note}</p>
                </a>
              ))}
            </div>
            <p className="source-summary">
              Official sources: {topSourceKinds.official ?? 0}; community sources:{' '}
              {topSourceKinds.community ?? 0}. Generated{' '}
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(data.generatedAt))}
              .
            </p>
          </section>
        </section>
      </section>
    </main>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="metric">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  )
}

function Avatar({ partner, large = false }: { partner: Partner; large?: boolean }) {
  return partner.photo ? (
    <img
      className={large ? 'avatar large' : 'avatar'}
      src={partner.photo}
      alt=""
      loading="lazy"
    />
  ) : (
    <span className={large ? 'avatar initials large' : 'avatar initials'}>
      {partner.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)}
    </span>
  )
}

function StatusBadge({ confidence }: { confidence: Partner['preferences']['confidence'] }) {
  return <span className={`status-badge ${confidence}`}>{confidence}</span>
}

function InsightBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="insight-block">
      <h3>{title}</h3>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No thesis generated yet.</p>
      )}
    </section>
  )
}

function BarBlock({ title, items }: { title: string; items: CountItem[] }) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <section className="insight-block">
      <h3>{title}</h3>
      {items.length ? (
        <div className="bar-list">
          {items.slice(0, 6).map((item) => (
            <div className="bar-row" key={item.label}>
              <span>{item.label}</span>
              <div className="bar-track">
                <div style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }} />
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Not enough records yet.</p>
      )}
    </section>
  )
}
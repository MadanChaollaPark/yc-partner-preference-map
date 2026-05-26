import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Database,
  Download,
  FileCheck2,
  Gauge,
  KeyRound,
  LockKeyhole,
  Mail,
  Plug,
  Radio,
  Search,
  ShieldCheck,
  Usb,
  X,
} from 'lucide-react'
import './App.css'
import {
  DEFAULT_LOCALE,
  getLocaleFromPath,
  localeMetadata,
  locales,
  stripLocaleFromPath,
  toLocalizedPath,
  type LocaleCode,
} from './i18n/locales'
import { getSiteCopy, type SiteCopy } from './i18n/siteCopy'

const RECORDER_DOWNLOAD_PATH = '/downloads/VedawikiFieldRecorder.zip'

type IconCard = {
  icon: ReactNode
  title: string
  text: string
}

type HeroOption = {
  id: string
  name: string
  image: string
  position: string
  source: string
  sourceUrl: string
}

const heroOptions: HeroOption[] = [
  {
    id: '1',
    name: 'UAV over terrain',
    image: '/stock/uav-field-flight.jpg',
    position: '72% center',
    source: 'U.S. Air Force / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MQ-9_Reaper_UAV.jpg',
  },
  {
    id: '2',
    name: 'Preflight check',
    image: '/stock/uav-ground-check.jpg',
    position: '64% center',
    source: 'U.S. Air National Guard / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MQ-9_Reaper_unmanned_aerial_vehicle.jpg',
  },
  {
    id: '3',
    name: 'FPV field test',
    image: '/stock/uav-fpv-field.jpg',
    position: '66% center',
    source: 'U.S. Army / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:First_person_view_drone_in_flight_(8285124).jpg',
  },
  {
    id: '4',
    name: 'Micro air vehicle',
    image: '/stock/micro-air-vehicle-test.jpg',
    position: '70% center',
    source: 'U.S. Navy / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MicroAirVehicle.jpg',
  },
]

type RouteName = 'home' | 'instructions'

type RouteState = {
  locale: LocaleCode
  route: RouteName
}

type PageProps = {
  copy: SiteCopy
  locale: LocaleCode
  onLocaleChange: (locale: LocaleCode) => void
}

const useCaseIcons = [
  <Gauge size={22} />,
  <ChartNoAxesCombined size={22} />,
  <Cpu size={22} />,
]

const trustIcons = [
  <ShieldCheck size={22} />,
  <LockKeyhole size={22} />,
  <KeyRound size={22} />,
]

const howIcons = [
  <Radio size={22} />,
  <Usb size={22} />,
  <FileCheck2 size={22} />,
]

function App() {
  const [routeState, setRouteState] = useState(getInitialRouteState)
  const copy = getSiteCopy(routeState.locale)
  const [heroIndex, setHeroIndex] = useState(getInitialHeroIndex)
  const heroOption = heroOptions[heroIndex] ?? heroOptions[0]

  useEffect(() => {
    const handlePopState = () => setRouteState(getInitialRouteState())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    heroOptions.forEach((option) => {
      const image = new Image()
      image.src = option.image
    })

    const intervalId = window.setInterval(() => {
      setHeroIndex((index) => (index + 1) % heroOptions.length)
    }, 5500)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const metadata =
      routeState.route === 'instructions'
        ? {
            title: copy.metadata.instructionsTitle,
            description: copy.metadata.instructionsDescription,
          }
        : {
            title: copy.metadata.homeTitle,
            description: copy.metadata.homeDescription,
          }

    document.documentElement.lang = routeState.locale
    document.documentElement.dir = localeMetadata[routeState.locale].direction
    document.title = metadata.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', metadata.description)
  }, [copy, routeState.locale, routeState.route])

  function handleLocaleChange(locale: LocaleCode) {
    const pathname = routeState.route === 'instructions' ? '/instructions' : '/'
    const nextUrl = `${toLocalizedPath(locale, pathname)}${window.location.search}${window.location.hash}`
    window.history.pushState(null, '', nextUrl)
    setRouteState({ ...routeState, locale })
  }

  if (routeState.route === 'instructions') {
    return (
      <InstructionsPage
        copy={copy}
        locale={routeState.locale}
        onLocaleChange={handleLocaleChange}
      />
    )
  }

  const useCases = copy.home.use.cards.map((item, index) => ({
    ...item,
    icon: useCaseIcons[index] ?? <Gauge size={22} />,
  }))
  const trustControls = copy.home.trust.cards.map((item, index) => ({
    ...item,
    icon: trustIcons[index] ?? <ShieldCheck size={22} />,
  }))
  const contactHref = buildContactHref(copy)

  return (
    <main className="site-shell" id="top">
      <SiteHeader
        copy={copy}
        locale={routeState.locale}
        onLocaleChange={handleLocaleChange}
      />

      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src={heroOption.image}
          alt=""
          aria-hidden="true"
          style={{ objectPosition: heroOption.position }}
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">{copy.home.hero.eyebrow}</p>
          <h1 id="hero-title">{copy.home.hero.title}</h1>
          <p className="hero-lede">{copy.home.hero.lede}</p>
          <div className="hero-actions">
            <a
              className="button primary"
              href={RECORDER_DOWNLOAD_PATH}
              download
            >
              <Download size={18} aria-hidden="true" />
              {copy.home.download.action}
            </a>
            <a className="button secondary" href={contactHref}>
              <Mail size={18} aria-hidden="true" />
              {copy.home.hero.secondaryAction}
            </a>
          </div>
          <dl className="hero-facts" aria-label={copy.home.hero.factsAriaLabel}>
            {copy.home.hero.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="download-band" id="download" aria-labelledby="download-title">
        <div className="section-copy">
          <p className="eyebrow">{copy.home.download.eyebrow}</p>
          <h2 id="download-title">{copy.home.download.title}</h2>
          <p>{copy.home.download.body}</p>
        </div>
        <div className="download-panel">
          <div className="download-panel-header">
            <FileCheck2 size={22} aria-hidden="true" />
            <div>
              <strong>{copy.home.download.panelTitle}</strong>
              <span>{copy.home.download.panelMeta}</span>
            </div>
          </div>
          <ul>
            {copy.home.download.items.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <a
            className="button primary full"
            href={RECORDER_DOWNLOAD_PATH}
            download
          >
            <Download size={18} aria-hidden="true" />
            {copy.home.download.action}
          </a>
        </div>
      </section>

      <section className="work-section" id="how" aria-labelledby="how-title">
        <div className="section-heading">
          <p className="eyebrow">{copy.home.how.eyebrow}</p>
          <h2 id="how-title">{copy.home.how.title}</h2>
        </div>
        <div className="work-grid">
          <div className="system-diagram" aria-label={copy.home.how.diagramAriaLabel}>
            {copy.home.how.nodes.map((node, index) => (
              <Fragment key={node.title}>
                {index > 0 && <ArrowRight className="flow-arrow" size={26} aria-hidden="true" />}
                <SystemNode icon={howIcons[index] ?? <FileCheck2 size={22} />} title={node.title} text={node.text} />
              </Fragment>
            ))}
          </div>
          <div className="work-copy">
            <p>{copy.home.how.body}</p>
            <div className="spec-list">
              {copy.home.how.specs.map((label, index) => (
                <Spec
                  icon={[<Plug size={18} />, <Activity size={18} />, <Database size={18} />][index]}
                  key={label}
                  label={label}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="source-section" id="sources" aria-labelledby="sources-title">
        <div className="section-heading">
          <p className="eyebrow">{copy.home.sources.eyebrow}</p>
          <h2 id="sources-title">{copy.home.sources.title}</h2>
          <p>{copy.home.sources.body}</p>
        </div>
        <div className="source-table" role="table" aria-label={copy.home.sources.tableAriaLabel}>
          <div role="row" className="source-row source-row-head">
            {copy.home.sources.columns.map((column) => (
              <span role="columnheader" key={column}>{column}</span>
            ))}
          </div>
          {copy.home.sources.rows.map((source) => (
            <div role="row" className="source-row" key={source.name}>
              <strong role="cell">{source.name}</strong>
              <span role="cell">{source.mode}</span>
              <span role="cell">{source.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="use-section" aria-labelledby="use-title">
        <div className="section-heading">
          <p className="eyebrow">{copy.home.use.eyebrow}</p>
          <h2 id="use-title">{copy.home.use.title}</h2>
        </div>
        <div className="card-grid">
          {useCases.map((item) => (
            <InfoCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="trust-section" id="trust" aria-labelledby="trust-title">
        <div className="section-heading">
          <p className="eyebrow">{copy.home.trust.eyebrow}</p>
          <h2 id="trust-title">{copy.home.trust.title}</h2>
          <p>{copy.home.trust.body}</p>
        </div>
        <div className="card-grid">
          {trustControls.map((item) => (
            <InfoCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="pilot-section" id="pilot" aria-labelledby="pilot-title">
        <div className="section-heading">
          <p className="eyebrow">{copy.home.pilot.eyebrow}</p>
          <h2 id="pilot-title">{copy.home.pilot.title}</h2>
        </div>
        <div className="timeline">
          {copy.home.pilot.steps.map((step) => (
            <article className="timeline-step" key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-band" aria-labelledby="closing-title">
        <div>
          <p className="eyebrow">{copy.home.closing.eyebrow}</p>
          <h2 id="closing-title">{copy.home.closing.title}</h2>
        </div>
        <div className="closing-actions">
          <a
            className="button primary"
            href={RECORDER_DOWNLOAD_PATH}
            download
          >
            <Download size={18} aria-hidden="true" />
            {copy.home.closing.primaryAction}
          </a>
          <a className="button secondary" href={contactHref}>
            <Mail size={18} aria-hidden="true" />
            {copy.home.closing.secondaryAction}
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <span>{copy.home.footer.brand}</span>
        <span>{copy.home.footer.tagline}</span>
      </footer>
    </main>
  )
}

function SiteHeader({ copy, locale, onLocaleChange }: PageProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [languageQuery, setLanguageQuery] = useState('')
  const languagePickerRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const activeLocale = localeMetadata[locale]
  const homeHref = toLocalizedPath(locale, '/')
  const downloadHref = `${homeHref}#download`
  const sourcesHref = `${homeHref}#sources`
  const trustHref = `${homeHref}#trust`
  const instructionsHref = toLocalizedPath(locale, '/instructions')
  const normalizedLanguageQuery = languageQuery.trim().toLocaleLowerCase()
  const filteredLocales = useMemo(() => {
    if (!normalizedLanguageQuery) return locales

    return locales.filter((option) =>
      [
        option.code,
        option.shortLabel,
        option.nativeLabel,
        option.englishLabel,
      ].some((value) => value.toLocaleLowerCase().includes(normalizedLanguageQuery)),
    )
  }, [normalizedLanguageQuery])

  useEffect(() => {
    if (!isLanguageOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (
        languagePickerRef.current &&
        !languagePickerRef.current.contains(event.target as Node)
      ) {
        setIsLanguageOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsLanguageOpen(false)
        languageButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLanguageOpen])

  function handleLanguageSelection(nextLocale: LocaleCode) {
    onLocaleChange(nextLocale)
    setIsLanguageOpen(false)
    setLanguageQuery('')
    languageButtonRef.current?.focus()
  }

  function closeLanguagePicker() {
    setIsLanguageOpen(false)
    languageButtonRef.current?.focus()
  }

  return (
    <header className="site-header">
      <a className="brand" href={homeHref} aria-label={copy.header.brandLabel}>
        <span className="brand-mark">V</span>
        <span>{copy.home.footer.brand}</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href={downloadHref}>{copy.header.nav.download}</a>
        <a href={instructionsHref}>{copy.header.nav.instructions}</a>
        <a href={sourcesHref}>{copy.header.nav.sources}</a>
        <a href={trustHref}>{copy.header.nav.security}</a>
      </nav>
      <div className="header-tools">
        <div className="language-picker" ref={languagePickerRef}>
          <button
            type="button"
            className="language-button"
            ref={languageButtonRef}
            aria-label={`${copy.language.buttonLabel}: ${activeLocale.nativeLabel}`}
            aria-controls="language-picker-panel"
            aria-expanded={isLanguageOpen}
            aria-haspopup="dialog"
            onClick={() => setIsLanguageOpen((isOpen) => !isOpen)}
            title={`${copy.language.buttonLabel}: ${activeLocale.nativeLabel}`}
          >
            <span className="language-flag" aria-hidden="true">
              {activeLocale.flag}
            </span>
            <span className="language-code">{activeLocale.shortLabel}</span>
            <ChevronDown className="language-chevron" size={14} aria-hidden="true" />
          </button>
          {isLanguageOpen && (
            <div
              className="language-popover"
              id="language-picker-panel"
              role="dialog"
              aria-label={copy.language.panelTitle}
            >
              <div className="language-popover-header">
                <strong>{copy.language.panelTitle}</strong>
                <button
                  type="button"
                  className="language-close"
                  aria-label="Close language picker"
                  onClick={closeLanguagePicker}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <label className="language-search-wrap">
                <Search size={16} aria-hidden="true" />
                <span>{copy.language.selectLabel}</span>
                <input
                  autoFocus
                  className="language-search"
                  onChange={(event) => setLanguageQuery(event.currentTarget.value)}
                  placeholder={copy.language.searchPlaceholder}
                  type="search"
                  value={languageQuery}
                />
              </label>
              <div className="language-list" role="listbox">
                {filteredLocales.map((option) => {
                  const isActive = option.code === locale

                  return (
                    <button
                      type="button"
                      className={`language-option${isActive ? ' active' : ''}`}
                      aria-label={`${option.nativeLabel}, ${option.englishLabel}`}
                      aria-selected={isActive}
                      key={option.code}
                      onClick={() => handleLanguageSelection(option.code)}
                      role="option"
                    >
                      <span className="language-flag" aria-hidden="true">
                        {option.flag}
                      </span>
                      <span className="language-option-names">
                        <strong>{option.nativeLabel}</strong>
                        <small>
                          {option.englishLabel}
                          {isActive ? ` · ${copy.language.currentLabel}` : ''}
                        </small>
                      </span>
                      {isActive && (
                        <CheckCircle2 className="language-check" size={18} aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
                {filteredLocales.length === 0 && (
                  <p className="language-empty">{copy.language.noResults}</p>
                )}
              </div>
            </div>
          )}
        </div>
        <a className="header-action" href={RECORDER_DOWNLOAD_PATH} download>
          <Download size={16} aria-hidden="true" />
          <span>{copy.header.actionLabel}</span>
        </a>
      </div>
    </header>
  )
}

function InstructionsPage({ copy, locale, onLocaleChange }: PageProps) {
  const contactHref = buildContactHref(copy)

  return (
    <main className="site-shell">
      <SiteHeader copy={copy} locale={locale} onLocaleChange={onLocaleChange} />
      <section className="instructions-hero" aria-labelledby="instructions-title">
        <p className="eyebrow">{copy.instructions.hero.eyebrow}</p>
        <h1 id="instructions-title">{copy.instructions.hero.title}</h1>
        <p>{copy.instructions.hero.body}</p>
        <div className="hero-actions">
          <a className="button primary" href={RECORDER_DOWNLOAD_PATH} download>
            <Download size={18} aria-hidden="true" />
            {copy.instructions.hero.primaryAction}
          </a>
          <a className="button secondary" href={`${toLocalizedPath(locale, '/')}#download`}>
            <FileCheck2 size={18} aria-hidden="true" />
            {copy.instructions.hero.secondaryAction}
          </a>
          <a className="button secondary" href={contactHref}>
            <Mail size={18} aria-hidden="true" />
            {copy.home.closing.secondaryAction}
          </a>
        </div>
      </section>

      <section className="instructions-section" aria-labelledby="quick-start-title">
        <div className="section-heading">
          <p className="eyebrow">{copy.instructions.quickStart.eyebrow}</p>
          <h2 id="quick-start-title">{copy.instructions.quickStart.title}</h2>
        </div>
        <ol className="instruction-steps">
          {copy.instructions.quickStart.steps.map((step) => (
            <li key={step.label}>
              <span>{step.label}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="instructions-section split" aria-labelledby="versions-title">
        <div>
          <p className="eyebrow">{copy.instructions.versions.eyebrow}</p>
          <h2 id="versions-title">{copy.instructions.versions.title}</h2>
        </div>
        <div className="version-list">
          {copy.instructions.versions.items.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="instructions-section warning-section">
        <h2>{copy.instructions.warning.title}</h2>
        <p>{copy.instructions.warning.body}</p>
      </section>
    </main>
  )
}

function getInitialRouteState(): RouteState {
  if (typeof window === 'undefined') {
    return { locale: DEFAULT_LOCALE, route: 'home' }
  }

  const pathLocale = getLocaleFromPath(window.location.pathname)
  const routePath = stripLocaleFromPath(window.location.pathname)

  return {
    locale: pathLocale ?? DEFAULT_LOCALE,
    route: routePath === '/instructions' ? 'instructions' : 'home',
  }
}

function buildContactHref(copy: SiteCopy) {
  return `mailto:${copy.metadata.contactEmail}?subject=${encodeURIComponent(copy.metadata.contactSubject)}`
}

function getInitialHeroIndex() {
  if (typeof window === 'undefined') return 0
  const requested = new URLSearchParams(window.location.search).get('photo')
  const index = heroOptions.findIndex((option) => option.id === requested)
  return index === -1 ? 0 : index
}

function InfoCard({ item }: { item: IconCard }) {
  return (
    <article className="info-card">
      <span className="icon-tile">{item.icon}</span>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </article>
  )
}

function SystemNode({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="system-node">
      <span className="icon-tile">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function Spec({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="spec-item">
      {icon}
      <span>{label}</span>
    </div>
  )
}

export default App

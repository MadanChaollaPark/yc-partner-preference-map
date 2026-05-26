import { useEffect, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  CheckCircle2,
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
  Server,
  ShieldCheck,
  Usb,
} from 'lucide-react'
import './App.css'
import { RecorderDashboard } from './RecorderDashboard'

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
    name: 'Reaper over terrain',
    image: '/stock/war-drone-reaper-flight.jpg',
    position: '72% center',
    source: 'U.S. Air Force / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MQ-9_Reaper_UAV.jpg',
  },
  {
    id: '2',
    name: 'Preflight check',
    image: '/stock/war-drone-reaper-ground.jpg',
    position: '64% center',
    source: 'U.S. Air National Guard / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MQ-9_Reaper_unmanned_aerial_vehicle.jpg',
  },
  {
    id: '3',
    name: 'FPV field test',
    image: '/stock/war-drone-fpv-flight.jpg',
    position: '66% center',
    source: 'U.S. Army / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:First_person_view_drone_in_flight_(8285124).jpg',
  },
  {
    id: '4',
    name: 'Micro air vehicle',
    image: '/stock/war-drone-mav-test.jpg',
    position: '70% center',
    source: 'U.S. Navy / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MicroAirVehicle.jpg',
  },
]

const downloadItems = [
  'Public evaluation manifest',
  'Controlled-build request path',
  'Pilot deployment checklist',
  'Data handling and authorization notes',
]

const useCases: IconCard[] = [
  {
    icon: <Gauge size={22} />,
    title: 'Training debriefs',
    text: 'Replay operator inputs with timestamps so instructors can review timing, control discipline, and repeated mistakes.',
  },
  {
    icon: <ChartNoAxesCombined size={22} />,
    title: 'Fleet evaluation',
    text: 'Compare authorized missions across teams, controller profiles, manufacturers, and environments.',
  },
  {
    icon: <Cpu size={22} />,
    title: 'Manufacturer QA',
    text: 'Give drone builders a normalized record of operator-side events when investigating failures or performance gaps.',
  },
]

const trustControls: IconCard[] = [
  {
    icon: <ShieldCheck size={22} />,
    title: 'Authorized collection',
    text: 'Designed for explicit government, military, or manufacturer evaluation programs. No informal mission scraping.',
  },
  {
    icon: <LockKeyhole size={22} />,
    title: 'Local-first capture',
    text: 'Logs are recorded at the controller side and can remain offline until an approved export or review workflow.',
  },
  {
    icon: <KeyRound size={22} />,
    title: 'Chain of custody',
    text: 'Exports are structured for signed sessions, hashes, custody notes, and role-based access in the review process.',
  },
]

const pilotSteps = [
  {
    label: '01',
    title: 'Download the public kit',
    text: 'Review the evaluation manifest, supported controller path, and data handling model.',
  },
  {
    label: '02',
    title: 'Request a signed build',
    text: 'Government or authorized manufacturer contacts receive controlled binaries and onboarding materials.',
  },
  {
    label: '03',
    title: 'Run a bounded pilot',
    text: 'Start with controller-side sessions, debrief reports, and manufacturer feedback loops before deeper integrations.',
  },
]

const recorderFacts = [
  { label: 'Recorder', value: 'Native Python process' },
  { label: 'Data', value: 'Append-only JSONL' },
  { label: 'Dashboard', value: 'Local replay and export' },
]

function App() {
  const [heroIndex, setHeroIndex] = useState(getInitialHeroIndex)
  const heroOption = heroOptions[heroIndex] ?? heroOptions[0]

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

  return (
    <main className="site-shell" id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Vedawiki home">
          <span className="brand-mark">V</span>
          <span>Vedawiki</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#dashboard">Dashboard</a>
          <a href="#download">Download</a>
          <a href="#how">How it works</a>
          <a href="#trust">Security</a>
        </nav>
        <a
          className="header-action"
          href="/downloads/vedawiki-government-evaluation-kit.txt"
          download
        >
          <Download size={16} aria-hidden="true" />
          Download kit
        </a>
      </header>

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
          <p className="eyebrow">Controlled evaluation build</p>
          <h1 id="hero-title">Vedawiki Field Recorder</h1>
          <p className="hero-lede">
            Authorized controller-side telemetry recorder for training, debriefing,
            QA, and evaluation programs.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#dashboard">
              <Server size={18} aria-hidden="true" />
              Open recorder dashboard
            </a>
            <a
              className="button secondary"
              href="/downloads/vedawiki-government-evaluation-kit.txt"
              download
            >
              <Download size={18} aria-hidden="true" />
              Download evaluation kit
            </a>
            <a
              className="button secondary"
              href="mailto:contact@vedawiki.com?subject=Vedawiki%20government%20evaluation"
            >
              <Mail size={18} aria-hidden="true" />
              Request signed build
            </a>
          </div>
          <dl className="hero-facts" aria-label="Recorder facts">
            {recorderFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <RecorderDashboard />

      <section className="download-band" id="download" aria-labelledby="download-title">
        <div className="section-copy">
          <p className="eyebrow">Government download</p>
          <h2 id="download-title">Start evaluation without integrating into the drone.</h2>
          <p>
            Vedawiki begins at the controller because that is the fastest place to
            collect useful flight data across mixed drone fleets. The public kit explains
            the controlled build, supported capture path, and pilot requirements.
          </p>
        </div>
        <div className="download-panel">
          <div className="download-panel-header">
            <FileCheck2 size={22} aria-hidden="true" />
            <div>
              <strong>Vedawiki government evaluation kit</strong>
              <span>Text manifest · public download</span>
            </div>
          </div>
          <ul>
            {downloadItems.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <a
            className="button primary full"
            href="/downloads/vedawiki-government-evaluation-kit.txt"
            download
          >
            <Download size={18} aria-hidden="true" />
            Download kit
          </a>
        </div>
      </section>

      <section className="work-section" id="how" aria-labelledby="how-title">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title">A flight recorder at the operator side.</h2>
        </div>
        <div className="work-grid">
          <div className="system-diagram" aria-label="Controller-side recording flow">
            <SystemNode icon={<Radio size={22} />} title="Controller" text="Operator inputs" />
            <ArrowRight className="flow-arrow" size={26} aria-hidden="true" />
            <SystemNode icon={<Usb size={22} />} title="Native recorder" text="pygame polling and JSONL logs" />
            <ArrowRight className="flow-arrow" size={26} aria-hidden="true" />
            <SystemNode icon={<Server size={22} />} title="Dashboard" text="Local FastAPI replay and CSV export" />
          </div>
          <div className="work-copy">
            <p>
              The prototype records Xbox-compatible controller input and saves timestamped
              event logs from a native local process. The browser is only the replay and
              export UI; no browser permission step is required for the recorder path.
            </p>
            <div className="spec-list">
              <Spec icon={<Plug size={18} />} label="No drone modification required" />
              <Spec icon={<Activity size={18} />} label="Structured session replay data" />
              <Spec icon={<Database size={18} />} label="Exports for approved analytics workflows" />
            </div>
          </div>
        </div>
      </section>

      <section className="use-section" aria-labelledby="use-title">
        <div className="section-heading">
          <p className="eyebrow">Evaluation uses</p>
          <h2 id="use-title">Built for repeatable review, not anecdotes.</h2>
        </div>
        <div className="card-grid">
          {useCases.map((item) => (
            <InfoCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="trust-section" id="trust" aria-labelledby="trust-title">
        <div className="section-heading">
          <p className="eyebrow">Security posture</p>
          <h2 id="trust-title">Authorized data, controlled movement.</h2>
          <p>
            Defense flight data only matters if users trust the custody path. Vedawiki is
            designed around explicit authorization, local capture, and structured export
            controls for review teams.
          </p>
        </div>
        <div className="card-grid">
          {trustControls.map((item) => (
            <InfoCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="pilot-section" id="pilot" aria-labelledby="pilot-title">
        <div className="section-heading">
          <p className="eyebrow">Pilot path</p>
          <h2 id="pilot-title">From download to field evaluation.</h2>
        </div>
        <div className="timeline">
          {pilotSteps.map((step) => (
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
          <p className="eyebrow">For authorized programs</p>
          <h2 id="closing-title">Evaluate a drone-agnostic flight recorder.</h2>
        </div>
        <div className="closing-actions">
          <a
            className="button primary"
            href="/downloads/vedawiki-government-evaluation-kit.txt"
            download
          >
            <Download size={18} aria-hidden="true" />
            Download kit
          </a>
          <a
            className="button secondary"
            href="mailto:contact@vedawiki.com?subject=Vedawiki%20government%20evaluation"
          >
            <Mail size={18} aria-hidden="true" />
            Contact Vedawiki
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <span>Vedawiki</span>
        <span>Controller-side flight recording for authorized defense evaluation.</span>
      </footer>
    </main>
  )
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

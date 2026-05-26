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
  'Portable USB app archive',
  'Windows and macOS start scripts',
  'Native Python controller recorder',
  'Local dashboard API and CSV export',
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
    title: 'Download the portable app',
    text: 'Unzip Vedawiki Field Recorder onto a USB drive or local working folder.',
  },
  {
    label: '02',
    title: 'Start the recorder',
    text: 'Run the Windows or macOS start file, then plug in the Xbox-compatible controller.',
  },
  {
    label: '03',
    title: 'Review sessions',
    text: 'Open the dashboard, replay JSONL sessions, and export CSV files for approved review workflows.',
  },
]

const recorderFacts = [
  { label: 'Recorder', value: 'Native Python process' },
  { label: 'Data', value: 'Append-only JSONL' },
  { label: 'Dashboard', value: 'Local replay and export' },
]

function App() {
  const instructionsRoute = isInstructionsRoute()
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

  if (instructionsRoute) {
    return <InstructionsPage />
  }

  return (
    <main className="site-shell" id="top">
      <SiteHeader />

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
              href={RECORDER_DOWNLOAD_PATH}
              download
            >
              <Download size={18} aria-hidden="true" />
              Download recorder ZIP
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
              <span>ZIP archive · portable recorder app</span>
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
            href={RECORDER_DOWNLOAD_PATH}
            download
          >
            <Download size={18} aria-hidden="true" />
            Download recorder ZIP
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
            href={RECORDER_DOWNLOAD_PATH}
            download
          >
            <Download size={18} aria-hidden="true" />
            Download recorder ZIP
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

function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Vedawiki home">
        <span className="brand-mark">V</span>
        <span>Vedawiki</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/#dashboard">Dashboard</a>
        <a href="/#download">Download</a>
        <a href="/instructions">Instructions</a>
        <a href="/#trust">Security</a>
      </nav>
      <a className="header-action" href={RECORDER_DOWNLOAD_PATH} download>
        <Download size={16} aria-hidden="true" />
        Download kit
      </a>
    </header>
  )
}

function InstructionsPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="instructions-hero" aria-labelledby="instructions-title">
        <p className="eyebrow">Start recorder</p>
        <h1 id="instructions-title">Run Vedawiki from a USB drive.</h1>
        <p>
          A normal USB flash drive cannot record Xbox controller commands by itself.
          Vedawiki’s downloadable version is a portable app that runs on the laptop or
          ground station and writes sessions back to the USB drive.
        </p>
        <div className="hero-actions">
          <a className="button primary" href={RECORDER_DOWNLOAD_PATH} download>
            <Download size={18} aria-hidden="true" />
            Download recorder ZIP
          </a>
          <a className="button secondary" href="/#dashboard">
            <Server size={18} aria-hidden="true" />
            Open dashboard
          </a>
        </div>
      </section>

      <section className="instructions-section" aria-labelledby="quick-start-title">
        <div className="section-heading">
          <p className="eyebrow">Quick start</p>
          <h2 id="quick-start-title">Portable USB app workflow.</h2>
        </div>
        <ol className="instruction-steps">
          <li>
            <span>01</span>
            <div>
              <h3>Download and unzip</h3>
              <p>
                Download <code>VedawikiFieldRecorder.zip</code>, unzip it, and move the
                <code> Vedawiki-Recorder</code> folder onto a USB drive or local working folder.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Start the recorder</h3>
              <p>
                On Windows, double-click <code>start-recorder-windows.bat</code>. On macOS,
                double-click <code>start-recorder-mac.command</code>. The script creates a
                local Python environment, installs dependencies, and starts the recorder API.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Plug in the controller</h3>
              <p>
                Connect an Xbox-compatible controller to the same laptop or ground station.
                The recorder writes timestamped JSONL files into <code>sessions/</code>.
              </p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <h3>Review and export</h3>
              <p>
                Open <code>https://vedawiki.com/#dashboard</code> to replay sessions from
                the local API and export CSV files for approved debrief or QA workflows.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="instructions-section split" aria-labelledby="versions-title">
        <div>
          <p className="eyebrow">What is possible</p>
          <h2 id="versions-title">Three realistic recorder versions.</h2>
        </div>
        <div className="version-list">
          <article>
            <h3>1. Portable USB app</h3>
            <p>
              Possible now. The USB drive contains the app, start scripts, recorder code,
              sessions folder, and dashboard link. The user still starts the recorder.
            </p>
          </article>
          <article>
            <h3>2. Portable executable</h3>
            <p>
              Better next step. Package the Python recorder with PyInstaller so users do
              not install Python before recording sessions.
            </p>
          </article>
          <article>
            <h3>3. Inline USB hardware recorder</h3>
            <p>
              The real plug-and-record product. It requires custom hardware with USB host,
              USB device, local storage, passthrough firmware, and latency testing.
            </p>
          </article>
        </div>
      </section>

      <section className="instructions-section warning-section">
        <h2>What a flash drive cannot do</h2>
        <p>
          USB is not an audio splitter. A flash drive plugged into a computer cannot listen
          to another USB port, and an Xbox controller usually cannot host or read a flash
          drive. Something has to run recorder software or sit inline between the controller
          and the host.
        </p>
      </section>
    </main>
  )
}

function isInstructionsRoute() {
  return typeof window !== 'undefined' && window.location.pathname === '/instructions'
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

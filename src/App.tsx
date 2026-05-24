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

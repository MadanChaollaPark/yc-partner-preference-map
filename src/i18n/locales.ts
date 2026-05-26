export const DEFAULT_LOCALE = 'en' as const

export const EU_OFFICIAL_LOCALE_CODES = [
  'bg',
  'hr',
  'cs',
  'da',
  'nl',
  'en',
  'et',
  'fi',
  'fr',
  'de',
  'el',
  'hu',
  'ga',
  'it',
  'lv',
  'lt',
  'mt',
  'pl',
  'pt',
  'ro',
  'sk',
  'sl',
  'es',
  'sv',
] as const

export const SUPPORTED_LOCALE_CODES = ['uk', ...EU_OFFICIAL_LOCALE_CODES] as const

export type EuLocaleCode = (typeof EU_OFFICIAL_LOCALE_CODES)[number]
export type LocaleCode = (typeof SUPPORTED_LOCALE_CODES)[number]
export type TextDirection = 'ltr' | 'rtl'

export type LocaleMetadata = {
  code: LocaleCode
  flag: string
  shortLabel: string
  nativeLabel: string
  englishLabel: string
  direction: TextDirection
  isOfficialEuLanguage: boolean
}

export const localeMetadata = {
  bg: {
    code: 'bg',
    flag: '🇧🇬',
    shortLabel: 'BG',
    nativeLabel: 'Български',
    englishLabel: 'Bulgarian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  hr: {
    code: 'hr',
    flag: '🇭🇷',
    shortLabel: 'HR',
    nativeLabel: 'Hrvatski',
    englishLabel: 'Croatian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  cs: {
    code: 'cs',
    flag: '🇨🇿',
    shortLabel: 'CS',
    nativeLabel: 'Čeština',
    englishLabel: 'Czech',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  da: {
    code: 'da',
    flag: '🇩🇰',
    shortLabel: 'DA',
    nativeLabel: 'Dansk',
    englishLabel: 'Danish',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  nl: {
    code: 'nl',
    flag: '🇳🇱',
    shortLabel: 'NL',
    nativeLabel: 'Nederlands',
    englishLabel: 'Dutch',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  en: {
    code: 'en',
    flag: '🇪🇺',
    shortLabel: 'EN',
    nativeLabel: 'English',
    englishLabel: 'English',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  et: {
    code: 'et',
    flag: '🇪🇪',
    shortLabel: 'ET',
    nativeLabel: 'Eesti',
    englishLabel: 'Estonian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  fi: {
    code: 'fi',
    flag: '🇫🇮',
    shortLabel: 'FI',
    nativeLabel: 'Suomi',
    englishLabel: 'Finnish',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  fr: {
    code: 'fr',
    flag: '🇫🇷',
    shortLabel: 'FR',
    nativeLabel: 'Français',
    englishLabel: 'French',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  de: {
    code: 'de',
    flag: '🇩🇪',
    shortLabel: 'DE',
    nativeLabel: 'Deutsch',
    englishLabel: 'German',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  el: {
    code: 'el',
    flag: '🇬🇷',
    shortLabel: 'EL',
    nativeLabel: 'Ελληνικά',
    englishLabel: 'Greek',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  hu: {
    code: 'hu',
    flag: '🇭🇺',
    shortLabel: 'HU',
    nativeLabel: 'Magyar',
    englishLabel: 'Hungarian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  ga: {
    code: 'ga',
    flag: '🇮🇪',
    shortLabel: 'GA',
    nativeLabel: 'Gaeilge',
    englishLabel: 'Irish',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  it: {
    code: 'it',
    flag: '🇮🇹',
    shortLabel: 'IT',
    nativeLabel: 'Italiano',
    englishLabel: 'Italian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  lv: {
    code: 'lv',
    flag: '🇱🇻',
    shortLabel: 'LV',
    nativeLabel: 'Latviešu',
    englishLabel: 'Latvian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  lt: {
    code: 'lt',
    flag: '🇱🇹',
    shortLabel: 'LT',
    nativeLabel: 'Lietuvių',
    englishLabel: 'Lithuanian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  mt: {
    code: 'mt',
    flag: '🇲🇹',
    shortLabel: 'MT',
    nativeLabel: 'Malti',
    englishLabel: 'Maltese',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  pl: {
    code: 'pl',
    flag: '🇵🇱',
    shortLabel: 'PL',
    nativeLabel: 'Polski',
    englishLabel: 'Polish',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  pt: {
    code: 'pt',
    flag: '🇵🇹',
    shortLabel: 'PT',
    nativeLabel: 'Português',
    englishLabel: 'Portuguese',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  ro: {
    code: 'ro',
    flag: '🇷🇴',
    shortLabel: 'RO',
    nativeLabel: 'Română',
    englishLabel: 'Romanian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  sk: {
    code: 'sk',
    flag: '🇸🇰',
    shortLabel: 'SK',
    nativeLabel: 'Slovenčina',
    englishLabel: 'Slovak',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  sl: {
    code: 'sl',
    flag: '🇸🇮',
    shortLabel: 'SL',
    nativeLabel: 'Slovenščina',
    englishLabel: 'Slovenian',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  es: {
    code: 'es',
    flag: '🇪🇸',
    shortLabel: 'ES',
    nativeLabel: 'Español',
    englishLabel: 'Spanish',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  sv: {
    code: 'sv',
    flag: '🇸🇪',
    shortLabel: 'SV',
    nativeLabel: 'Svenska',
    englishLabel: 'Swedish',
    direction: 'ltr',
    isOfficialEuLanguage: true,
  },
  uk: {
    code: 'uk',
    flag: '🇺🇦',
    shortLabel: 'UA',
    nativeLabel: 'Українська',
    englishLabel: 'Ukrainian',
    direction: 'ltr',
    isOfficialEuLanguage: false,
  },
} as const satisfies Record<LocaleCode, LocaleMetadata>

export const locales = SUPPORTED_LOCALE_CODES.map((code) => localeMetadata[code])

export const localeAliases = {
  ua: 'uk',
  ukr: 'uk',
  cz: 'cs',
  cze: 'cs',
  gr: 'el',
  gre: 'el',
  dk: 'da',
  ee: 'et',
  se: 'sv',
  si: 'sl',
} as const satisfies Record<string, LocaleCode>

export type LocaleInput = string | null | undefined
export type AddLocalePrefixOptions = {
  includeDefaultLocale?: boolean
}

const supportedLocaleSet: ReadonlySet<string> = new Set(SUPPORTED_LOCALE_CODES)

function normalizeTag(input: LocaleInput): string | undefined {
  const normalized = input?.trim().replace(/_/g, '-').toLowerCase()
  return normalized === '' ? undefined : normalized
}

function isLocaleCode(input: string): input is LocaleCode {
  return supportedLocaleSet.has(input)
}

function getLocaleAlias(input: string): LocaleCode | undefined {
  return localeAliases[input as keyof typeof localeAliases]
}

export function resolveLocale(input: LocaleInput): LocaleCode | undefined {
  const tag = normalizeTag(input)
  if (!tag) return undefined

  if (isLocaleCode(tag)) return tag

  const alias = getLocaleAlias(tag)
  if (alias) return alias

  const baseTag = tag.split('-')[0]
  if (!baseTag) return undefined

  if (isLocaleCode(baseTag)) return baseTag

  return getLocaleAlias(baseTag)
}

export function normalizeLocale(input: LocaleInput): LocaleCode {
  return resolveLocale(input) ?? DEFAULT_LOCALE
}

export function isSupportedLocale(input: LocaleInput): input is LocaleCode {
  const tag = normalizeTag(input)
  return tag !== undefined && isLocaleCode(tag)
}

function splitPathAndSuffix(pathOrUrl: string): { pathname: string; suffix: string } {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(pathOrUrl)) {
    try {
      const url = new URL(pathOrUrl)
      return {
        pathname: ensurePathname(url.pathname),
        suffix: `${url.search}${url.hash}`,
      }
    } catch {
      // Treat malformed URLs as path-like strings.
    }
  }

  const match = /^([^?#]*)(.*)$/.exec(pathOrUrl)
  return {
    pathname: ensurePathname(match?.[1] ?? '/'),
    suffix: match?.[2] ?? '',
  }
}

function ensurePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/'
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

function getLocalePrefixInfo(pathname: string):
  | {
      locale: LocaleCode
      segment: string
    }
  | undefined {
  const match = /^\/([^/]+)(?=\/|$)/.exec(ensurePathname(pathname))
  if (!match) return undefined

  const locale = resolveLocale(match[1])
  return locale ? { locale, segment: match[1] } : undefined
}

export function getLocaleFromPath(pathOrUrl: string): LocaleCode | undefined {
  const { pathname } = splitPathAndSuffix(pathOrUrl)
  return getLocalePrefixInfo(pathname)?.locale
}

export function localeFromPath(pathOrUrl: string, fallbackLocale: LocaleInput = DEFAULT_LOCALE): LocaleCode {
  return getLocaleFromPath(pathOrUrl) ?? normalizeLocale(fallbackLocale)
}

export function removeLocalePrefix(pathOrUrl: string): string {
  const { pathname, suffix } = splitPathAndSuffix(pathOrUrl)
  const localePrefix = getLocalePrefixInfo(pathname)
  if (!localePrefix) return `${ensurePathname(pathname)}${suffix}`

  const withoutLocale = pathname.slice(localePrefix.segment.length + 1)
  return `${ensurePathname(withoutLocale)}${suffix}`
}

export const stripLocaleFromPath = removeLocalePrefix

export function addLocalePrefix(
  pathOrUrl: string,
  locale: LocaleInput,
  options: AddLocalePrefixOptions = {},
): string {
  const localeCode = normalizeLocale(locale)
  const { pathname, suffix } = splitPathAndSuffix(removeLocalePrefix(pathOrUrl))

  if (localeCode === DEFAULT_LOCALE && !options.includeDefaultLocale) {
    return `${pathname}${suffix}`
  }

  const prefixedPath = pathname === '/' ? `/${localeCode}` : `/${localeCode}${pathname}`
  return `${prefixedPath}${suffix}`
}

export function toLocalizedPath(
  locale: LocaleInput,
  pathOrUrl: string,
  options: AddLocalePrefixOptions = { includeDefaultLocale: true },
): string {
  return addLocalePrefix(pathOrUrl, locale, options)
}

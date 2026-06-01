import rawProfile from '@content/profile/profile.json'
import fallbackProfilePhoto from '@content/profile/images/profile-placeholder.svg'
import type { SupportedLocale } from '../locale'

export interface ProfileTextContent {
  description: string
  exportDescription: string
}

export interface LocalizedText {
  en: string
  fr: string
}

export interface ProfileIdentity {
  fullName: string
  photo?: string
  email?: string
  portfolioUrl?: string
}

export interface ContactLink {
  label: LocalizedText
  url: string
  display?: string
  includeInExport?: boolean
}

export interface ResolvedContactLink {
  label: string
  url: string
  display: string
  includeInExport: boolean
}

export interface TemplateInfo {
  showNotice: boolean
  repoUrl: string
}

export type RichTextSegment =
  | { type: 'text'; value: string }
  | { type: 'link'; url: string; label: string }

interface ProfileData {
  identity: ProfileIdentity
  contactLinks: ContactLink[]
  template?: TemplateInfo
  content: {
    en: ProfileTextContent
    fr: ProfileTextContent
  }
}

const LINK_TOKEN_PATTERN = /\{\{link:([^|}]+)\|([^}]+)\}\}/g
const profileData = rawProfile as ProfileData
const profileImages = import.meta.glob('@content/profile/images/*', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const getFileNameFromPath = (path: string) => path.split('/').pop() ?? path

const normalizeDisplayFromUrl = (url: string) => (
  url
    .replace(/^mailto:/i, '')
    .replace(/^tel:/i, '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
)

export const getProfileContent = (locale: SupportedLocale): ProfileTextContent => (
  locale === 'fr' ? profileData.content.fr : profileData.content.en
)

export const getProfileIdentity = (): ProfileIdentity => profileData.identity

export const getProfilePhoto = (): string => {
  const photoPath = profileData.identity.photo

  if (!photoPath) {
    return fallbackProfilePhoto
  }

  if (/^(https?:|data:)/i.test(photoPath)) {
    return photoPath
  }

  const photoFileName = getFileNameFromPath(photoPath)
  const matchingPath = Object.keys(profileImages).find((path) => getFileNameFromPath(path) === photoFileName)

  return matchingPath ? profileImages[matchingPath] : fallbackProfilePhoto
}

export const getProfileContactLinks = (
  locale: SupportedLocale,
  options?: { exportOnly?: boolean }
): ResolvedContactLink[] => (
  profileData.contactLinks
    .filter((link) => (options?.exportOnly ? link.includeInExport !== false : true))
    .map((link) => ({
      label: locale === 'fr' ? link.label.fr : link.label.en,
      url: link.url,
      display: link.display?.trim() || normalizeDisplayFromUrl(link.url),
      includeInExport: link.includeInExport !== false
    }))
)

export const getTemplateInfo = (): TemplateInfo => ({
  showNotice: profileData.template?.showNotice ?? false,
  repoUrl: profileData.template?.repoUrl ?? ''
})

export const parseRichTextSegments = (text: string): RichTextSegment[] => {
  const segments: RichTextSegment[] = []
  let lastIndex = 0

  for (const match of text.matchAll(LINK_TOKEN_PATTERN)) {
    const fullMatch = match[0]
    const url = match[1]?.trim()
    const label = match[2]?.trim()
    const matchIndex = match.index ?? -1

    if (matchIndex < 0 || !url || !label) {
      continue
    }

    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex, matchIndex)
      })
    }

    segments.push({
      type: 'link',
      url,
      label
    })

    lastIndex = matchIndex + fullMatch.length
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.slice(lastIndex)
    })
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }]
}
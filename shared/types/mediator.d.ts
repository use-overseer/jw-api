import type { JwLangCode, JwLangSymbol } from './lang.types'

export interface CategoriesResult {
  categories: CategoryParent[]
  language: MediatorResultLanguage
}

export interface Category extends CategorySub {
  parentCategory: CategoryParent | null
}

export interface CategoryDetailed extends Category {
  subcategories?: CategorySub[]
}

export interface CategoryParent {
  description: string
  images: ImagesObject
  key: string
  name: string
  tags: CategoryTag[]
  type: string
}

export interface CategoryResult {
  category: Category
  language: MediatorResultLanguage
  pagination?: MediatorPagination
}

export interface CategoryResultDetailed extends CategoryResult {
  category: CategoryDetailed
}

export interface CategorySub extends CategoryParent {
  media?: MediaItem[]
}

export type ClientType =
  | 'appletv'
  | 'firetv'
  | 'JWORG'
  | 'none'
  | 'roku'
  | 'rwls'
  | 'satellite'
  | 'www'

export type ImageSize = 'lg' | 'md' | 'sm' | 'xl' | 'xs'

export type ImagesObject = Partial<Record<ImageType, Partial<Record<ImageSize, string>>>>
export type ImageType = 'cvr' | 'lsr' | 'lss' | 'pnr' | 'sqr' | 'sqs' | 'wsr' | 'wss'
export interface MediaDataResult {
  language: MediatorResultLanguage
  media: MediaItem[]
}

export type MediaFetcher =
  | PublicationDocFetcher
  | PublicationFetcher
  | { key: MediaKey; langwritten: JwLangCode }

/* eslint-disable perfectionist/sort-interfaces */
export interface MediaItem {
  guid: string
  languageAgnosticNaturalKey: MediaKey
  naturalKey: string
  type: string
  primaryCategory: string
  title: string
  description: string
  firstPublished: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
  duration: number
  durationFormattedHHMM: `${number}:${number}`
  durationFormattedMinSec: `${number}m ${number}s`
  tags: string[]
  files: MediaItemFile[]
  images: ImagesObject
  availableLanguages: JwLangCode[]
  printReferences: string[]
}
/* eslint-enable perfectionist/sort-interfaces */

/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-object-types */
export interface MediaItemFile {
  progressiveDownloadURL: string
  checksum: string
  filesize: number
  modifiedDatetime: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
  bitRate: number
  duration: number
  frameHeight: number
  frameWidth: number
  label: `${number}p`
  frameRate: number
  mimetype: `${string}/${string}`
  subtitled: boolean
  subtitles?: {
    url: string
    modifiedDatetime: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
    checksum: string
  }
}
/* eslint-enable perfectionist/sort-interfaces */
/* eslint-enable perfectionist/sort-object-types */

export type MediaKey = `docid-${string}` | `pub-${string}`

export interface MediatorCategoryDetailedQuery extends MediatorCategoryQuery {
  mediaLimit?: number
}

export interface MediatorCategoryQuery {
  clientType?: ClientType
  limit?: number
  offset?: number
}

export interface MediatorLanguage {
  code: JwLangCode
  isLangPair: boolean
  isRTL: boolean
  isSignLanguage: boolean
  locale: JwLangSymbol
  name: string
  script: string
  vernacular: string
}

export interface MediatorLanguageResult {
  languages: MediatorLanguage[]
}

export interface MediatorPagination {
  limit: number
  offset: number
  totalCount: number
}

export interface MediatorResultLanguage {
  direction: 'ltr' | 'rtl'
  isSignLanguage: boolean
  languageCode: JwLangCode
  locale: JwLangSymbol
  script: string
}

export type string = 'container' | 'ondemand'

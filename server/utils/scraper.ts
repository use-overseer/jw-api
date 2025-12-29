import { parse } from 'node-html-parser'

const bibleDataUrls = new Map<JwLangSymbol, string>()

/**
 * Scrapes the Bible data URL for a given locale.
 * @param locale The locale to scrape the Bible data URL for. Defaults to English.
 * @returns The Bible data URL.
 */
export const scrapeBibleDataUrl = async (locale: JwLangSymbol = 'en'): Promise<string> => {
  const bibleDataPath = 'json/data'
  const enUrl = 'https://www.jw.org/en/library/bible/nwt/books/'

  // English URL is already known
  if (locale === 'en') return enUrl + bibleDataPath

  // Check if the URL is already cached
  if (bibleDataUrls.has(locale)) return bibleDataUrls.get(locale)!

  // Fetch the HTML from the English URL
  const html = await $fetch<string>(enUrl)

  // Parse the HTML
  const root = parse(html)

  // Find the alternate URL for the locale
  const base = root
    .querySelector(`link[rel="alternate"][hreflang="${locale}"]`)
    ?.getAttribute('href')

  // If no alternate URL is found, throw an error
  if (!base) throw createNotFoundError('Failed to find alternate url.', { locale })

  // Construct the URL
  const url = base + bibleDataPath

  // Cache the URL
  bibleDataUrls.set(locale, url)

  // Return the URL
  return url
}

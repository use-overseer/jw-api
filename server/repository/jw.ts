import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://jw.org'
} satisfies FetchOptions

/**
 * Repository for JW.org resources.
 */
export const jwRepository = {
  /**
   * Fetches the available languages on JW.org.
   * @param locale The language of the languages.
   * @returns A list of languages.
   */
  fetchLanguages: defineCachedFunction(
    async (locale: JwLangSymbol) => {
      const result = await $fetch<JwLanguageResult>(`/${locale}/languages/`, {
        ...defaultFetchOptions
      })

      return result.languages
    },
    { maxAge: 60 * 60 * 24, name: 'jwRepository.fetchLanguages' }
  )
}

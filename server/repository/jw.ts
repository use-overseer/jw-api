import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://jw.org',
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
} satisfies FetchOptions

export const jwRepository = {
  fetchLanguages: async (locale: JwLangSymbol) => {
    console.log('fetchLanguages', locale)
    const result = await $fetch<JwLanguageResult>(`/${locale}/languages/`, {
      ...defaultFetchOptions
    })
    console.log('fetchLanguages', 'done')

    return result.languages
  }
}

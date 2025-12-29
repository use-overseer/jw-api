import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://b.jw-cdn.org/apis/pub-media'
} satisfies FetchOptions

/**
 * Repository for publication media resources.
 */
export const pubMediaRepository = {
  /**
   * Fetches information about a publication.
   * @param publication The publication to fetch information for.
   * @returns The publication information.
   */
  fetchPublication: defineCachedFunction(
    async (publication: PubFetcher) => {
      return await $fetch<Publication>('/GETPUBMEDIALINKS', {
        ...defaultFetchOptions,
        query: { ...publication, alllangs: '0', output: 'json', txtCMSLang: 'E' }
      })
    },
    { maxAge: 60 * 60 * 24, name: 'pubMediaRepository.fetchPublication' }
  )
}

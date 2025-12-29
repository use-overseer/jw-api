import type { ReadableStream } from 'node:stream/web'
import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://app.jw-cdn.org/catalogs/publications/v4'
} satisfies FetchOptions

/**
 * Repository for publication catalog resources.
 */
export const catalogRepository = {
  /**
   * Fetches a publication catalog.
   * @param id The id of the catalog to fetch.
   * @returns The catalog as a stream.
   */
  fetchCatalog: async (id: string) => {
    return await $fetch<ReadableStream>(`/${id}/catalog.db.gz`, {
      ...defaultFetchOptions,
      responseType: 'stream'
    })
  },

  /**
   * Fetches the catalog manifest.
   * @returns The catalog manifest.
   */
  fetchManifest: async () => {
    return await $fetch<CatalogManifest>('/manifest.json', { ...defaultFetchOptions })
  }
}

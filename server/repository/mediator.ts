import type { FetchOptions } from 'ofetch'

const defaultFetchOptions = {
  baseURL: 'https://b.jw-cdn.org/apis/mediator/v1'
} satisfies FetchOptions

/**
 * Repository for mediator resources.
 */
export const mediatorRepository = {
  /**
   * Fetches a list of categories.
   * @param locale The language of the categories.
   * @param clientType The client type.
   * @returns A list of categories.
   */
  fetchCategories: async (locale: JwLangCode, clientType?: ClientType) => {
    const result = await $fetch<CategoriesResult>(`/categories/${locale}`, {
      ...defaultFetchOptions,
      query: { clientType }
    })

    return result.categories
  },
  /**
   * Fetches information about a category.
   * @param locale The language of the category.
   * @param key The key of the category.
   * @param query The query parameters.
   * @returns The category information.
   */
  fetchCategory: async (locale: JwLangCode, key: CategoryKey, query?: MediatorCategoryQuery) => {
    const result = await $fetch<CategoryResult>(`/categories/${locale}/${key}`, {
      ...defaultFetchOptions,
      query
    })

    return result.category
  },
  /**
   * Fetches detailed information about a category.
   * @param locale The language of the category.
   * @param key The key of the category.
   * @param query The query parameters.
   * @returns The detailed category information.
   */
  fetchCategoryDetails: async (
    locale: JwLangCode,
    key: CategoryKey,
    query?: MediatorCategoryDetailedQuery
  ) => {
    const result = await $fetch<CategoryResultDetailed>(`/categories/${locale}/${key}`, {
      ...defaultFetchOptions,
      query: { ...query, detailed: 1 }
    })

    return result.category
  },
  /**
   * Fetches the available languages in the Mediator API.
   * @param locale The language of the languages.
   * @returns A list of languages.
   */
  fetchLanguages: async (locale: JwLangCode) => {
    const result = await $fetch<MediatorLanguageResult>(`/languages/${locale}/web`, {
      ...defaultFetchOptions
    })

    return result.languages
  },
  /**
   * Fetches information about a media item.
   * @param publication The publication to fetch the media item for.
   * @param clientType The client type.
   * @returns The media item information.
   */
  fetchMediaItem: async (publication: MediaFetcher, clientType?: ClientType) => {
    const key = 'key' in publication ? publication.key : generateMediaKey(publication)

    const result = await $fetch<MediaDataResult>(`/media-items/${publication.langwritten}/${key}`, {
      ...defaultFetchOptions,
      query: { clientType }
    })

    const data = result.media[0]
    if (!data) {
      throw createNotFoundError('Could not find media item.', {
        clientType,
        key,
        publication
      })
    }

    return data
  },
  /**
   * Fetches the translations of strings in the Mediator API.
   * @param locale The language of the strings.
   * @returns A record of translations.
   */
  fetchTranslations: async <T extends JwLangCode>(locale: T): Promise<Record<string, string>> => {
    const result = await $fetch<{ translations: Record<T, Record<string, string>> }>(
      `/translations/${locale}`,
      { ...defaultFetchOptions }
    )
    return result.translations[locale]
  }
}

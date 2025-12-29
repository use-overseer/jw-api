import { mediatorRepository } from '#server/repository/mediator'

/**
 * Gets a media item with subtitles.
 * @param publication The publication to get the media item for.
 * @returns The media item with subtitles.
 */
const getMediaWithSubtitles = async (publication: MediaFetcher) => {
  const video = await mediatorRepository.fetchMediaItem(publication)

  const bestMatch = findBestFile(video?.files ?? [], true)

  if (!bestMatch) throw createNotFoundError('No media file with subtitles found.')

  return { bestMatch, video }
}

/**
 * A service wrapping the mediator repository.
 */
export const mediatorService = {
  /**
   * Gets the categories for a given locale.
   * @param locale The locale to get the categories for. Defaults to English.
   * @returns The categories.
   */
  getCategories: async (locale: JwLangCode = 'E') => {
    return await mediatorRepository.fetchCategories(locale)
  },
  /**
   * Gets a category for a given locale.
   * @param key The key of the category to get.
   * @param locale The locale to get the category for. Defaults to English.
   * @param query A query object to filter and paginate the results.
   * @returns The category.
   */
  getCategory: async (
    key: CategoryKey,
    {
      locale = 'E',
      query
    }: {
      locale?: JwLangCode
      query?: MediatorCategoryQuery
    }
  ) => {
    return await mediatorRepository.fetchCategory(locale, key, query)
  },
  /**
   * Gets a detailed category for a given locale.
   * @param key The key of the category to get.
   * @param locale The locale to get the category for. Defaults to English.
   * @param query A query object to filter and paginate the results.
   * @returns The detailed category.
   */
  getDetailedCategory: async (
    key: CategoryKey,
    {
      locale = 'E',
      query
    }: {
      locale?: JwLangCode
      query?: MediatorCategoryDetailedQuery
    } = {}
  ) => {
    const category = await mediatorRepository.fetchCategoryDetails(locale, key, query)
    return category
  },
  getLanguages: async (locale: JwLangCode = 'E') => {
    const languages = await mediatorRepository.fetchLanguages(locale)
    return languages
  },
  getMediaItem: async (publication: MediaFetcher, clientType: ClientType = 'www') => {
    const mediaItem = await mediatorRepository.fetchMediaItem(publication, clientType)
    return mediaItem
  },
  getMediaWithSubtitles,
  /**
   * Gets the subtitles for a given media item.
   * @param publication The media item to get the subtitles for.
   * @returns The subtitles.
   */
  getSubtitles: async (publication: MediaFetcher) => {
    const { bestMatch, video } = await getMediaWithSubtitles(publication)

    if (!bestMatch?.subtitles) throw createNotFoundError('No subtitles found.')

    const subtitles = await $fetch<string>(bestMatch.subtitles.url, { responseType: 'text' })

    return { bestMatch, subtitles, video }
  },
  /**
   * Gets the translations for a given locale.
   * @param locale The locale to get the translations for. Defaults to English.
   * @returns The translations.
   */
  getTranslations: async (locale: JwLangCode = 'E') => {
    const translations = await mediatorRepository.fetchTranslations(locale)
    return translations
  }
}

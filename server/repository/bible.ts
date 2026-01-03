import { pubMediaRepository } from '#server/repository/pubMedia'
import { langSymbolToCode } from '#server/utils/general'
import { parseRTFBible } from '#server/utils/rtf'

/**
 * Repository for Bible resources using RTF files from pub-media.
 */
export const bibleRepository = {
  /**
   * Fetches RTF content for a Bible book.
   * @param book The book number (1-66).
   * @param locale The language code.
   * @returns The RTF content as plain text.
   */
  fetchBibleBookRTF: defineCachedFunction(
    async (book: number, locale: JwLangSymbol) => {
      const langCode = await langSymbolToCode(locale)

      const publication = await pubMediaRepository.fetchPublication({
        booknum: book,
        langwritten: langCode,
        pub: 'nwt'
      })

      const rtfFiles = publication.files?.[langCode]?.RTF
      if (!rtfFiles || rtfFiles.length === 0) {
        throw createNotFoundError('RTF file not found for this book.', { book, locale })
      }

      const rtfUrl = rtfFiles[0]?.file?.url
      if (!rtfUrl) {
        throw createNotFoundError('RTF URL not found.', { book, locale })
      }

      const rtfContent = await $fetch<string>(rtfUrl, { responseType: 'text' })
      const plainText = parseRTF(rtfContent)

      return plainText
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleBookRTF' }
  ),

  /**
   * Fetches a chapter of the Bible from RTF.
   * @param book The book number.
   * @param chapter The chapter number.
   * @param locale The language of the Bible.
   * @returns The chapter text.
   */
  fetchBibleChapter: defineCachedFunction(
    async (book: number, chapter: number, locale: JwLangSymbol) => {
      const langCode = await langSymbolToCode(locale)

      const publication = await pubMediaRepository.fetchPublication({
        booknum: book,
        langwritten: langCode,
        pub: 'nwt'
      })

      const rtfFiles = publication.files?.[langCode]?.RTF
      if (!rtfFiles || rtfFiles.length === 0) {
        throw createNotFoundError('RTF file not found for this book.', { book, locale })
      }

      const rtfUrl = rtfFiles[0]?.file?.url
      if (!rtfUrl) {
        throw createNotFoundError('RTF URL not found.', { book, locale })
      }

      const rtfContent = await $fetch<string>(rtfUrl, { responseType: 'text' })
      const chapters = parseRTFBible(rtfContent)

      const chapterData = chapters.find((c) => c.chapter === chapter)

      if (!chapterData) {
        throw createNotFoundError('Chapter not found in RTF.', { book, chapter, locale })
      }

      return {
        chapter: chapterData.chapter,
        verses: chapterData.verses
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleChapter' }
  ),

  /**
   * Fetches information about the Bible books.
   * @param locale The language of the Bible.
   * @param includeContent Whether to include full RTF content parsed (default: true for backward compatibility).
   * @returns The Bible books data.
   */
  fetchBibleData: defineCachedFunction(
    async (locale: JwLangSymbol, includeContent: boolean = true) => {
      const langCode = await langSymbolToCode(locale)

      // Obtener dinámicamente todos los libros desde pub-media en paralelo
      const bookPromises = Array.from({ length: 66 }, (_, i) => i + 1).map(async (bookNum) => {
        try {
          const publication = await pubMediaRepository.fetchPublication({
            booknum: bookNum,
            langwritten: langCode,
            pub: 'nwt'
          })

          const rtfFiles = publication.files?.[langCode]?.RTF
          if (rtfFiles && rtfFiles.length > 0) {
            const rtfUrl = rtfFiles[0]?.file?.url

            const baseData = {
              bookNum,
              name: rtfFiles[0]?.title || `Book ${bookNum}`,
              rtfUrl,
              standardName: publication.pubName || `Book ${bookNum}`
            }

            if (!rtfUrl || !includeContent) {
              return { ...baseData, chapters: [] }
            }

            // Descargar y parsear el RTF
            const rtfContent = await $fetch<string>(rtfUrl, { responseType: 'text' })
            const chapters = parseRTFBible(rtfContent)

            return {
              ...baseData,
              chapters
            }
          }
          return null
        } catch (error) {
          console.error(`Error fetching book ${bookNum}:`, error)
          return null
        }
      })

      const results = await Promise.all(bookPromises)
      const books = results.filter((book) => book !== null)

      return { editionData: { books } }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleData' }
  ),

  /**
   * Fetches a verse of the Bible from RTF.
   * @param book The book number.
   * @param chapter The chapter number.
   * @param verseNumber The verse number.
   * @param locale The language of the Bible.
   * @returns The verse text.
   */
  fetchBibleVerse: defineCachedFunction(
    async (book: number, chapter: number, verseNumber: number, locale: JwLangSymbol) => {
      const chapterData = await bibleRepository.fetchBibleChapter(book, chapter, locale)

      const verse = chapterData.verses.find((v) => v.verse === verseNumber)

      if (!verse) {
        throw createNotFoundError('Verse not found in chapter.', {
          book,
          chapter,
          locale,
          verseNumber
        })
      }

      return {
        chapter: chapterData.chapter,
        text: verse.text,
        verse: verse.verse
      }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleVerse' }
  )
}

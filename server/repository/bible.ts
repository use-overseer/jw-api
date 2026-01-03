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
      const langCode = locale.toUpperCase()
      
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
   * Fetches information about the Bible books.
   * @param locale The language of the Bible.
   * @returns The Bible books data.
   */
  fetchBibleData: defineCachedFunction(
    async (locale: JwLangSymbol) => {
      const langCode = locale.toUpperCase()
      
      const books = []
      for (let bookNum = 1; bookNum <= 66; bookNum++) {
        try {
          const publication = await pubMediaRepository.fetchPublication({
            booknum: bookNum,
            langwritten: langCode,
            pub: 'nwt'
          })
          
          const rtfFiles = publication.files?.[langCode]?.RTF
          if (rtfFiles && rtfFiles.length > 0) {
            books.push({
              bookNum,
              name: rtfFiles[0]?.title || `Book ${bookNum}`,
              standardName: publication.pubName || `Book ${bookNum}`
            })
          }
        } catch {
          continue
        }
      }
      
      return { editionData: { books } }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleData' }
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
      const fullText = await bibleRepository.fetchBibleBookRTF(book, locale)
      
      const chapterPattern = new RegExp(`${chapter}\\s+([^\\d][\\s\\S]*?)(?=${chapter + 1}\\s+|$)`, 'i')
      const match = fullText.match(chapterPattern)
      
      if (!match || !match[1]) {
        throw createNotFoundError('Chapter not found in RTF.', { book, chapter, locale })
      }
      
      return { content: match[1].trim() }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleChapter' }
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
      
      const versePattern = new RegExp(`${verseNumber}\\s+([^\\d][^\\n]*?)(?=\\s*${verseNumber + 1}\\s+|$)`, 'i')
      const match = chapterData.content.match(versePattern)
      
      if (!match || !match[1]) {
        throw createNotFoundError('Verse not found in chapter.', { book, chapter, verseNumber, locale })
      }
      
      return { content: match[1].trim() }
    },
    { maxAge: 60 * 60 * 24 * 30, name: 'bibleRepository.fetchBibleVerse' }
  )
}

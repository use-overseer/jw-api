import { z } from 'zod'

const routeSchema = z.object({
  book: z.coerce.number().int().min(1).max(66).describe('Bible book number (1-66)'),
  chapter: z.coerce.number().int().min(1).max(150).describe('Chapter number'),
  verse: z.coerce.number().int().min(1).max(176).describe('Verse number'),
  lang: jwLangSymbolSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, verse, lang } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getVerse({ book, chapter, verse, locale: lang })
})

import { z } from 'zod'

const routeSchema = z.object({
  book: z.coerce.number().int().min(1).max(66).describe('Bible book number (1-66)'),
  chapter: z.coerce.number().int().min(1).max(150).describe('Chapter number'),
  lang: jwLangSymbolSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, lang } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getChapter({ book, chapter, locale: lang })
})

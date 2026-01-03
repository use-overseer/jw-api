import { z } from 'zod'

const routeSchema = z.object({ lang: jwLangSymbolSchema })

export default defineLoggedEventHandler(async (event) => {
  const { lang } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getBooks(lang)
})

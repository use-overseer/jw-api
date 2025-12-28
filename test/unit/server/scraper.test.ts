import { beforeEach, describe, expect, it, vi } from 'vitest'

import { scrapeBibleDataUrl } from '../../../server/utils/scraper'

const $fetch = vi.fn()
const createNotFoundError = vi.fn((msg) => new Error(msg))

vi.stubGlobal('$fetch', $fetch)
vi.stubGlobal('createNotFoundError', createNotFoundError)

describe('scraper utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('scrapeBibleDataUrl', () => {
    it('should return English URL directly', async () => {
      const url = await scrapeBibleDataUrl('en')
      expect(url).toBe('https://www.jw.org/en/library/bible/nwt/books/json/data')
      expect($fetch).not.toHaveBeenCalled()
    })

    it('should scrape URL for other locales', async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="alternate" hreflang="es" href="https://www.jw.org/es/biblioteca/biblia/nwt/libros/" />
          </head>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)

      const url = await scrapeBibleDataUrl('es')
      expect(url).toBe('https://www.jw.org/es/biblioteca/biblia/nwt/libros/json/data')
      expect($fetch).toHaveBeenCalledWith('https://www.jw.org/en/library/bible/nwt/books/')
    })

    it('should cache the scraped URL for subsequent calls', async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="alternate" hreflang="pt" href="https://www.jw.org/pt/biblioteca/biblia/nwt/livros/" />
          </head>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)

      // First call - should fetch
      const url1 = await scrapeBibleDataUrl('pt')
      expect(url1).toBe('https://www.jw.org/pt/biblioteca/biblia/nwt/livros/json/data')
      expect($fetch).toHaveBeenCalledTimes(1)

      // Second call - should return cached
      const url2 = await scrapeBibleDataUrl('pt')
      expect(url2).toBe('https://www.jw.org/pt/biblioteca/biblia/nwt/livros/json/data')
      expect($fetch).toHaveBeenCalledTimes(1)
    })

    it('should throw error if alternate url is not found', async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="alternate" hreflang="fr" href="..." />
          </head>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)
      await expect(scrapeBibleDataUrl('it')).rejects.toThrow('Failed to find alternate url')
    })
  })
})

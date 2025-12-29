import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { catalogRepository } from '../../../server/repository/catalog'
import { catalogService } from '../../../server/utils/catalog'

// Mocks
vi.mock('../../../server/repository/catalog')
vi.mock('node:fs')
vi.mock('node:fs/promises')
vi.mock('node:stream', async () => {
  return {
    Readable: {
      fromWeb: vi.fn()
    }
  }
})

// Globals
const logger = { debug: vi.fn() }
const decompressGzip = vi.fn()
const useStorage = vi.fn()
const useDatabase = vi.fn()
const createInternalServerError = vi.fn((msg) => new Error(msg))
const createNotFoundError = vi.fn((msg) => new Error(msg))
const formatDate = vi.fn()
const langCodeToMepsId = vi.fn()

vi.stubGlobal('logger', logger)
vi.stubGlobal('decompressGzip', decompressGzip)
vi.stubGlobal('useStorage', useStorage)
vi.stubGlobal('useDatabase', useDatabase)
vi.stubGlobal('createInternalServerError', createInternalServerError)
vi.stubGlobal('createNotFoundError', createNotFoundError)
vi.stubGlobal('formatDate', formatDate)
vi.stubGlobal('langCodeToMepsId', langCodeToMepsId)

describe('catalog utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getCatalog', () => {
    it('should fetch and decompress catalog if missing', async () => {
      vi.mocked(catalogRepository.fetchManifest).mockResolvedValue({ current: 1 })
      vi.mocked(fs.existsSync).mockReturnValue(false)
      const mockStorage = { getItem: vi.fn(), setItem: vi.fn() }
      useStorage.mockReturnValue(mockStorage)
      const mockStream = {}
      vi.mocked(catalogRepository.fetchCatalog).mockResolvedValue(mockStream)

      await catalogService.getCatalog()

      expect(fsPromises.mkdir).toHaveBeenCalled()
      expect(catalogRepository.fetchCatalog).toHaveBeenCalledWith(1)
      expect(decompressGzip).toHaveBeenCalled()
      expect(mockStorage.setItem).toHaveBeenCalledWith('catalog_version', 1)
    })

    it('should skip if up to date', async () => {
      vi.mocked(catalogRepository.fetchManifest).mockResolvedValue({ current: 1 })
      vi.mocked(fs.existsSync).mockReturnValue(true) // Folder exists

      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true) // folder
        .mockReturnValueOnce(true) // file

      const mockStorage = { getItem: vi.fn().mockResolvedValue(1), setItem: vi.fn() }
      useStorage.mockReturnValue(mockStorage)

      await catalogService.getCatalog()

      expect(catalogRepository.fetchCatalog).not.toHaveBeenCalled()
    })
  })

  describe('getPublicationForDate', () => {
    it('should return publication details', async () => {
      langCodeToMepsId.mockReturnValue(123)
      formatDate.mockReturnValue('2024-01-01')

      const mockSql = vi.fn().mockResolvedValue({
        rows: [{ IssueTagNumber: 20240100 }],
        success: true
      })
      useDatabase.mockReturnValue({ sql: mockSql })

      const result = await catalogService.getPublicationForDate('w', 'E')

      expect(result).toEqual({
        issue: '202401',
        langwritten: 'E',
        pub: 'w'
      })

      expect(mockSql).toHaveBeenCalled()
    })

    it('should return full issue number if it does not end in 00', async () => {
      langCodeToMepsId.mockReturnValue(123)
      formatDate.mockReturnValue('2024-01-01')

      const mockSql = vi.fn().mockResolvedValue({
        rows: [{ IssueTagNumber: 20240115 }],
        success: true
      })
      useDatabase.mockReturnValue({ sql: mockSql })

      const result = await catalogService.getPublicationForDate('w', 'E')

      expect(result).toEqual({
        issue: '20240115',
        langwritten: 'E',
        pub: 'w'
      })

      expect(mockSql).toHaveBeenCalled()
    })

    it('should throw error if query fails', async () => {
      langCodeToMepsId.mockReturnValue(123)
      formatDate.mockReturnValue('2024-01-01')

      const mockSql = vi.fn().mockResolvedValue({
        error: 'DB Error',
        success: false
      })
      useDatabase.mockReturnValue({ sql: mockSql })

      await expect(catalogService.getPublicationForDate('w')).rejects.toThrow('SQL query failed.')
    })

    it('should throw error if no rows returned', async () => {
      langCodeToMepsId.mockReturnValue(123)
      formatDate.mockReturnValue('2024-01-01')

      const mockSql = vi.fn().mockResolvedValue({
        rows: [],
        success: true
      })
      useDatabase.mockReturnValue({ sql: mockSql })

      await expect(catalogService.getPublicationForDate('w')).rejects.toThrow(
        'SQL query returned no rows.'
      )
    })
  })
})

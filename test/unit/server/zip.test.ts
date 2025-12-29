import fs from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import zlib from 'node:zlib'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { decompressGzip } from '../../../server/utils/zip'

vi.mock('node:fs')
vi.mock('node:zlib')
vi.mock('node:stream/promises')

describe('zip utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('decompressGzip', () => {
    it('should pipeline stream through gunzip to file', async () => {
      const mockStream = new Readable()
      const outputPath = 'output.txt'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockGunzip = { on: vi.fn() } as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockWriteStream = { on: vi.fn() } as any

      vi.mocked(zlib.createGunzip).mockReturnValue(mockGunzip)
      vi.mocked(fs.createWriteStream).mockReturnValue(mockWriteStream)
      vi.mocked(pipeline).mockResolvedValue(undefined)

      await decompressGzip(mockStream, outputPath)

      expect(zlib.createGunzip).toHaveBeenCalled()
      expect(fs.createWriteStream).toHaveBeenCalledWith(outputPath)
      expect(pipeline).toHaveBeenCalledWith(mockStream, mockGunzip, mockWriteStream)
    })
  })
})

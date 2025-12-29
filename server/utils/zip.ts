import type { Readable } from 'node:stream'

import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import zlib from 'node:zlib'

/**
 * Decompresses a gzip-compressed file (`.gz`).
 * @param fileStream The file stream to decompress.
 * @param outputPath The path to the output file.
 * @returns A promise that resolves when the decompression is complete.
 */
export const decompressGzip = async (fileStream: Readable, outputPath: string): Promise<void> => {
  return await pipeline(fileStream, zlib.createGunzip(), fs.createWriteStream(outputPath))
}

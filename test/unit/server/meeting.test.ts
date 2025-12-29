import { beforeEach, describe, expect, it, vi } from 'vitest'

import { meetingService } from '../../../server/utils/meeting'

// Stub globals
const catalogService = {
  getCatalog: vi.fn(),
  getPublicationForDate: vi.fn()
}
const getMondayOfWeek = vi.fn()

vi.stubGlobal('catalogService', catalogService)
vi.stubGlobal('getMondayOfWeek', getMondayOfWeek)

describe('meeting utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getMeetingPublications', () => {
    it('should get meeting publications', async () => {
      const date = { week: 1, year: 2024 }
      const monday = new Date('2024-01-01')
      getMondayOfWeek.mockReturnValue(monday)

      catalogService.getPublicationForDate
        .mockResolvedValueOnce({ issue: 202401 }) // mwb
        .mockResolvedValueOnce({ issue: 202401 }) // w

      const result = await meetingService.getMeetingPublications(date)

      expect(catalogService.getCatalog).toHaveBeenCalled()
      expect(getMondayOfWeek).toHaveBeenCalledWith(date)
      expect(catalogService.getPublicationForDate).toHaveBeenCalledWith('mwb', 'E', monday)
      expect(catalogService.getPublicationForDate).toHaveBeenCalledWith('w', 'E', monday)

      expect(result).toEqual({
        watchtower: { issue: 202401 },
        workbook: { issue: 202401 }
      })
    })

    it('should handle failures', async () => {
      getMondayOfWeek.mockReturnValue(new Date())
      catalogService.getPublicationForDate.mockRejectedValue(new Error('Failed'))

      const result = await meetingService.getMeetingPublications()

      expect(result).toEqual({
        watchtower: null,
        workbook: null
      })
    })
  })
})

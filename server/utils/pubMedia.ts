import { pubMediaRepository } from '#server/repository/pubMedia'

export const pubMediaService = {
  getPublication: async (publication: PubFetcher) => {
    const result = await pubMediaRepository.fetchPublication(publication)
    return result
  }
}

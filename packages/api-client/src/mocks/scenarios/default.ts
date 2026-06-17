import { productFixtures } from '../fixtures/product.fixture'

export const defaultScenario = {
  products: {
    code: 'OK',
    message: 'success',
    data: {
      items: productFixtures,
      page: 1,
      size: 20,
      totalItems: productFixtures.length,
      totalPages: 1,
    },
  },
} as const

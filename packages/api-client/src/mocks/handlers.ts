import { http, HttpResponse } from 'msw'

import { defaultScenario } from './scenarios/default'

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json(defaultScenario.products)
  }),
]

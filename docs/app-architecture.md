# Pharm 앱 아키텍처

Pharm 앱은 VSA 중심 구조에 FSD-lite 경계 규칙만 적용합니다. full FSD의 `features`, `entities`, `widgets` layer는 현재 단계에서 만들지 않습니다.

## 기본 구조

```txt
apps/{fo,admin}/src/
  app/
  routes/
  domains/
  shared/
```

- `app`: providers, router instance, guard 등록, layout, app-level style.
- `routes`: Vue Router route record만 둡니다.
- `domains`: 업무 단위 vertical slice입니다.
- `shared`: 앱 내부에서 여러 domain이 공유하는 UI, helper, style입니다.

## Domain Slice

```txt
domains/{name}/
  api/
  model/
  ui/
  lib/
  index.ts
```

- `api`: `@pharm/api-client`를 감싸는 domain facade adapter.
- `model`: query keys, TanStack Query composables, Pinia store, view model.
- `ui`: page component와 domain-local component.
- `lib`: mapper, validation, pure helper.
- `index.ts`: domain 외부에 공개하는 public API.

domain 외부에서는 `@domains/{name}`만 import합니다. 다른 domain의 내부 경로를 직접 import하지 않습니다.

## Import Direction

허용 방향은 다음과 같습니다.

```txt
app -> routes -> domains -> shared
```

- `shared`는 `app`, `routes`, `domains`를 import하지 않습니다.
- `domains`는 `app`, `routes`, 다른 domain을 import하지 않습니다.
- domain 간 조합이 필요하면 `routes` 또는 `app`에서 조합합니다.
- 여러 domain에서 쓰는 순수 개념은 `shared`로 승격합니다.

## Routing

`app/router`는 router 생성과 guard 등록만 담당합니다.

```ts
import { createRouter, createWebHistory } from 'vue-router'

import { routes } from '@routes/index'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
```

route record는 domain public API를 lazy import합니다.

```ts
export const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@domains/home').then((module) => module.HomePage),
  },
]
```

## Styles

```txt
app/styles/
  main.scss
  reset.scss
  global overrides

shared/styles/
  _media.scss
  _tokens.scss
  reusable Sass helpers
```

domain/page 전용 style은 해당 domain UI component에 둡니다. 반복되는 Sass helper만 `shared/styles`로 승격합니다.

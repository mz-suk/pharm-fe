# Pharm 프론트엔드 프로젝트 결정사항

마지막 업데이트: 2026-06-22

## 프로젝트 맥락

Pharm은 로그인 기반 폐쇄형 의약품 이커머스 서비스입니다. SEO는 필요하지 않으며 프론트엔드는 CSR/SPA로 구축합니다.

## 현재 상태

초기 아키텍처 결정과 모노레포 스캐폴딩이 완료되었습니다. 현재 코드는 두 앱과 다섯 공용 패키지를 기준으로 구성되어 있습니다.

```txt
apps/
  fo/
  admin/

packages/
  config/
  tokens/
  api-client/
  app-bridge/
  utils/
```

완료된 결정:

- Vue 3, TypeScript strict mode, Vite, CSR/SPA를 사용합니다.
- pnpm workspace와 Turborepo 기반 단일 모노레포를 사용합니다.
- FO와 Admin은 별도 앱으로 구성합니다.
- FO는 Reka UI, Sass, custom design token, Storybook을 사용합니다.
- Admin은 Element Plus와 route metadata 기반 권한 모델을 사용합니다.
- Pinia와 TanStack Query의 책임을 분리합니다.
- API client boundary는 `packages/api-client`에 둡니다.
- Native bridge boundary는 `packages/app-bridge`에 둡니다.
- Design token source와 generated output은 `packages/tokens`에 둡니다.
- ESLint, Prettier, TypeScript, Vite 공통 설정은 `packages/config`에서 관리합니다.
- 앱 내부 구조는 VSA 중심 구조에 FSD-lite 경계 규칙을 결합해 `app`, `routes`, `domains`, `shared`로 정리합니다.

다음 초점:

- 첫 product/cart/order/checkout feature를 추가하며 FO domain 구조를 검증합니다.
- Admin route guard, menu config, permission helper를 구현합니다.
- OpenAPI generated client와 domain wrapper 연결을 구체화합니다.
- MSW scenario를 normal 외 상태로 확장합니다.
- APP Bridge transport의 실제 native protocol을 확정합니다.
- 테스트 전략을 확정한 뒤 test script를 추가합니다.

## 기술 스택

- TypeScript strict mode
- Vue 3와 `<script setup>`
- Vite
- pnpm workspace
- Turborepo
- Pinia
- TanStack Query for Vue
- Sass
- Style Dictionary
- MSW
- Orval

## 앱 구조 결정

### FO

FO는 하나의 adaptive PC/Mobile 앱으로 유지합니다.

현재 구조:

```txt
apps/fo/
  src/app/providers/
  src/app/router/
  src/app/styles/
  src/routes/
  src/domains/home/
  src/shared/styles/
```

결정:

- route, API, state, validation, business composable은 PC/Mobile에서 공유합니다.
- 레이아웃, 상호작용, 정보 밀도가 의미 있게 다를 때만 presentation을 분리합니다.
- product, cart, order, checkout 정확성은 공유 composable과 domain module에 둡니다.
- 복원이나 공유가 중요한 list 검색 조건, page, page size, sort 상태는 route query를 사용합니다.
- 새 FO 화면은 먼저 domain slice로 만들고 PC/Mobile presentation만 필요할 때 분리합니다.

### Admin

Admin은 배포, 인증, 소유권 경계가 필요해지기 전까지 하나의 앱으로 유지합니다.

현재 구조:

```txt
apps/admin/
  src/app/providers/
  src/app/router/
  src/app/styles/
  src/routes/
  src/domains/dashboard/
  src/shared/styles/
```

결정:

- route metadata, menu configuration, permission helper로 접근 제어를 구성합니다.
- route guard는 화면 진입을 제어합니다.
- component-level permission check는 생성, 수정, 승인, 취소, export, 삭제 같은 action을 제어합니다.
- frontend permission check는 UX 개선 목적이며 backend authorization이 source of truth입니다.
- 모든 Element Plus component를 감싸지 않고 반복되는 business pattern만 래핑합니다.
- Admin permission, menu, guard 조합은 `app` layer에서 구성합니다.

### VSA + FSD-lite 경계

FO/Admin 앱은 `template-admin` 방향을 그대로 복제하지 않고, Pharm 요구에 맞춰 VSA 중심 구조와 FSD-lite 경계 규칙을 사용합니다.

앱 기본 구조:

```txt
apps/{fo,admin}/src/
  app/        # providers, router instance, guards, layouts, app styles
  routes/     # Vue Router route records only
  domains/    # vertical slices: api, model, ui, lib
  shared/     # app-local shared ui, lib, styles, config
```

domain slice 표준:

```txt
domains/{name}/
  api/       # @pharm/api-client facade adapter
  model/     # query keys, Vue Query composables, Pinia store, view model
  ui/        # page and domain-local components
  lib/       # mapper, validation, pure helpers
  index.ts   # public API
```

결정:

- full FSD의 `features`, `entities`, `widgets` layer는 현재 단계에서 도입하지 않습니다.
- 허용 import 방향은 `app -> routes -> domains -> shared`입니다.
- `shared`는 `app`, `routes`, `domains`를 import하지 않습니다.
- domain 간 직접 import는 금지합니다. 공통 개념은 `shared`로 승격하거나 `app/routes`에서 조합합니다.
- domain 외부에서는 `@domains/{name}` barrel export를 통해 접근합니다.
- `app/router`는 router 생성과 guard 등록만 담당하고, route record는 `routes/index.ts`에 둡니다.
- style은 `app/styles`의 global style과 `shared/styles`의 reusable Sass helper로 나눕니다.
- 상세 규칙은 `docs/app-architecture.md`를 기준으로 봅니다.

## 상태 관리 결정

Pinia의 책임:

- client에 노출되는 auth/session state
- user context
- UI state
- 일시적인 client-only state

TanStack Query의 책임:

- server state orchestration
- request lifecycle
- loading/error state
- request deduplication
- cancellation
- refetch control
- mutation state

기본 QueryClient 정책:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 30 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
    },
    mutations: {
      retry: false,
    },
  },
})
```

규칙:

- Pinia를 server response의 long-lived cache로 사용하지 않습니다.
- GET 성격의 API는 `useQuery`로 감쌉니다.
- create/update/delete/order/payment API는 `useMutation`으로 감쌉니다.
- 자동 retry는 기본 비활성화합니다.

## API client 결정

`packages/api-client`가 API boundary입니다.

현재 구조:

```txt
packages/api-client/
  orval.config.ts
  src/domain/product.api.ts
  src/errors.ts
  src/http/client.ts
  src/mocks/
  src/types.ts
  src/generated/
```

결정:

- OpenAPI generated client는 `src/generated/**` 아래에 둡니다.
- generated API client 파일은 수동 수정하지 않습니다.
- 화면 컴포넌트는 generated API를 직접 호출하지 않습니다.
- HTTP client는 `credentials: 'include'`를 기본값으로 사용합니다.
- API response와 error는 API client boundary에서 정규화합니다.
- 화면 코드는 raw backend error shape나 free-form message text가 아니라 stable error code로 분기합니다.
- `traceId` 또는 `requestId`를 가능한 보존합니다.
- MSW를 공식 mock layer로 사용합니다.

## APP Bridge 결정

`packages/app-bridge`가 native integration boundary입니다.

현재 구조:

```txt
packages/app-bridge/
  src/bridge.ts
  src/events.ts
  src/methods.ts
  src/schema.ts
  src/transport.ts
  src/transports/mock.ts
  src/transports/pharm-app.ts
  src/transports/post-message.ts
```

결정:

- `window.PharmApp`, `window.WellfyApp`, `window.FlutterWebView` 같은 native object는 이 패키지 밖에서 접근하지 않습니다.
- Web to Native request/response는 `call`을 사용합니다.
- Web to Native fire-and-forget은 `emit`을 사용합니다.
- Native to Web event는 `on`을 사용합니다.
- local development와 design review를 위해 browser mock transport를 제공합니다.
- 앱별 native object 세부사항은 교체 가능한 transport 뒤에 숨깁니다.

## Design Token 결정

`packages/tokens`가 token source와 generated output을 관리합니다.

현재 구조:

```txt
packages/tokens/
  tokens/primitive/
  tokens/semantic/
  src/css/
  src/scss/
  style-dictionary.config.mjs
```

결정:

- primitive, semantic, component-level token을 분리합니다.
- CSS variable을 runtime theme contract로 사용합니다.
- Sass map은 compile-time helper로만 사용합니다.
- generated CSS/Sass token output은 수동 수정하지 않습니다.
- FO와 Admin은 semantic token을 공유할 수 있지만 같은 component token set을 강제하지 않습니다.
- component-level token은 반복되고 안정적인 UI pattern이 확인된 뒤 추가합니다.

## 모노레포 운영 결정

- 외부 라이브러리 버전은 `pnpm-workspace.yaml`의 `catalog`에서 관리합니다.
- workspace의 외부 의존성은 `catalog:`, 내부 의존성은 `workspace:*`로 선언합니다.
- ESLint, Prettier, TypeScript, Vite 공통 설정은 `packages/config`에서 관리합니다.
- FO/Admin Vite 설정은 `@pharm/config/vite/vue-app`을 사용하고 앱별 파일에는 config URL과 기본 포트만 둡니다.
- 개발 proxy의 `VITE_API_BASE_URL`은 루트 `.env`에서 읽습니다.
- dev server는 기본적으로 localhost로 실행합니다.

## 검증 결정

코드를 변경한 뒤 다음 명령을 사용합니다.

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

테스트 명령은 아직 정의하지 않았습니다. unit, component, e2e 전략이 확정된 뒤 추가합니다.

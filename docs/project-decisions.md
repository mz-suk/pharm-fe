# Pharm 프론트엔드 프로젝트 결정사항

마지막 업데이트: 2026-06-17

## 프로젝트 맥락

Pharm은 로그인 기반의 폐쇄형 의약품 이커머스 서비스입니다.

프론트엔드 PL 범위는 다음을 포함합니다.

- 디자인
- 퍼블리싱을 포함한 프론트엔드 구현
- APP 연동
- Codex를 활용한 생산성 워크플로우

서비스가 폐쇄형이고 로그인 기반이므로 SEO는 필요하지 않습니다. 프론트엔드는 CSR/SPA 애플리케이션으로 구축합니다.

## 현재 진행 상황

상태:

- 초기 프론트엔드 아키텍처 결정과 모노레포 스캐폴딩을 정리하는 단계입니다.
- `apps/fo`, `apps/admin`, `packages/*`의 기본 workspace 구조가 생성되었습니다.
- 상세한 모노레포 운영 방식은 `docs/monorepo-guide.md`에 문서화했습니다.

완료된 결정:

- Vue 3, TypeScript, Vite, CSR/SPA.
- pnpm workspace와 Turborepo 기반 단일 모노레포.
- FO와 Admin은 별도 앱으로 구성.
- FO는 Reka UI, Sass, custom design token 사용.
- Admin은 Element Plus와 권한 기반 routing 사용.
- Pinia와 TanStack Query의 상태 책임 분리.
- Design token은 CSS variable을 주요 runtime mechanism으로 사용.
- APP 연동은 `packages/app-bridge`로 격리.
- API client는 OpenAPI 기반 생성, MSW mock, thin domain wrapper 조합 사용.
- Backend API contract quality request 초안 작성.
- FO adaptive PC/Mobile 전략 문서화.
- Design token structure와 naming rule 문서화.
- Admin permission과 routing model 문서화.
- API response와 normalized error model 문서화.
- 초기 Codex workflow rule을 `AGENTS.md`에 생성.
- 모노레포 사용법, catalog 기반 버전 관리, 앱별 배포 기준 문서화.
- FO/Admin Vite 설정을 `packages/config`의 공용 helper로 단일화.
- dev proxy가 루트 `.env`의 `VITE_API_BASE_URL`을 읽도록 정리.
- Node engine 범위를 현재 toolchain 요구에 맞춰 Node 22.18+로 완화.

다음 초점:

- 미확정 API, APP Bridge, 테스트 전략을 실제 구현 규칙으로 전환.
- FO와 Admin의 첫 feature module을 추가하면서 구조 규칙 검증.

## 확정 스택

### 언어와 프레임워크

- TypeScript
- Vue 3
- `<script setup>`
- Vite
- CSR/SPA

TypeScript는 기본적으로 `strict`를 사용합니다. 앱 단위 완화는 migration 또는 delivery상 명확한 이유가 있을 때만 허용합니다.

### 저장소

- 단일 모노레포
- pnpm workspace
- Turborepo

현재 구조:

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

`packages/app-bridge`는 APP integration이 generic utility가 아니라 frontend의 1급 boundary이므로 review 중 추가되었습니다.

외부 라이브러리 버전은 `pnpm-workspace.yaml`의 `catalog` 한 곳에서 관리하고, workspace의 `package.json`에는 `catalog:`를 사용합니다. 내부 workspace 의존성은 `workspace:*`로 연결합니다.

`packages/config`는 ESLint, Prettier, TypeScript, Vite 공통 설정을 관리합니다. FO/Admin 앱의 `vite.config.ts`는 공용 `definePharmVueAppConfig` helper를 사용하고 앱별 config URL과 기본 포트만 선언합니다.

Node 기본 개발 버전은 `.nvmrc`로 안내하고, `engines.node`는 현재 toolchain 요구에 맞춰 Node 22.18+를 허용합니다.

### 상태

- Pinia
- TanStack Query for Vue

Pinia와 TanStack Query는 책임이 분리됩니다.

Pinia의 책임:

- client에 노출되는 auth/session state
- user context
- UI state
- 일시적인 client-side state

TanStack Query의 책임:

- server state orchestration
- request lifecycle
- loading/error state
- request deduplication
- cancellation
- refetch control
- mutation state

TanStack Query는 주로 cache strategy로 도입하는 것이 아닙니다. 서버 측 REST caching이 이미 존재하며, client-side cache reuse는 정책적으로 최소화해야 합니다.

권장 default query policy:

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

상품 가격, 재고, 주문 가능 여부, permission-dependent data 같은 민감한 데이터는 query-level setting을 더 엄격하게 둘 수 있습니다. 예: `gcTime: 0`.

규칙:

- Pinia를 server response의 long-lived cache로 사용하지 않는다.
- GET 성격의 API는 일반적으로 `useQuery`를 사용한다.
- create/update/delete/order/payment API는 `useMutation`을 사용한다.
- automatic retry는 기본적으로 비활성화한다.
- query cache behavior가 UX 또는 correctness에 영향을 주면 명시적으로 다룬다.

### FO UI

- Reka UI
- Sass
- Custom design tokens
- 하나의 FO app 안에서 adaptive PC/Mobile UI
- 가능한 경우 PC/Mobile core logic 공유

FO와 Admin은 UI system과 우선순위가 다르므로 UI component를 공유하지 않습니다.

### Admin UI

- Element Plus
- 단일 admin app
- BO, PO, 영역별 admin surface는 route/permission structure로 처리
- PC/tablet responsive
- 디자인 공수 최소화

Admin은 모든 Element Plus component를 감싸지 않습니다. 다음과 같은 반복 business pattern만 래핑합니다.

- Search form
- Data table
- Detail section
- Status tag
- Permission guard

### Design Tokens

- Figma to token sync는 command 기반 semi-automatic 방식.
- Style Dictionary가 다음을 생성:
  - CSS variables
  - Sass maps
- CSS variables가 주요 runtime theme mechanism.

나중에 정의할 token 영역:

- Color
- Typography
- Spacing
- Radius
- Elevation
- z-index
- Breakpoints
- Semantic tokens

### Design Token 구조와 Naming

결정:

- primitive, semantic, component-level token을 분리한다.
- app style에서는 기본적으로 semantic token을 사용한다.
- primitive token은 token definition 내부나 예외적인 low-level utility에서만 사용한다.
- 같은 token source에서 CSS variable과 Sass map을 모두 생성한다.

package structure:

```txt
packages/tokens/
  tokens/
    primitive/
      color.json
      dimension.json
      typography.json
    semantic/
      color.json
      typography.json
      spacing.json
      radius.json
      elevation.json
      z-index.json
      breakpoint.json
    component/          # 후속 component token이 필요해질 때 추가
      fo/
      admin/
  src/
    css/
    scss/
    index.ts
  style-dictionary.config.mjs
```

현재 scaffold에는 primitive/semantic token source와 CSS/Sass generated output이 있으며, component token 디렉터리는 아직 만들지 않습니다. 반복되고 안정적인 component-level pattern이 생길 때 추가합니다.

token layer:

- Primitive token은 raw design value를 표현한다.
- Semantic token은 product meaning을 표현하며 app-facing default layer가 되어야 한다.
- Component token은 semantic token만으로 깔끔하게 표현하기 어려운 반복적이고 안정적인 pattern에만 허용한다.

naming rule:

- CSS custom property는 lowercase kebab-case를 사용한다.
- 생성되는 CSS variable은 `--pharm` prefix를 사용한다.
- source token file에서는 dot-style path를 사용한다.
- app-facing semantic token에는 `blue-500`처럼 현재 색상 값에 묶이는 이름을 피한다.
- `color.text.primary`, `color.bg.surface`, `color.border.strong` 같은 role name을 선호한다.

source path 예시:

```txt
primitive.color.gray.0
primitive.color.gray.100
primitive.color.green.600

semantic.color.text.primary
semantic.color.text.secondary
semantic.color.bg.canvas
semantic.color.bg.surface
semantic.color.border.default
semantic.color.feedback.success
semantic.color.feedback.error
```

생성 CSS variable 예시:

```css
:root {
  --pharm-color-text-primary: #111827;
  --pharm-color-text-secondary: #4b5563;
  --pharm-color-bg-canvas: #ffffff;
  --pharm-color-bg-surface: #f8fafc;
  --pharm-color-border-default: #d1d5db;
}
```

runtime theme rule:

- CSS variable은 runtime contract이다.
- Sass map은 compile-time helper로만 사용한다.
- theme, brand, environment, runtime mode에 따라 바뀌어야 하는 값에는 Sass variable에 의존하지 않는다.

FO와 Admin 사용:

- FO는 custom design system에 필요하다면 더 풍부한 component token을 정의할 수 있다.
- Admin은 Element Plus default에 가깝게 유지하고, 필요한 경우 project-level semantic value만 override한다.
- FO와 Admin은 같은 semantic token을 사용할 수 있지만, 같은 component token set을 강제하지 않는다.

breakpoint:

```txt
breakpoint.mobile: 0
breakpoint.tablet: 768px
breakpoint.desktop: 1024px
breakpoint.wide: 1440px
```

이 값은 초기 가정이며, 구현 전 Figma layout rule과 맞춰야 합니다.

Codex workflow implication:

- UI를 추가할 때 Codex는 hard-coded color, spacing, radius, shadow, z-index 대신 semantic CSS variable 또는 token-backed Sass helper를 사용해야 한다.
- hard-coded style value가 들어간다면 왜 아직 token화하지 않았는지 설명해야 한다.
- token source file은 수동 편집하거나 Figma에서 sync할 수 있지만, generated CSS/Sass output은 수동 편집하지 않는다.

### Lint, Format, Git Hooks

- ESLint flat config
- Prettier
- husky
- lint-staged
- commitlint
- Conventional Commits

공유 설정 source:

- ESLint: `packages/config/eslint/index.js`
- Prettier: `packages/config/prettier.config.js`
- TypeScript: `packages/config/typescript/*`
- Vite Vue app helper: `packages/config/vite/vue-app.ts`

루트 `eslint.config.js`와 `prettier.config.js`는 `@pharm/config`를 re-export합니다. 앱별 Vite 설정은 공용 helper를 호출해 Vue plugin, `@` alias, 루트 env 로딩, `/api` proxy 설정을 중복 선언하지 않습니다.

## APP Bridge 결정

기존 reference:

```txt
/Users/mz01-suk/Documents/wellness/ws-fo-frontend/src/shared/utils/native-bridge.ts
```

기존 구현에는 다음이 섞여 있습니다.

- `window.FlutterWebView.postMessage(...)`
- `window.WellfyApp.callHandler(...)`
- 서로 다른 payload encoding style
- health, SNS login, Wellfy naming 같은 app-specific feature

Pharm은 이 구현을 직접 복사하지 않습니다. reference로만 사용합니다.

### 권장 방향

독립 package를 생성합니다.

```txt
packages/app-bridge
```

public API:

```ts
await appBridge.call('device.getInfo')
await appBridge.call('browser.open', { url })
await appBridge.emit('auth.tokenExpired')
appBridge.on('app.resume', handler)
```

책임:

- native window object에 대한 직접 접근을 숨긴다.
- typed method contract를 제공한다.
- replaceable transport를 지원한다.
- browser mock transport를 제공한다.
- timeout, unsupported method, native error, cancellation error를 정규화한다.
- Web to Native request/response와 Native to Web event를 분리한다.

### Protocol Shape

Web to Native request:

```json
{
  "version": "1.0",
  "id": "req_123",
  "method": "browser.open",
  "payload": {
    "url": "https://example.com"
  }
}
```

Native to Web success response:

```json
{
  "id": "req_123",
  "ok": true,
  "result": {
    "success": true
  }
}
```

Native to Web error response:

```json
{
  "id": "req_123",
  "ok": false,
  "error": {
    "code": "UNSUPPORTED_METHOD",
    "message": "browser.open is not supported"
  }
}
```

### Package Structure

```txt
packages/app-bridge/
  src/
    bridge.ts
    methods.ts
    transport.ts
    transports/
      pharm-app.ts
      post-message.ts
      mock.ts
    schema.ts
    errors.ts
    encoding.ts
    events.ts
    window.d.ts
    index.ts
```

### 초기 Method 후보

```txt
device.getInfo
device.getSafeArea
browser.open
externalApp.open
app.openSettings
app.getPushPermission
auth.login
auth.logout
auth.tokenExpired
file.download
share.open
```

### Bridge Rules

- business code와 screen code는 `window.PharmApp`, `window.WellfyApp`, `window.FlutterWebView` 같은 object에 직접 접근하지 않는다.
- 모든 native call은 `packages/app-bridge`를 통한다.
- request/response에는 `call`을 사용한다.
- Web to Native fire-and-forget에는 `emit`을 사용한다.
- Native to Web event에는 `on`을 사용한다.
- plain JSON payload를 우선한다.
- binary payload나 file download처럼 필요한 경우에만 UTF-8 safe base64를 사용한다.
- browser development와 design review를 위한 mock behavior를 제공한다.

### Open Questions

- 새 Pharm app이 Flutter WebView를 사용할 것인가?
- native object name을 새로 정의할 수 있는가? 예: `window.PharmApp`
- iOS와 Android 모두 Promise-like `callHandler` behavior를 지원할 수 있는가?
- 필요한 Native to Web event는 무엇인가?
- login state는 event, cookie session, 또는 다른 app-level mechanism으로 동기화할 것인가?

## API Contract 결정

전제:

- OpenAPI/Swagger가 제공될 예정.
- 실무 reference document는 별도 DTO markdown일 수 있음.
- common response와 error format은 계획되어 있으나 아직 최종 확정되지 않음.
- JWT는 httpOnly cookie로 사용 예정.
- planning과 design review를 위해 mock data가 자주 필요함.

### 권장 방향

다음을 사용합니다.

- OpenAPI-based generated client
- MSW-based mock layer
- 얇게 수동 관리되는 domain wrapper

OpenAPI/Swagger는 machine-readable contract입니다.

DTO markdown은 human review document입니다.

Swagger와 DTO markdown이 다르면 generated frontend code를 수동 patch하기보다 Swagger를 고치는 것을 우선합니다.

### Package Structure

```txt
packages/api-client/
  src/
    generated/
    http/
    domain/
    mocks/
      handlers.ts
      scenarios/
      fixtures/
    errors.ts
    index.ts
```

directory responsibility:

- `generated/`: OpenAPI에서 생성. 수동 수정 금지.
- `http/`: fetch/axios instance, credentials, interceptor, response handling.
- `domain/`: `product.api.ts`, `cart.api.ts`, `order.api.ts` 같은 thin facade.
- `mocks/`: MSW handler, fixture, review scenario.
- `errors.ts`: normalized frontend API error model.

### Tooling Recommendation

1차 후보:

- Orval

이유:

- OpenAPI에서 TypeScript API client를 생성한다.
- TanStack Query integration을 지원할 수 있다.
- MSW mock generation을 지원할 수 있다.
- Vue + TanStack Query + 잦은 mock requirement에 적합하다.

대안:

- `openapi-typescript`

더 가볍고 type generation에는 강하지만, 이 프로젝트가 원하는 API client와 mock workflow에는 Orval보다 덜 완결적입니다.

### Usage Rule

생성된 query hook은 기본적으로 screen component에서 직접 사용하지 않습니다.

screen은 project composable을 사용합니다.

```txt
apps/fo/src/composables/
  useProductDetail.ts
  useCart.ts
  useOrderSubmit.ts

apps/admin/src/composables/
  useAdminList.ts
  useAdminDetail.ts
```

이 composable들은 내부에서 다음을 조합할 수 있습니다.

- Domain API facade
- TanStack Query
- Project error handling
- UI-specific mapping

### httpOnly JWT Rules

- frontend는 JWT token을 읽거나 저장하지 않는다.
- API request는 `credentials: 'include'`를 사용한다.
- auth policy가 바뀌기 전에는 frontend `Authorization` header assembly logic을 만들지 않는다.
- 401/403 handling은 중앙화한다.
- refresh policy는 backend와 확인해야 한다.
- raw token을 APP Bridge로 전달하지 않는 것을 우선한다.
- app login state sync가 필요하다면 `auth.loginCompleted`, `auth.logout` 같은 event-like bridge method를 사용한다.

### Mock Strategy

MSW를 공식 mock layer로 사용합니다.

mock scenario는 다음을 지원해야 합니다.

- Normal product listing
- Empty cart
- Sold-out product
- Price changed
- Product unavailable
- Order failed
- Permission-limited admin user
- Session expired

권장 구조:

```txt
packages/api-client/src/mocks/
  handlers.ts
  scenarios/
    default.ts
    empty-cart.ts
    sold-out-product.ts
    order-failed.ts
    admin-permission-limited.ts
  fixtures/
    product.fixture.ts
    cart.fixture.ts
    order.fixture.ts
```

## API Response와 Error Model

결정:

- FE는 API client boundary에서 API response와 error를 정규화한다.
- screen component는 raw backend error shape을 직접 파싱하지 않는다.
- domain composable은 typed data 또는 normalized `ApiError`를 받는다.

선호 success wrapper:

```ts
interface ApiSuccess<T> {
  code: 'OK'
  message: string
  data: T
}
```

선호 list data shape:

```ts
interface PageData<T> {
  items: T[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}
```

backend의 선호 error shape:

```ts
interface ApiErrorResponse {
  code: string
  message: string
  traceId?: string
  errors?: Array<{
    field?: string
    code: string
    message: string
  }>
}
```

frontend normalized error:

```ts
interface ApiError {
  status: number
  code: string
  message: string
  traceId?: string
  fieldErrors?: Array<{
    field?: string
    code: string
    message: string
  }>
  cause?: unknown
}
```

규칙:

- 모든 API request의 기본값은 `credentials: 'include'`이다.
- API client는 JSON 문자열 body에만 기본 `Content-Type: application/json`을 설정한다.
- `FormData`, `Blob`, `URLSearchParams` 등 non-JSON `BodyInit`은 fetch/browser가 Content-Type과 multipart boundary를 정하도록 둔다.
- HTTP status는 transport와 authorization class를 처리한다.
- business `code`는 product, cart, order, payment, permission-specific UX를 처리한다.
- 401, 403, validation error, medicine commerce domain error는 중앙에서 mapping한다.
- unknown error도 안전한 user-facing message를 제공하고 diagnostic data는 logging을 위해 보존한다.
- screen code는 free-form message text가 아니라 stable error code를 기준으로 분기한다.

frontend에서 필수로 다룰 code:

```txt
AUTH_REQUIRED
SESSION_EXPIRED
FORBIDDEN
PERMISSION_DENIED
VALIDATION_ERROR
PRODUCT_SUSPENDED
PRODUCT_OUT_OF_STOCK
ORDER_QUANTITY_EXCEEDED
PURCHASE_NOT_ALLOWED
CART_PRICE_CHANGED
CART_ITEM_UNAVAILABLE
ORDER_ALREADY_SUBMITTED
```

TanStack Query policy:

- query function과 mutation function은 normalized `ApiError`를 throw한다.
- 일부 error는 page-specific recovery가 필요하므로 query-level `onError` behavior는 신중하게 사용한다.
- global handler는 session expiration, permission denial, unexpected system error를 처리할 수 있다.
- order, payment, cart update mutation은 operation이 명시적으로 idempotent가 아니라면 automatic retry를 피한다.

Mock policy:

- MSW handler는 선호 success/error shape을 반환해야 한다.
- UI review 전 common domain failure를 mock scenario에 포함해야 한다.
- backend contract가 최종 확정되지 않았더라도 mock은 desired target contract를 사용하고 assumption을 문서화한다.

## Backend API Guide Requests

이 섹션은 backend와 공유할 API contract quality guide입니다.

### OpenAPI와 Swagger

요청사항:

- Swagger를 항상 최신 상태로 유지한다.
- OpenAPI JSON/YAML을 공식 machine-readable FE contract로 취급한다.
- release 전 DTO markdown과 Swagger의 일관성을 맞춘다.
- 각 API에 explicit `operationId`를 추가한다.
- 가능하면 request와 response DTO를 reusable schema로 분리한다.
- 모호한 `any`, `object`, ambiguous `string` field를 피한다.
- enum value와 의미를 문서화한다.
- `nullable`, `optional`, `required`를 정확히 구분한다.
- date/time format을 명시하고, 가능하면 ISO 8601을 사용한다.
- amount, quantity, stock, discount rate 같은 numeric field의 unit과 range를 명시한다.

### Common Success Response

common wrapper를 사용한다면 일관되게 사용합니다.

예시:

```json
{
  "code": "OK",
  "message": "success",
  "data": {}
}
```

list response 예시:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "items": [],
    "page": 1,
    "size": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

규칙:

- `data` type은 명시적이어야 한다.
- pagination format은 일관되어야 한다.
- empty list는 `null`이 아니라 `[]`여야 한다.
- missing, empty, `null` value의 의미가 명확해야 한다.

### Common Error Response

권장 format:

```json
{
  "code": "PRODUCT_OUT_OF_STOCK",
  "message": "재고가 부족합니다.",
  "traceId": "..."
}
```

validation error 예시:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "입력값을 확인해주세요.",
  "traceId": "...",
  "errors": [
    {
      "field": "quantity",
      "code": "MIN_VALUE",
      "message": "최소 주문 수량은 1개입니다."
    }
  ]
}
```

규칙:

- error code는 string enum이어야 한다.
- error code는 domain별로 문서화해야 한다.
- HTTP status와 business code를 모호하게 섞지 않는다.
- 같은 상황은 항상 같은 error code를 반환해야 한다.
- 필요한 경우 user-facing message와 development/logging detail을 분리한다.
- `traceId` 또는 `requestId`를 포함한다.

### Auth와 Session

요청사항:

- httpOnly cookie auth를 사용할 때 frontend는 token을 읽거나 저장하지 않는다.
- CORS와 credentials policy를 명확히 정의한다.
- FE request는 `credentials: include`를 사용한다.
- authentication expiration behavior는 일관되어야 한다.
- refresh success/failure policy를 문서화해야 한다.
- login required, session expired, permission denied를 구분할 수 있어야 한다.

권장 예시:

```txt
401 AUTH_REQUIRED
401 SESSION_EXPIRED
403 FORBIDDEN
403 PERMISSION_DENIED
```

### Medicine E-Commerce Domain Errors

frontend UX는 business error code에 크게 의존합니다. 다음 case는 명시적으로 code화하고 문서화해야 합니다.

- Product suspended
- Product sold out
- Insufficient stock
- Minimum/maximum order quantity violation
- Purchase not allowed
- Member/business grade restriction
- Undeliverable region
- Cart product price changed
- Cart product sale status changed
- Stock changed during order creation
- Duplicate order submission
- Coupon/discount not applicable
- Required certification or evidence missing

example code:

```txt
PRODUCT_SUSPENDED
PRODUCT_OUT_OF_STOCK
ORDER_QUANTITY_EXCEEDED
PURCHASE_NOT_ALLOWED
CART_PRICE_CHANGED
CART_ITEM_UNAVAILABLE
ORDER_ALREADY_SUBMITTED
```

### File and Download APIs

요청사항:

- 정확한 `Content-Type`을 제공한다.
- 정확한 `Content-Disposition`을 제공한다.
- filename encoding을 합의한다.
- Web이 download를 직접 처리할지 APP Bridge에 위임할지 결정한다.
- long-running Excel download는 sync/async behavior를 명확히 한다.

### API Change Management

요청사항:

- API 변경사항은 배포 전에 FE와 공유한다.
- breaking change 기준을 정의한다.
- deletion, field rename, type change, required field change를 breaking change로 취급한다.
- Swagger diff 또는 changelog를 제공한다.
- dev/stage/prod API version과 deployment schedule을 공유한다.

### Mock and Review Support

요청사항:

- FE mock data를 만들 수 있는 충분한 DTO example을 제공한다.
- 중요한 상태에 대한 Swagger example을 추가한다.
- success, empty, permission denied, sold out, insufficient stock, order failure example을 포함한다.
- planning과 design review에 필요한 edge case를 공유한다.

## Codex Productivity Rules

초기 rule은 `AGENTS.md`에 반영되어 있습니다.

이 guide는 monorepo scaffold와 실제 command 확정 이후 계속 발전시켜야 합니다.

계속 확장할 topic:

- FO screen 생성 방법
- Admin screen 생성 방법
- API endpoint 추가 방법
- mock scenario 추가 방법
- APP Bridge method 추가 방법
- token 사용 방법
- 수동 편집하면 안 되는 code
- required verification command

candidate rule:

- `packages/api-client/src/generated`를 수동 편집하지 않는다.
- server response data를 Pinia에 long-lived cache로 저장하지 않는다.
- `packages/app-bridge` 밖에서 native window bridge object에 접근하지 않는다.
- screen component에서 generated API code를 직접 호출하지 않는다.
- deep-linking 또는 restore behavior가 필요한 list search condition, page, sort state는 route query를 사용한다.
- design/planning review state는 MSW fixture와 scenario를 사용한다.

## FO Adaptive PC/Mobile 전략

결정:

- FO는 하나의 app으로 유지한다.
- route, API, state, validation, business composable은 PC와 mobile에서 공유한다.
- layout과 interaction-heavy presentation만 PC와 mobile behavior가 의미 있게 다를 때 분리한다.

primary structure:

```txt
apps/fo/src/
  app/
    router/
    providers/
  pages/
    product/
      ProductDetailPage.vue
      ProductDetail.desktop.vue
      ProductDetail.mobile.vue
      useProductDetailPage.ts
    cart/
    order/
  components/
    common/
    desktop/
    mobile/
  composables/
  stores/
  styles/
```

규칙:

- page-level entry component는 route integration과 proper layout selection을 담당한다.
- shared page logic은 `useProductDetailPage.ts` 같은 composable에 둔다.
- desktop/mobile component는 prepared prop을 받고 domain-level event를 emit한다.
- desktop과 mobile component 사이에 API call, validation rule, order rule, permission check를 중복하지 않는다.
- 단순 responsive difference는 CSS를 사용한다.
- markup, interaction model, information density 차이가 커서 CSS-only branching이 유지보수하기 어려워질 때 component split을 사용한다.
- product, cart, order, checkout correctness는 shared composable과 domain module에 둔다.

viewport strategy:

- design token의 explicit breakpoint를 사용한다.
- layout selection과 interaction policy에만 작은 viewport composable을 사용한다.
- screen code 곳곳에 raw `window.matchMedia` call을 흩뿌리지 않는다.

권장 helper:

```ts
const { isMobile, isDesktop } = useViewport()
```

초기 breakpoint assumption:

```txt
mobile: < 768px
tablet: 768px - 1023px
desktop: >= 1024px
```

이 값은 Figma layout rule이 나온 뒤 확정해야 합니다.

rendering rule:

```vue
<template>
  <ProductDetailMobile v-if="isMobile" v-bind="viewModel" @submit-order="submitOrder" />
  <ProductDetailDesktop v-else v-bind="viewModel" @submit-order="submitOrder" />
</template>
```

중요 UX policy:

- FO는 product, cart, order, search, review state 중 user recovery가 중요한 곳에서 deep link를 지원해야 한다.
- restore 또는 sharing이 유용한 list search condition, sort, pagination은 route query를 사용한다.
- checkout과 payment flow는 app backgrounding, refresh, WebView recreation 이후 복구할 수 없는 client-only hidden state를 피한다.

Codex workflow implication:

- screen-generation instruction은 Codex가 shared page composable을 먼저 만들고 desktop/mobile presentation component를 그 다음 만들도록 해야 한다.
- review에서는 PC와 mobile file 사이에 business logic이 중복되지 않았는지 확인한다.
- screen work와 함께 mock scenario를 추가해서 design review가 desktop과 mobile state를 모두 다룰 수 있게 한다.

## Admin Permission and Routing Model

결정:

- BO, PO, 영역별 admin surface를 하나의 Admin app 안에 둔다.
- route metadata, menu configuration, permission check로 access를 분리한다.
- deployment, authentication, ownership boundary가 나중에 요구하지 않는 한 별도 admin app을 만들지 않는다.

core concept:

- Role: system admin, operation manager, partner admin, area manager 같은 coarse user type.
- Permission: granular action 또는 screen access code.
- Scope: permission이 적용되는 data boundary. 예: all, partner, area, warehouse, own.
- Route meta: role, permission, scope에서 파생되는 frontend routing requirement.

route shape:

```ts
{
  path: '/products',
  component: () => import('@/pages/product/ProductListPage.vue'),
  meta: {
    title: '상품 관리',
    layout: 'admin',
    permissions: ['product.read'],
    scopes: ['all', 'partner'],
  },
}
```

권장 permission example:

```txt
product.read
product.write
product.approve
order.read
order.cancel
member.read
member.write
settlement.read
settlement.export
admin.user.manage
```

routing rule:

- router guard는 가능한 경우 page component load 전에 접근 불가능한 route를 block한다.
- menu는 같은 route metadata 또는 밀접하게 관련된 menu config에서 생성한다.
- detail, edit, popup-like page 같은 hidden route도 permission metadata가 필요하다.
- permission denied와 session expired는 UX에서 구분되어야 한다.
- login 후 default redirect는 hard-coded dashboard가 아니라 접근 가능한 첫 route로 resolve한다.

page-level rule:

- route access는 screen entry를 제어한다.
- component-level permission check는 create, edit, approve, cancel, export, delete 같은 action을 제어한다.
- permission check를 UI에 숨기는 데 그치지 않는다. 민감한 action은 backend authorization에도 의존해야 한다.
- frontend permission check는 poor UX를 막기 위한 것이며 source of truth가 아니다.

suggested structure:

```txt
apps/admin/src/
  app/
    router/
      routes.ts
      guards.ts
    permissions/
      codes.ts
      can.ts
      menu.ts
  layouts/
    AdminLayout.vue
  pages/
  components/
    business/
      SearchForm/
      DataTable/
      DetailSection/
      StatusTag/
      PermissionGuard.vue
```

permission helper:

```ts
can('product.write')
canAny(['order.cancel', 'order.refund'])
canWithScope('settlement.read', 'partner')
```

Admin UI wrapping rule:

- 반복 business pattern을 감싸되 모든 Element Plus component를 감싸지 않는다.
- project-specific behavior가 필요하지 않은 simple form control, button, dialog, tab, table은 직접 Element Plus를 사용하는 것을 선호한다.
- search condition persistence, table pagination, export permission, status display, detail section layout처럼 behavior standardization이 필요한 경우 wrapper를 만든다.

route query policy:

- list page는 복원이 중요한 경우 search condition, page, page size, sort를 route query에 보관한다.
- detail과 edit page는 entity identity에 route param을 사용한다.
- 민감하거나 너무 긴 filter는 temporary client state를 사용할 수 있지만 recovery limitation을 명시해야 한다.

open question:

- backend-defined role과 permission code name은 무엇인가?
- permission scope가 login/session API에서 반환되는가?
- Admin app 안에서 partner/area switching이 필요한가?
- BO, PO, area admin이 같은 domain과 authentication policy 아래 배포되는가?

## 남은 결정

권장 next decision order:

1. APP Bridge native protocol을 app team과 확인
2. Test strategy: unit, component, e2e, visual regression

# Pharm FE 미확정 사항과 후속 작업

이 문서는 현재 코드 구조 기준으로 아직 확정되지 않았거나 첫 feature 구현에서 검증해야 할 항목을 추적합니다.

## API와 인증

상태: 백엔드 확인 필요.

- OpenAPI/Swagger 제공 경로와 갱신 주기를 확인합니다.
- `openapi.json`을 저장소에 커밋할지 CI에서 가져올지 결정합니다.
- 공통 success/error response shape를 확정합니다.
- `AUTH_REQUIRED`, `SESSION_EXPIRED`, `FORBIDDEN`, `PERMISSION_DENIED`의 의미와 화면 동작을 구분합니다.
- product, cart, order, checkout, payment, permission flow의 stable error code를 확정합니다.
- local, dev, stage, prod 환경의 CORS와 `credentials: include` 정책을 확인합니다.

현재 기본값:

- generated output은 `packages/api-client/src/generated/**`에 둡니다.
- `packages/api-client/src/http/client.ts`는 `credentials: 'include'`를 기본값으로 사용합니다.
- API error는 `PharmApiError`로 정규화합니다.
- MSW mock은 `packages/api-client/src/mocks/**`에서 관리합니다.

## MSW mock scenario

상태: 확장 필요.

현재는 product 기본 handler와 default scenario 중심입니다. 다음 scenario를 추가해야 합니다.

- normal
- empty
- permission denied
- sold out
- price changed
- order failed
- session expired

결정 필요:

- scenario 전환 방식을 환경 변수, query parameter, dev-only UI 중 무엇으로 할지 정합니다.
- 상품, 장바구니, 주문, checkout, payment, permission flow fixture 분리 기준을 정합니다.

## APP Bridge

상태: APP 팀 확인 필요.

- WebView 구현 방식과 native object name을 확인합니다.
- iOS/Android가 모두 Promise-like request/response를 지원하는지 확인합니다.
- `postMessage` transport의 response id matching, timeout, failure normalization을 구현합니다.
- method별 result validation 방식을 결정합니다.
- login/session 만료 이벤트 처리 정책을 확정합니다.

현재 기본값:

- public API는 `call`, `emit`, `on`입니다.
- 기본 transport는 browser mock transport입니다.
- 직접적인 `window.*` 접근은 `packages/app-bridge` 내부로 제한합니다.

## Admin 권한

상태: 백엔드와 Admin 정책 확인 필요.

- role, permission, scope code name을 확정합니다.
- scope가 login/session API에서 반환되는지 확인합니다.
- route metadata의 `permissions`를 실제 route guard와 연결합니다.
- 생성, 수정, 승인, 취소, export, 삭제 같은 action-level permission helper를 추가합니다.
- menu configuration과 permission helper의 책임 경계를 정합니다.

현재 기본값:

- Dashboard route는 `meta.permissions`를 포함합니다.
- frontend permission check는 UX 개선 목적입니다.
- backend authorization이 source of truth입니다.

## FO feature 구조

상태: 첫 feature module 구현 후 확정.

- product, cart, order, checkout, payment domain module 구조를 정합니다.
- route query로 복원해야 하는 검색 조건, page, size, sort 기준을 정합니다.
- PC/Mobile presentation 분리 기준을 실제 화면에서 검증합니다.
- business composable과 presentation component의 경계를 정합니다.

현재 기본값:

- FO는 하나의 adaptive app으로 유지합니다.
- route, API, state, validation, business composable은 공유합니다.

## Shared runtime boundary

상태: 첫 feature module 구현 후 재검토.

- FO/Admin의 QueryClient 기본 옵션이 계속 동일하면 runtime 전용 package를 검토합니다.
- `packages/utils`에는 Vue Query 같은 framework runtime 의존성을 넣지 않습니다.
- 공용화가 필요하면 `packages/app-runtime` 같은 별도 패키지를 검토합니다.

## Design Token

상태: Figma 정렬 필요.

- color, typography, spacing, radius, elevation, z-index, breakpoint primitive 값을 확정합니다.
- semantic token naming을 실제 화면 기준으로 보강합니다.
- FO/Admin component-level token boundary를 결정합니다.
- CI에서 token build 후 git diff 검증을 강제할지 결정합니다.

현재 기본값:

- `packages/tokens/tokens/**`가 source입니다.
- `packages/tokens/src/css/**`, `packages/tokens/src/scss/**`는 generated output이며 수동 수정하지 않습니다.

## 테스트 전략

상태: 프론트엔드 팀 결정 필요.

- unit test framework와 대상 범위를 선택합니다.
- component test framework와 browser/runtime 정책을 선택합니다.
- e2e framework와 critical flow 범위를 선택합니다.
- FO publishing review에 visual regression test가 필요한지 결정합니다.

우선 테스트 후보:

- API error normalization
- app-bridge transport
- Admin permission guard
- product/cart/order/checkout/payment correctness

전략 확정 후 root `package.json`, `turbo.json`, `README.md`, `AGENTS.md`에 test script를 추가합니다.

## CI와 검증 강화

상태: CI 구성 시 결정.

- `turbo.json`에 task `inputs`와 환경 변수 의존성을 명시할지 결정합니다.
- `format:check`를 turbo task로 추가할지 root script로만 유지할지 결정합니다.
- OpenAPI generated output을 커밋할지 CI에서 생성할지 확정합니다.
- token generated output 검증을 CI에 추가할지 결정합니다.
- `typescript-eslint` type-aware rule 도입 여부를 검토합니다.

## Admin 번들 최적화

상태: 첫 실제 Admin feature 추가 전 검토.

- Element Plus 전역 등록과 전체 CSS import를 유지할지 결정합니다.
- route-level code splitting 기준을 정합니다.
- chart, editor, upload, excel/export 같은 큰 의존성은 필요한 route에서만 lazy load합니다.
- chunk size warning limit만 올리는 방식은 마지막 선택지로 둡니다.

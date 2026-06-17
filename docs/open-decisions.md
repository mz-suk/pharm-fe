# Pharm FE 미확정 결정사항

이 문서는 프론트엔드 스캐폴딩과 병행해서 확인해야 할 결정사항을 추적합니다.

주요 아키텍처 결정은 `docs/project-decisions.md`를 기준으로 합니다.

## API와 인증

상태: 백엔드 확인 필요.

- OpenAPI/Swagger 제공 경로와 갱신 주기를 확인합니다.
- 공통 success/error response shape를 확정합니다.
- local, dev, stage, prod 환경의 CORS와 `credentials: include` 정책을 확인합니다.
- auth refresh 동작과 `AUTH_REQUIRED`, `SESSION_EXPIRED`, `FORBIDDEN`, `PERMISSION_DENIED` 구분을 확정합니다.
- product, cart, order, checkout, payment, permission flow의 domain error code를 확정합니다.

확정 전 프론트엔드 기본값:

- generated API output은 `packages/api-client/src/generated` 아래로 격리합니다.
- API client boundary에서 `credentials: 'include'`를 기본값으로 사용합니다.
- request function은 정규화된 `PharmApiError`를 throw합니다.
- review state는 MSW scenario로 구성합니다.

## APP Bridge

상태: APP 팀 확인 필요.

- WebView 구현 방식과 지원할 native object name을 확인합니다.
- iOS와 Android가 모두 Promise-like request/response를 지원하는지 확인합니다.
- Web to Native method name과 payload/result contract를 확정합니다.
- Native to Web event name과 payload를 확정합니다.
- login state synchronization 정책을 확인합니다.

확정 전 프론트엔드 기본값:

- public bridge API는 `call`, `emit`, `on`으로 유지합니다.
- local development에서는 browser mock transport를 사용합니다.
- 직접적인 `window.*` 접근은 `packages/app-bridge` 내부로 제한합니다.

## Design Token

상태: Figma 정렬 필요.

- color, typography, spacing, radius, elevation, z-index, breakpoint의 primitive token 값을 확정합니다.
- design과 semantic token naming을 확인합니다.
- generated CSS/Sass token output은 현재 커밋합니다. CI에서 재생성 검증을 강제할지 확정합니다.
- FO와 Admin의 component-level token boundary를 확정합니다.

확정 전 프론트엔드 기본값:

- `packages/tokens/tokens`의 placeholder token 값을 사용합니다.
- CSS variable을 runtime contract로 취급합니다.
- `packages/tokens/src/css`와 `packages/tokens/src/scss`의 generated file은 수동으로 수정하지 않습니다.

## Shared Runtime Policy

상태: 첫 feature module 구현 후 재검토.

- FO/Admin의 TanStack Query 기본 옵션은 현재 앱별 provider에 같은 값으로 선언되어 있습니다.
- 이 설정을 별도 runtime package로 분리할지, 앱별 설정으로 유지할지 결정합니다.
- 공용화한다면 `packages/utils` 같은 순수 유틸 패키지에 Vue Query 의존성을 섞지 않고 별도 boundary를 둡니다.

확정 전 프론트엔드 기본값:

- 앱별 provider에서 같은 기본 정책을 유지합니다.
- 첫 feature module에서 앱별 차이가 생기는지 확인한 뒤 공용 runtime package 도입 여부를 판단합니다.

## Admin 권한

상태: 백엔드와 Admin 정책 확인 필요.

- role, permission, scope code name을 확인합니다.
- scope가 login/session API에서 반환되는지 확인합니다.
- BO, PO, area admin의 domain/auth deployment policy를 확인합니다.
- 하나의 session 안에서 partner/area switching이 필요한지 확인합니다.

확정 전 프론트엔드 기본값:

- route metadata는 `permissions`, `scopes`를 받을 수 있게 준비합니다.
- frontend permission check는 UX 개선 목적으로만 사용합니다.
- backend authorization을 source of truth로 둡니다.

## 테스트 전략

상태: 프론트엔드 팀 결정 필요.

- unit test framework와 대상 범위를 선택합니다.
- component test framework와 browser/runtime 정책을 선택합니다.
- e2e framework와 critical flow 범위를 선택합니다.
- FO publishing review에 visual regression test가 필요한지 결정합니다.
- 전략 확정 후 root `package.json`, `turbo.json`, `README.md`, `AGENTS.md`에 test script를 추가합니다.

확정 전 프론트엔드 기본값:

- 필수 검증 명령은 `lint`, `typecheck`, `build`, `format:check`로 유지합니다.
- 실제로 동작하지 않는 placeholder test command는 추가하지 않습니다.

## 개선 후보

상태: 첫 feature module과 CI 구성 시 재검토.

Admin bundle 최적화:

- 현재 Admin은 Element Plus 의존성 때문에 초기 번들이 FO보다 큽니다.
- 첫 실제 Admin feature를 추가하기 전에 route-level lazy loading과 큰 업무 컴포넌트의 code splitting 기준을 정합니다.
- 공통 layout과 권한 guard는 유지하되, 화면별 chart, editor, upload, excel/export 관련 의존성은 필요한 route에서만 로드하는 것을 우선합니다.
- 번들 경고를 숨기기 위해 chunk size limit만 올리는 것은 마지막 선택지로 둡니다.

Shared runtime boundary:

- FO/Admin의 TanStack Query 기본 옵션이 계속 동일하면 별도 runtime boundary로 분리할 수 있습니다.
- 단, `packages/utils`는 순수 유틸 성격을 유지하고 Vue Query 같은 framework runtime 의존성을 넣지 않습니다.
- 공용화가 필요해지면 `packages/app-runtime` 같은 별도 패키지 또는 `packages/config`가 아닌 runtime 전용 패키지를 검토합니다.

Generated token 검증:

- token generated output은 현재 커밋하는 방식을 유지합니다.
- CI에서는 `pnpm --filter @pharm/tokens build` 실행 후 git diff가 없는지 확인하는 검증을 추가하는 것을 권장합니다.
- 이 검증은 generated CSS/Sass output의 수동 수정과 token source/output 불일치를 조기에 잡기 위한 목적입니다.

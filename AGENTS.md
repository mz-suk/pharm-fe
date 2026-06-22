# Pharm 프론트엔드 에이전트 가이드

이 저장소는 Pharm 프론트엔드 프로젝트를 위한 저장소입니다.

Pharm은 로그인 기반의 폐쇄형 의약품 이커머스 서비스입니다. SEO는 필요하지 않으며 프론트엔드는 CSR/SPA 모노레포로 구성합니다.

주요 프로젝트 결정은 다음 문서에 기록합니다.

```txt
docs/project-decisions.md
```

## 스택

- TypeScript strict mode 기본 사용.
- Vue 3와 `<script setup>`.
- Vite.
- pnpm workspace.
- Turborepo.
- Pinia.
- TanStack Query for Vue.
- Sass.

## 현재 코드 구조

```txt
apps/
  fo/                  # Front Office SPA
    src/app/           # provider, router
    src/pages/home/
    src/styles/
  admin/               # Admin SPA
    src/app/           # provider, router
    src/pages/dashboard/
    src/styles/

packages/
  config/              # ESLint, Prettier, TypeScript, Vite 공통 설정
  tokens/              # token source와 generated CSS/Sass output
  api-client/          # HTTP client, domain API, normalized error, MSW mock
  app-bridge/          # Native bridge boundary와 transports
  utils/               # 순수 공용 유틸리티
```

## 핵심 규칙

- Pinia를 서버 응답의 장기 캐시로 사용하지 않습니다.
- GET 성격의 서버 상태와 요청 생명주기 처리는 TanStack Query를 사용합니다.
- 생성, 수정, 삭제, 주문, 결제 API는 TanStack Query mutation을 사용합니다.
- 화면 컴포넌트에서 generated API 코드를 직접 호출하지 않습니다.
- generated API client 파일은 수동으로 수정하지 않습니다.
- `window.PharmApp`, `window.WellfyApp`, `window.FlutterWebView` 같은 네이티브 브릿지 객체는 `packages/app-bridge` 밖에서 접근하지 않습니다.
- httpOnly cookie 인증을 사용할 때 프론트엔드에서 JWT를 읽거나 저장하지 않습니다.
- API 요청에는 `credentials: 'include'`를 사용합니다.
- 가능하면 하드코딩된 색상, 간격, radius, shadow, z-index 대신 semantic design token을 사용합니다.

## 설정과 버전 관리 규칙

- 외부 라이브러리 버전은 `pnpm-workspace.yaml`의 `catalog`에서 관리합니다.
- 각 workspace의 `package.json`에는 외부 의존성을 `catalog:`, 내부 의존성을 `workspace:*`로 선언합니다.
- 빈 `dependencies` 또는 `devDependencies` 블록은 만들지 않습니다.
- ESLint, Prettier, TypeScript, Vite 공통 설정은 `packages/config`에서 관리합니다.
- FO/Admin Vite 설정은 `@pharm/config/vite/vue-app`을 사용하고, 앱별 파일에는 앱 config URL과 기본 포트만 둡니다.
- 개발 proxy의 `VITE_API_BASE_URL`은 루트 `.env`에서 읽습니다.
- dev server는 기본적으로 localhost로 실행합니다. LAN/WebView 확인이 필요할 때만 명령 인자로 `--host 0.0.0.0`을 넘깁니다.

## FO 규칙

- FO는 adaptive PC/Mobile UI를 가진 하나의 앱으로 유지합니다.
- route, API, state, validation, business composable은 PC/Mobile에서 공유합니다.
- 레이아웃, 상호작용, 정보 밀도가 의미 있게 다를 때만 desktop/mobile presentation을 분리합니다.
- product, cart, order, checkout 정확성은 공유 composable과 domain module에 둡니다.
- 복원이나 공유가 중요한 list 검색 조건, page, page size, sort 상태는 route query를 사용합니다.
- checkout/payment 흐름에서는 복구가 중요한 상태를 client-only hidden state로만 두지 않습니다.

## Admin 규칙

- 배포, 인증, 소유권 경계가 필요해지기 전까지 BO, PO, 영역별 admin surface는 하나의 Admin 앱으로 유지합니다.
- route metadata, menu configuration, permission helper로 접근 제어를 구성합니다.
- route guard는 화면 진입을 제어합니다.
- component-level permission check는 생성, 수정, 승인, 취소, export, 삭제 같은 액션을 제어합니다.
- 프론트엔드 권한 체크는 UX 개선 목적이며 backend authorization이 source of truth입니다.
- 반복되는 Element Plus 비즈니스 패턴만 래핑합니다. 모든 Element Plus 컴포넌트를 기본 래핑하지 않습니다.

## API 규칙

- API client boundary에서 API response와 error를 정규화합니다.
- 화면 컴포넌트가 raw backend error shape를 직접 파싱하지 않습니다.
- 화면 코드는 free-form message text가 아니라 stable error code를 기준으로 분기합니다.
- 가능한 경우 `traceId` 또는 `requestId`를 보존합니다.
- MSW를 공식 mock layer로 사용합니다.
- mock scenario는 normal, empty, permission denied, sold out, price changed, order failed, session expired 상태를 포함해야 합니다.

## APP Bridge 규칙

- Native integration은 `packages/app-bridge`에 둡니다.
- Web to Native request/response는 `call`을 사용합니다.
- Web to Native fire-and-forget은 `emit`을 사용합니다.
- Native to Web event는 `on`을 사용합니다.
- local development와 design review를 위한 browser mock behavior를 제공합니다.
- 앱별 native object 세부사항은 교체 가능한 transport 뒤에 숨깁니다.

## Design Token 규칙

- primitive, semantic, component-level token을 분리합니다.
- CSS variable을 runtime theme contract로 사용합니다.
- Sass map은 compile-time helper로만 사용합니다.
- generated CSS/Sass token output은 수동으로 수정하지 않습니다.
- FO와 Admin은 semantic token을 공유할 수 있지만 같은 component token set을 강제하지 않습니다.

## 검증

코드를 변경한 뒤 다음 명령을 사용합니다.

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

테스트 명령은 아직 정의하지 않았습니다. unit, component, e2e 전략이 확정된 뒤 추가합니다.

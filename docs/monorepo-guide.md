# Pharm FE 모노레포 가이드

이 문서는 현재 코드 구조 기준의 개발, 검증, 패키지 작업, 배포 가이드입니다.

## 원칙

- 저장소는 pnpm workspace와 Turborepo 기반 단일 모노레포입니다.
- `apps/fo`, `apps/admin`은 각각 독립 배포 가능한 SPA입니다.
- `packages/*`는 앱에서 공유하는 private workspace 패키지입니다.
- 외부 dependency 버전은 `pnpm-workspace.yaml`의 `catalog`에서 관리합니다.
- 내부 dependency는 `workspace:*`를 사용합니다.
- 빈 `dependencies` 또는 `devDependencies` 블록은 만들지 않습니다.
- generated output은 source of truth가 아니며 직접 수정하지 않습니다.

## 현재 디렉터리 역할

```txt
apps/
  fo/                    # Front Office 앱
    src/app/providers/   # Pinia, TanStack Query provider
    src/app/router/      # router 생성과 guard 등록
    src/app/styles/      # FO global style
    src/routes/          # FO route records
    src/domains/home/    # 초기 Home domain과 Storybook story
    src/shared/styles/   # FO shared style helper와 token story style
  admin/                 # Admin 앱
    src/app/providers/   # Pinia, TanStack Query, Element Plus provider
    src/app/router/      # router 생성과 guard 등록
    src/app/styles/      # Admin global style
    src/routes/          # Admin route metadata와 route records
    src/domains/dashboard/ # 초기 Dashboard domain
    src/shared/styles/   # Admin shared style helper

packages/
  config/                # ESLint, Prettier, TypeScript, Vite 공통 설정
  tokens/                # Style Dictionary token source와 CSS/SCSS output
  api-client/            # HTTP client, normalized error, domain API, MSW mock
  app-bridge/            # Native bridge public API와 transports
  utils/                 # 순수 공용 유틸리티
```

## 주요 workspace

### `@pharm/fo`

- Vue 3 SPA Front Office 앱입니다.
- `@pharm/api-client`, `@pharm/app-bridge`, `@pharm/tokens`, `@pharm/utils`를 사용합니다.
- Reka UI와 Storybook을 사용합니다.
- 현재 route는 `/` Home page 중심입니다.

### `@pharm/admin`

- Vue 3 SPA Admin 앱입니다.
- Element Plus를 전역 provider에 등록합니다.
- 현재 route는 `/` Dashboard page이며 `meta.permissions`를 포함합니다.
- route guard와 action-level permission helper는 후속 구현 대상입니다.

### `@pharm/config`

- `@pharm/config/eslint`
- `@pharm/config/prettier`
- `@pharm/config/typescript/*`
- `@pharm/config/vite/vue-app`

FO/Admin의 `vite.config.ts`는 공용 `definePharmVueAppConfig`를 호출하고 앱별 `appConfigUrl`, `port`만 선언합니다.

공용 Vite helper는 `@`, `@app`, `@routes`, `@domains`, `@shared` alias를 앱 `src` 하위 경계로 연결합니다.

### `@pharm/tokens`

- `tokens/**`가 design token source입니다.
- `src/css/**`, `src/scss/**`는 Style Dictionary generated output입니다.
- 앱은 `@pharm/tokens/css`를 import합니다.

### `@pharm/api-client`

- `src/http/client.ts`: `credentials: 'include'` 기본 HTTP client
- `src/errors.ts`: `PharmApiError`와 error normalization
- `src/domain/*`: 화면에서 사용할 thin domain API
- `src/generated/**`: OpenAPI generated output 예정, 수동 수정 금지
- `src/mocks/**`: MSW handler, fixture, scenario

### `@pharm/app-bridge`

- `appBridge.call`: Web to Native request/response
- `appBridge.emit`: fire-and-forget
- `appBridge.on`: Native to Web event
- `transports/mock.ts`: browser development와 design review용 mock transport
- `transports/pharm-app.ts`, `transports/post-message.ts`: native integration transport

### `@pharm/utils`

- framework dependency를 넣지 않는 순수 유틸 패키지입니다.
- 현재는 `assertNever`를 제공합니다.

## 설치

```sh
nvm use
corepack enable pnpm
pnpm install
```

`packageManager`는 루트 `package.json`에서 고정합니다. pnpm 버전을 올릴 때는 `packageManager`와 lockfile을 함께 갱신합니다.

## 버전 관리

외부 라이브러리를 추가할 때:

1. 대상 workspace `package.json`에 dependency를 `catalog:`로 추가합니다.
2. `pnpm-workspace.yaml`의 `catalog`에 실제 버전을 추가합니다.
3. `pnpm install`로 lockfile을 갱신합니다.
4. 영향 workspace를 검증합니다.

내부 패키지는 항상 `workspace:*`를 사용합니다.

## 앱 내부 구조

FO/Admin 앱은 VSA 중심 구조에 FSD-lite 경계 규칙만 적용합니다. 새 화면과 업무 기능은 먼저 domain slice로 만들고, route와 app bootstrap은 얇게 유지합니다.

```txt
apps/{fo,admin}/src/
  app/        # providers, router instance, guards, layouts, app styles
  routes/     # Vue Router route records only
  domains/    # vertical slices: api, model, ui, lib
  shared/     # app-local shared ui, lib, styles, config
```

domain slice 기본 형태:

```txt
domains/{name}/
  api/
  model/
  ui/
  lib/
  index.ts
```

alias:

- `@/*`: 앱 `src` 호환 alias입니다.
- `@app/*`: app bootstrap, providers, router instance, guard, layout, global styles.
- `@routes/*`: Vue Router route records.
- `@domains/*`: domain slice public API.
- `@shared/*`: app-local shared UI, helper, style.

새 화면 추가 순서:

1. `domains/{name}/ui`에 page component를 만듭니다.
2. API facade가 필요하면 `domains/{name}/api`, query/composable/store가 필요하면 `domains/{name}/model`에 둡니다.
3. mapper, validation, pure helper는 `domains/{name}/lib`에 둡니다.
4. 외부에서 필요한 항목만 `domains/{name}/index.ts`로 export합니다.
5. `routes/index.ts`에서 `@domains/{name}` public API를 lazy import합니다.

import 경계:

- 허용 방향은 `app -> routes -> domains -> shared`입니다.
- `shared`는 `app`, `routes`, `domains`를 import하지 않습니다.
- domain 간 직접 import는 금지합니다. 공통 개념은 `shared`로 승격하거나 `app/routes`에서 조합합니다.
- 화면 컴포넌트는 generated API client를 직접 호출하지 않고 domain facade/composable을 사용합니다.

상세 예시는 `docs/app-architecture.md`를 참고합니다.

## 자주 쓰는 명령

```sh
pnpm dev:fo
pnpm dev:admin
pnpm storybook:fo
pnpm build-storybook:fo
```

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

workspace 단위 실행:

```sh
pnpm --filter @pharm/fo build
pnpm --filter @pharm/admin build
pnpm --filter @pharm/api-client typecheck
pnpm --filter @pharm/tokens build
```

## 개발 서버

root dev script는 Vite 실행 전에 `@pharm/tokens`를 빌드합니다.

- FO: `5173`
- Admin: `5174`
- FO Storybook: `6006`

LAN/WebView 확인이 필요할 때만 다음처럼 host 옵션을 명시합니다.

```sh
pnpm --filter @pharm/tokens build
pnpm --filter @pharm/fo dev -- --host 0.0.0.0
pnpm --filter @pharm/admin dev -- --host 0.0.0.0
```

## 빌드와 배포

배포 단위는 앱입니다.

```sh
pnpm --filter @pharm/fo build
pnpm --filter @pharm/admin build
```

빌드 결과물:

```txt
apps/fo/dist/
apps/admin/dist/
```

CI 권장 순서:

```sh
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

## 변경 검증 기준

문서만 변경:

```sh
pnpm format:check
```

단일 workspace 변경:

```sh
pnpm --filter <workspace-name> lint
pnpm --filter <workspace-name> typecheck
pnpm --filter <workspace-name> build
```

공유 패키지, 설정, token, api-client, app-bridge 변경:

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

## 새 workspace 추가 규칙

1. `apps/*` 또는 `packages/*` 아래에 생성합니다.
2. package name은 `@pharm/<name>` 형식을 사용합니다.
3. 외부 dependency는 `catalog:`, 내부 dependency는 `workspace:*`를 사용합니다.
4. TypeScript 설정은 `@pharm/config`의 공유 tsconfig를 extend합니다.
5. Vue/Vite 앱이면 `@pharm/config/vite/vue-app` helper를 사용합니다.
6. `lint`, `typecheck`, `build` script를 가능한 같은 이름으로 제공합니다.
7. generated output이 있으면 source와 output의 수동 편집 규칙을 문서화합니다.

## 문제 해결

- token CSS import 실패: `pnpm --filter @pharm/tokens build`를 실행합니다.
- API generated 파일 수정 필요: generated output을 직접 수정하지 말고 OpenAPI spec, Orval config, domain wrapper 중 수정 위치를 먼저 구분합니다.
- dependency version 불일치: workspace `package.json`에 직접 버전이 들어갔는지 확인하고 `catalog:`로 바꿉니다.

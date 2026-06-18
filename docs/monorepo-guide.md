# Pharm FE 모노레포 사용 가이드

이 문서는 Pharm 프론트엔드 모노레포를 개발, 검증, 버전 관리, 배포하는 기준 문서입니다.

아키텍처 결정 배경은 `docs/project-decisions.md`를 기준으로 보고, 아직 확정되지 않은 항목은 `docs/open-decisions.md`에서 추적합니다.

## 기본 원칙

- 저장소는 pnpm workspace와 Turborepo 기반 단일 모노레포입니다.
- `apps/fo`와 `apps/admin`은 각각 독립 배포 가능한 앱입니다.
- `packages/*`는 앱에서 공유하는 내부 패키지이며, 현재는 npm registry에 배포하지 않습니다.
- 외부 라이브러리 버전은 `pnpm-workspace.yaml`의 `catalog`에서만 관리합니다.
- workspace 내부 의존성은 `workspace:*`로 연결합니다.
- 빈 `dependencies` 또는 `devDependencies` 블록은 만들지 않습니다.
- 공통 tooling 설정은 `packages/config`에서 관리하고 앱/패키지에서는 최소한의 로컬 설정만 둡니다.
- generated output은 source of truth가 아닙니다. 생성 입력과 생성 명령을 우선 관리합니다.

## 디렉터리 역할

```txt
apps/
  fo/        # Front Office 앱
  admin/     # Admin 앱

packages/
  api-client/ # API boundary, generated client, mock layer
  app-bridge/ # WebView native bridge boundary
  config/     # ESLint, Prettier, TypeScript 공유 설정
  tokens/     # Design token source와 generated CSS/Sass
  utils/      # 앱 공통 순수 유틸리티
```

## 설치와 런타임 버전

기본 개발 Node 버전은 `.nvmrc`를 기준으로 맞춥니다. 현재 `.nvmrc`는 Node 24 계열을 가리킵니다.

```sh
nvm use
corepack enable pnpm
pnpm install
```

루트 `package.json`의 `engines.node`는 현재 toolchain 요구에 맞춰 Node 22.18+를 허용합니다. `.nvmrc`는 팀의 기본 개발 버전이고, `engines.node`는 허용 가능한 실행 범위입니다.

루트 `package.json`의 `packageManager`는 pnpm 버전을 고정합니다. pnpm 버전을 올릴 때는 `packageManager`와 lockfile을 함께 갱신합니다.

`.npmrc`는 설치 동작만 관리합니다.

- `auto-install-peers=true`: peer dependency 설치 부담을 줄입니다.
- `strict-peer-dependencies=false`: UI 라이브러리 peer range 차이로 설치가 막히는 일을 줄입니다.

빌드 스크립트 실행을 허용하는 dependency 목록은 `pnpm-workspace.yaml`의 `allowBuilds`에서 관리합니다.

## 라이브러리 버전 관리

외부 라이브러리의 실제 버전은 `pnpm-workspace.yaml`의 `catalog` 한 곳에만 둡니다.

```yaml
catalog:
  vue: ^3.5.38
  vite: ^8.0.16
```

각 `package.json`에서는 버전을 직접 쓰지 않고 `catalog:`를 사용합니다.

```json
{
  "dependencies": {
    "vue": "catalog:"
  }
}
```

내부 패키지는 항상 `workspace:*`를 사용합니다.

```json
{
  "dependencies": {
    "@pharm/api-client": "workspace:*"
  }
}
```

새 외부 라이브러리를 추가할 때:

1. 대상 workspace의 `package.json`에 dependency를 추가합니다.
2. version specifier는 `catalog:`로 둡니다.
3. `pnpm-workspace.yaml`의 `catalog`에 실제 버전을 추가합니다.
4. `pnpm install`로 `pnpm-lock.yaml`을 갱신합니다.

라이브러리 버전을 올릴 때:

1. `pnpm-workspace.yaml`의 `catalog` version만 수정합니다.
2. `pnpm install`로 lockfile을 갱신합니다.
3. 영향을 받는 앱 또는 패키지를 filter로 검증합니다.
4. 공통 영향이 있으면 루트 검증 명령 전체를 실행합니다.

빈 dependency 블록은 유지하지 않습니다. 의존성이 없으면 `dependencies` 또는 `devDependencies` key 자체를 제거합니다.

root `devDependencies`는 저장소 공통 toolchain 실행을 위한 선언입니다. workspace별 `package.json`은 해당 workspace가 직접 import하거나 runtime에 필요한 의존성만 선언합니다.

## 공유 설정

`packages/config`는 다음 공통 설정의 source of truth입니다.

- ESLint flat config: `@pharm/config/eslint`
- Prettier config: `@pharm/config/prettier`
- TypeScript base config: `packages/config/typescript/*`
- Vite Vue app config helper: `@pharm/config/vite/vue-app`

FO/Admin의 `vite.config.ts`는 `definePharmVueAppConfig`를 사용하고, 앱 config URL과 기본 포트만 선언합니다.

```ts
export default definePharmVueAppConfig({
  appConfigUrl: import.meta.url,
  port: 5173,
})
```

공용 Vite helper가 관리하는 항목:

- Vue plugin 등록
- `@` alias를 앱의 `src`로 연결
- 루트 `.env` 로딩
- `/api` dev proxy와 `VITE_API_BASE_URL` fallback
- 앱별 기본 dev server port

앱별 Vite 설정에서 위 항목을 다시 선언하지 않습니다. 앱 특화 설정이 필요하면 먼저 공용 helper option으로 일반화할 수 있는지 확인합니다.

## 자주 쓰는 명령

전체 검증:

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

개발 서버:

```sh
pnpm dev:fo
pnpm dev:admin
pnpm storybook:fo
```

workspace 단위 실행:

```sh
pnpm --filter @pharm/fo build
pnpm --filter @pharm/admin build
pnpm --filter @pharm/api-client typecheck
pnpm --filter @pharm/tokens build
```

Turborepo를 직접 사용할 때:

```sh
pnpm turbo run build --filter=@pharm/fo
pnpm turbo run lint --filter=@pharm/admin
pnpm turbo run typecheck --filter=@pharm/api-client
```

## 앱 개발 흐름

FO 개발:

```sh
pnpm dev:fo
```

FO Storybook:

```sh
pnpm storybook:fo
pnpm build-storybook:fo
```

Admin 개발:

```sh
pnpm dev:admin
```

두 root dev script는 Vite 실행 전에 `@pharm/tokens`를 먼저 빌드합니다. 앱은 `@pharm/tokens/css`를 import하므로 토큰 산출물이 필요합니다.

기본 포트는 FO `5173`, Admin `5174`, FO Storybook `6006`입니다. dev server는 기본적으로 localhost로 실행합니다.

LAN 또는 WebView 기기에서 확인해야 하면 workspace dev script에 host 옵션을 넘깁니다.

```sh
pnpm --filter @pharm/tokens build
pnpm --filter @pharm/fo dev -- --host 0.0.0.0
pnpm --filter @pharm/admin dev -- --host 0.0.0.0
```

API base URL이 필요하면 `.env.example`을 기준으로 루트 `.env` 파일을 만듭니다. FO/Admin dev proxy는 공용 Vite helper를 통해 루트 env를 읽습니다.

인증은 httpOnly cookie 사용을 전제로 하므로 프론트엔드에서 JWT를 읽거나 저장하지 않습니다.

## 패키지 작업 규칙

`packages/config`:

- ESLint, Prettier, TypeScript, Vite 공유 설정을 관리합니다.
- 앱과 패키지는 가능한 공유 설정을 extend 합니다.
- 개별 workspace에서만 필요한 예외가 있을 때만 로컬 설정을 추가합니다.

`packages/tokens`:

- `tokens/**`가 design token source입니다.
- `src/css/**`와 `src/scss/**`는 Style Dictionary generated output입니다.
- generated output은 수동 수정하지 않습니다.
- token source를 바꾼 뒤 `pnpm --filter @pharm/tokens build`를 실행합니다.

`packages/api-client`:

- `src/generated/**`는 OpenAPI 기반 generated output입니다.
- 화면 컴포넌트는 generated API를 직접 호출하지 않습니다.
- 화면은 app composable 또는 domain facade를 통해 API를 사용합니다.
- mock은 MSW를 공식 mock layer로 사용합니다.

`packages/app-bridge`:

- native bridge object 접근은 이 패키지 내부로 제한합니다.
- Web to Native request/response는 `call`, fire-and-forget은 `emit`, Native to Web event는 `on`을 사용합니다.
- local development와 design review에는 mock transport를 사용합니다.

## 빌드와 배포

현재 배포 단위는 앱입니다.

- FO: `@pharm/fo`
- Admin: `@pharm/admin`

FO 빌드:

```sh
pnpm --filter @pharm/fo build
```

Admin 빌드:

```sh
pnpm --filter @pharm/admin build
```

빌드 결과물:

```txt
apps/fo/dist/
apps/admin/dist/
```

배포 시스템은 대상 앱의 `dist`만 정적 자산으로 배포합니다. 두 앱의 배포 주기, 도메인, 환경 변수는 독립적으로 운영할 수 있습니다.

CI 또는 배포 pipeline 권장 순서:

```sh
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

특정 앱만 배포하는 pipeline은 변경 감지 또는 수동 선택으로 filter를 사용할 수 있습니다.

```sh
pnpm turbo run build --filter=@pharm/fo
pnpm turbo run build --filter=@pharm/admin
```

공유 패키지가 바뀌면 해당 패키지에 의존하는 앱도 함께 검증하고 배포 영향도를 확인해야 합니다.

## 프로젝트 버전과 릴리스 관리

현재 모든 workspace는 `private: true`이며 npm package로 publish하지 않습니다. 내부 패키지의 `version`은 배포 버전 source of truth로 사용하지 않고 `0.0.0`을 유지합니다.

서비스 릴리스 버전은 Git commit, tag, CI build number, 배포 시스템 release id로 추적합니다.

권장 태그 형식:

```txt
fo-vYYYY.MM.DD.N
admin-vYYYY.MM.DD.N
```

두 앱을 같은 배포 묶음으로 릴리스할 때는 저장소 단위 태그를 사용할 수 있습니다.

```txt
release-vYYYY.MM.DD.N
```

나중에 내부 패키지를 registry에 publish해야 하는 요구가 생기면 다음을 먼저 결정합니다.

- package별 semantic version 정책
- changeset 또는 release tool 도입 여부
- 앱 배포와 package publish의 순서
- private registry와 access policy

## 변경 검증 기준

작은 문서 변경:

```sh
pnpm format:check
```

단일 패키지 변경:

```sh
pnpm --filter <workspace-name> lint
pnpm --filter <workspace-name> typecheck
pnpm --filter <workspace-name> build
```

공유 설정, token, api-client, app-bridge 변경:

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

테스트 명령은 아직 정의하지 않았습니다. unit, component, e2e 전략이 확정되면 root script와 `turbo.json`에 추가합니다.

## 새 workspace 추가

새 앱이나 패키지를 추가할 때:

1. `apps/*` 또는 `packages/*` 아래에 workspace를 만듭니다.
2. `package.json`의 `name`은 `@pharm/<name>` 형식으로 둡니다.
3. 외부 dependency는 `catalog:`, 내부 dependency는 `workspace:*`를 사용합니다.
4. 필요 없는 빈 dependency 블록은 만들지 않습니다.
5. TypeScript 설정은 `@pharm/config`의 공유 tsconfig를 extend합니다.
6. Vue/Vite 앱이면 `@pharm/config/vite/vue-app` helper를 사용합니다.
7. `lint`, `typecheck`, `build` script를 가능한 동일한 이름으로 제공합니다.
8. generated output이 있으면 source와 output의 수동 편집 규칙을 문서화합니다.

## 문제 해결

dependency version이 package마다 다르게 보이면:

- `package.json`에 직접 버전이 들어갔는지 확인합니다.
- 외부 dependency는 `catalog:`로 바꾸고 실제 버전은 `pnpm-workspace.yaml`에만 둡니다.

설치 중 build script 승인이 막히면:

- 해당 패키지가 정말 postinstall build가 필요한지 확인합니다.
- 필요하다면 `pnpm-workspace.yaml`의 `allowBuilds`에 추가합니다.

앱에서 token CSS import가 실패하면:

- `pnpm --filter @pharm/tokens build`를 실행합니다.
- generated token output이 수동으로 수정되지 않았는지 확인합니다.

API generated 파일 수정이 필요해 보이면:

- generated output을 직접 수정하지 않습니다.
- OpenAPI spec, Orval 설정, domain wrapper 중 어디를 바꿔야 하는지 먼저 구분합니다.

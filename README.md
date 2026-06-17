# Pharm FE

로그인 기반 폐쇄형 의약품 이커머스 서비스 Pharm의 프론트엔드 모노레포입니다.

주요 아키텍처 결정은 `docs/project-decisions.md`에 기록합니다. 후속으로 확정해야 할 항목은 `docs/open-decisions.md`에서 추적합니다.

모노레포 사용법, 라이브러리 버전 관리, 앱별 빌드/배포 기준은 `docs/monorepo-guide.md`를 기준으로 합니다.

## 스택

- Vue 3, TypeScript, Vite, CSR/SPA
- pnpm workspace와 Turborepo
- Pinia와 TanStack Query for Vue
- Sass, Style Dictionary 기반 디자인 토큰
- FO는 Reka UI, Admin은 Element Plus

## 구조

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

## 설치

`.nvmrc`는 기본 개발 Node 버전으로 Node 24를 가리킵니다. 루트 `package.json`의 `engines.node`는 현재 toolchain 요구에 맞춰 Node 22.18+를 허용합니다.

```sh
corepack enable pnpm
pnpm install
```

API base URL이 필요하면 `.env.example`을 기준으로 루트 `.env` 파일을 만듭니다. FO/Admin Vite 설정은 공용 `@pharm/config/vite/vue-app` helper를 통해 루트 env를 읽습니다.

## 모노레포 운영

외부 라이브러리 버전은 `pnpm-workspace.yaml`의 `catalog`에서 관리하고, 각 workspace의 `package.json`에서는 `catalog:`를 사용합니다. 내부 패키지는 `workspace:*`로 연결합니다.

ESLint, Prettier, TypeScript, Vite 공통 설정은 `packages/config`에서 관리합니다. 앱별 Vite config에는 앱 config URL과 기본 포트만 둡니다.

자세한 내용은 `docs/monorepo-guide.md`를 참고합니다.

## 개발

```sh
pnpm dev:fo
pnpm dev:admin
```

앱은 `@pharm/tokens/css`를 import하므로 root dev script는 Vite 실행 전에 디자인 토큰 산출물을 먼저 빌드합니다.

기본 포트는 FO `5173`, Admin `5174`입니다. dev server는 기본적으로 localhost로 실행합니다. LAN 또는 WebView 기기에서 확인해야 할 때만 직접 workspace dev script에 host 옵션을 넘깁니다.

```sh
pnpm --filter @pharm/tokens build
pnpm --filter @pharm/fo dev -- --host 0.0.0.0
pnpm --filter @pharm/admin dev -- --host 0.0.0.0
```

## 검증

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

테스트 명령은 아직 정의하지 않았습니다. unit, component, e2e 전략이 확정된 뒤 추가합니다.

## 커밋 메시지

커밋 메시지는 Husky의 `commit-msg` hook에서 `commitlint`로 검사합니다.

현재 저장소는 커스텀 규칙 없이 `@commitlint/config-conventional`을 확장하므로 Conventional Commits 형식을 사용합니다.

```txt
<type>(optional-scope): <description>
```

예시:

```txt
feat: add product list page
fix(api-client): normalize forbidden errors
docs: update setup guide
chore: configure turborepo
```

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert` 같은 소문자 type을 사용합니다. subject는 간결하게 작성하고 마침표로 끝내지 않습니다.

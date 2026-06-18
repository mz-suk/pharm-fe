# Pharm FE

로그인 기반 폐쇄형 의약품 이커머스 서비스 Pharm의 프론트엔드 모노레포입니다. 현재 코드는 Vue 3 + TypeScript + Vite 기반 CSR/SPA 앱 2개와 공용 패키지 5개로 구성되어 있습니다.

## 빠른 요약

- 앱: `apps/fo`, `apps/admin`
- 공용 패키지: `packages/config`, `packages/tokens`, `packages/api-client`, `packages/app-bridge`, `packages/utils`
- 패키지 매니저: pnpm workspace
- 작업 실행: Turborepo
- 상태 관리: Pinia + TanStack Query for Vue
- 스타일: Sass + Style Dictionary design token
- FO UI: Reka UI + Storybook
- Admin UI: Element Plus

## 현재 코드 구조

```txt
apps/
  fo/                  # Front Office SPA
    src/app/           # provider, router
    src/pages/home/    # 초기 Home page와 story
    src/styles/        # 앱 SCSS와 token story
  admin/               # Admin SPA
    src/app/           # provider, router
    src/pages/dashboard/
    src/styles/

packages/
  config/              # ESLint, Prettier, TypeScript, Vite 공통 설정
  tokens/              # token source와 generated CSS/SCSS output
  api-client/          # HTTP client, normalized error, domain API, MSW mock
  app-bridge/          # WebView native bridge boundary와 transports
  utils/               # 순수 공용 유틸리티

docs/
  project-decisions.md # 확정된 아키텍처 결정
  monorepo-guide.md    # 개발/검증/배포 운영 가이드
  open-decisions.md    # 미확정 사항과 후속 작업
```

## 설치

`.nvmrc`는 팀 기본 개발 Node 버전을 안내합니다. 루트 `package.json`의 `engines.node`는 Node 22.18+를 허용합니다.

```sh
corepack enable pnpm
pnpm install
```

API base URL이 필요하면 루트 `.env`에 `VITE_API_BASE_URL`을 설정합니다. FO/Admin Vite 설정은 `@pharm/config/vite/vue-app` helper를 통해 루트 env를 읽습니다.

## 개발

```sh
pnpm dev:fo
pnpm dev:admin
pnpm storybook:fo
```

root dev script는 앱 실행 전에 `@pharm/tokens`를 빌드합니다. 앱은 `@pharm/tokens/css`를 import합니다.

기본 포트:

- FO: `5173`
- Admin: `5174`
- FO Storybook: `6006`

LAN/WebView 기기 확인이 필요할 때만 workspace dev script에 host 옵션을 직접 넘깁니다.

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

테스트 명령은 아직 정의하지 않았습니다. unit, component, e2e 전략이 확정되면 root script와 `turbo.json`에 추가합니다.

## 문서

- `docs/project-decisions.md`: 현재 확정된 구조와 기술 결정
- `docs/monorepo-guide.md`: workspace 운영, 명령, 패키지 작업 규칙
- `docs/open-decisions.md`: API, APP Bridge, 권한, 테스트 등 미확정 사항

## 커밋 메시지

Husky `commit-msg` hook에서 `commitlint`가 Conventional Commits 형식을 검사합니다.

```txt
<type>(optional-scope): <description>
```

예시:

```txt
feat: add product list page
fix(api-client): normalize forbidden errors
docs: update project structure
```

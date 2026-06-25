# Pharm 프론트엔드 에이전트 가이드

이 파일은 저장소 전체에 적용되는 공통 지침입니다. 하위 폴더에 더 구체적인 `AGENTS.md`가 있으면 해당 범위의 작업에는 하위 지침도 함께 따릅니다.

## 프로젝트 개요

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
  admin/               # Admin SPA

packages/
  config/              # ESLint, Prettier, TypeScript, Vite 공통 설정
  tokens/              # token source와 generated CSS/Sass output
  api-client/          # HTTP client, domain API, normalized error, MSW mock
  app-bridge/          # Native bridge boundary와 transports
  utils/               # 순수 공용 유틸리티
```

## 전역 핵심 규칙

- Pinia를 서버 응답의 장기 캐시로 사용하지 않습니다.
- GET 성격의 서버 상태와 요청 생명주기 처리는 TanStack Query를 사용합니다.
- 생성, 수정, 삭제, 주문, 결제 API는 TanStack Query mutation을 사용합니다.
- 새 화면과 업무 기능은 먼저 앱 내부 `domains/{name}` slice로 만듭니다.
- generated 파일은 수동으로 수정하지 않습니다.
- `window.PharmApp`, `window.WellfyApp`, `window.FlutterWebView` 같은 네이티브 브릿지 객체는 `packages/app-bridge` 밖에서 접근하지 않습니다.
- httpOnly cookie 인증을 사용할 때 프론트엔드에서 JWT를 읽거나 저장하지 않습니다.
- API 요청에는 `credentials: 'include'`를 사용합니다.
- 가능하면 하드코딩된 색상, 간격, radius, shadow, z-index 대신 semantic design token을 사용합니다.

## 설정과 버전 관리 규칙

- 외부 라이브러리 버전은 `pnpm-workspace.yaml`의 `catalog`에서 관리합니다.
- 각 workspace의 `package.json`에는 외부 의존성을 `catalog:`, 내부 의존성을 `workspace:*`로 선언합니다.
- 빈 `dependencies` 또는 `devDependencies` 블록은 만들지 않습니다.
- ESLint, Prettier, TypeScript, Vite 공통 설정은 `packages/config`에서 관리합니다.
- 개발 proxy의 `VITE_API_BASE_URL`은 루트 `.env`에서 읽습니다.
- dev server는 기본적으로 localhost로 실행합니다. LAN/WebView 확인이 필요할 때만 명령 인자로 `--host 0.0.0.0`을 넘깁니다.

## 검증

코드를 변경한 뒤 다음 명령을 사용합니다.

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

테스트 명령은 아직 정의하지 않았습니다. unit, component, e2e 전략이 확정된 뒤 추가합니다.

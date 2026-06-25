# Pharm Apps 에이전트 가이드

이 파일은 `apps/**`에 적용됩니다.

## 앱 내부 구조 규칙

앱 내부는 VSA 중심 구조와 FSD-lite 경계 규칙을 사용합니다.

```txt
apps/{fo,admin}/src/
  app/        # providers, router instance, guards, layouts, app styles
  routes/     # Vue Router route records only
  domains/    # vertical slices: api, model, ui, lib
  shared/     # app-local shared ui, lib, styles, config
```

domain slice는 다음 구조를 기본으로 합니다.

```txt
domains/{name}/
  api/
  model/
  ui/
  lib/
  index.ts
```

## Import 규칙

- `app/router`는 router 생성과 guard 등록만 담당합니다.
- route record는 `routes/index.ts`에 둡니다.
- domain 외부 접근은 `@domains/{name}` barrel export를 통해서만 합니다.
- 허용 import 방향은 `app -> routes -> domains -> shared`입니다.
- domain 간 직접 import는 금지합니다. 공통 개념은 `shared`로 승격하거나 `app/routes`에서 조합합니다.
- 화면 컴포넌트에서 generated API 코드를 직접 호출하지 않습니다.
- 화면 컴포넌트는 generated API를 직접 호출하지 않고 domain `api` facade 또는 `model` composable을 사용합니다.

# TODO

## VSA + FSD-lite 3단계 검증

상태: 미완료

1단계 문서/규칙 확정과 2단계 placeholder 구조 반영은 완료되었습니다. 남은 작업은 첫 실제 feature를 추가하면서 현재 구조와 boundary rule이 실무 개발에 충분한지 검증하는 것입니다.

## 추천 대상

우선순위는 FO feature 기준으로 잡습니다.

1. `product list`
2. `product detail`
3. `cart`
4. `checkout`

첫 검증 대상으로는 검색 조건, route query, API 조회, empty/loading/error UI를 함께 확인할 수 있는 `product list`가 적합합니다.

## 작업 범위

예: `domains/product`

```txt
apps/fo/src/domains/product/
  api/       # @pharm/api-client facade adapter
  model/     # query keys, TanStack Query composables, view model
  ui/        # page and domain-local components
  lib/       # mapper, validation, pure helpers
  index.ts   # public API
```

구현 시 확인할 항목:

- `domains/product/api`에서 API client boundary를 감쌉니다.
- `domains/product/model`에 query key와 TanStack Query composable을 둡니다.
- `domains/product/ui`에 page component와 domain-local component를 둡니다.
- `domains/product/lib`에 mapper, validation, pure helper를 둡니다.
- route record는 `apps/fo/src/routes/index.ts`에서 `@domains/product` public API를 lazy import합니다.
- 검색 조건, page, page size, sort처럼 복원/공유가 중요한 상태는 route query를 사용합니다.
- 화면 컴포넌트는 generated API client를 직접 호출하지 않습니다.
- PC/Mobile presentation 분리가 필요하면 business logic은 domain `model` 또는 page composable에 공유하고 UI만 분리합니다.
- 현재 ESLint boundary rule이 실제 feature에서도 충분한지 확인하고 필요하면 보완합니다.

## 완료 기준

- 실제 FO feature 하나가 `app / routes / domains / shared` 구조 안에서 동작합니다.
- domain 외부 접근은 `@domains/{name}` barrel export만 사용합니다.
- domain 간 직접 import가 없습니다.
- GET 서버 상태는 TanStack Query composable로 처리합니다.
- 생성, 수정, 삭제가 포함될 경우 mutation으로 처리합니다.
- raw backend error shape를 화면 컴포넌트가 직접 파싱하지 않습니다.
- 검증 명령이 통과합니다.

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
pnpm build-storybook:fo
```

## 차후 작업 요청 예시

```txt
VSA + FSD-lite 3단계로 FO product list 기능을 추가하면서 구조 규칙을 검증해줘.
```

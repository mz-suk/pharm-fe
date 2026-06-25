# Pharm FO 에이전트 가이드

이 파일은 `apps/fo/**`에 적용됩니다. 공통 앱 구조 규칙은 `apps/AGENTS.md`를 따릅니다.

## FO 규칙

- FO는 adaptive PC/Mobile UI를 가진 하나의 앱으로 유지합니다.
- route, API, state, validation, business composable은 PC/Mobile에서 공유합니다.
- 레이아웃, 상호작용, 정보 밀도가 의미 있게 다를 때만 desktop/mobile presentation을 분리합니다.
- product, cart, order, checkout 정확성은 공유 composable과 domain module에 둡니다.
- FO PC/Mobile business logic은 domain `model` 또는 page composable에 둡니다.
- 복원이나 공유가 중요한 list 검색 조건, page, page size, sort 상태는 route query를 사용합니다.
- checkout/payment 흐름에서는 복구가 중요한 상태를 client-only hidden state로만 두지 않습니다.

## FO Storybook

- FO UI 문서화와 design review에는 `apps/fo` Storybook을 사용합니다.
- Storybook 전용 코드는 FO app scope 안에서 관리합니다.

# Pharm Packages 에이전트 가이드

이 파일은 `packages/**`에 적용됩니다.

## 공유 패키지 공통 규칙

- `packages/*`는 앱에서 공유하는 private workspace package입니다.
- 외부 의존성은 각 package의 `package.json`에 `catalog:`로 선언합니다.
- 내부 package 의존성은 `workspace:*`를 사용합니다.
- public API는 package `exports`와 `src/index.ts`를 기준으로 관리합니다.
- 앱에서 직접 참조해야 하는 기능만 public export합니다.
- package 내부 구현 세부사항을 앱에서 직접 import하지 않도록 합니다.
- generated output은 source of truth가 아니며 직접 수정하지 않습니다.

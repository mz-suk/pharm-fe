# Pharm Admin 에이전트 가이드

이 파일은 `apps/admin/**`에 적용됩니다. 공통 앱 구조 규칙은 `apps/AGENTS.md`를 따릅니다.

## Admin 규칙

- 배포, 인증, 소유권 경계가 필요해지기 전까지 BO, PO, 영역별 admin surface는 하나의 Admin 앱으로 유지합니다.
- route metadata, menu configuration, permission helper로 접근 제어를 구성합니다.
- Admin permission, menu, guard는 `app` 레이어에서 조합합니다.
- route guard는 화면 진입을 제어합니다.
- component-level permission check는 생성, 수정, 승인, 취소, export, 삭제 같은 액션을 제어합니다.
- 프론트엔드 권한 체크는 UX 개선 목적이며 backend authorization이 source of truth입니다.
- 반복되는 Element Plus 비즈니스 패턴만 래핑합니다. 모든 Element Plus 컴포넌트를 기본 래핑하지 않습니다.

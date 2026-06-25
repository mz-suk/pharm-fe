# Pharm Config Package 에이전트 가이드

이 파일은 `packages/config/**`에 적용됩니다.

## Config 규칙

- ESLint, Prettier, TypeScript, Vite 공통 설정은 이 패키지에서 관리합니다.
- FO/Admin Vite 설정은 `@pharm/config/vite/vue-app`을 사용하고, 앱별 파일에는 앱 config URL과 기본 포트만 둡니다.
- alias 변경은 앱 구조 규칙과 import boundary에 미치는 영향을 함께 검토합니다.
- root `eslint.config.js`와 `prettier.config.js`는 이 패키지의 설정을 재export하는 entry 역할로 유지합니다.

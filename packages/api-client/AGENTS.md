# Pharm API Client Package 에이전트 가이드

이 파일은 `packages/api-client/**`에 적용됩니다.

## API 규칙

- API client boundary에서 API response와 error를 정규화합니다.
- 화면 컴포넌트가 raw backend error shape를 직접 파싱하지 않습니다.
- 화면 코드는 free-form message text가 아니라 stable error code를 기준으로 분기합니다.
- 가능한 경우 `traceId` 또는 `requestId`를 보존합니다.
- API 요청에는 `credentials: 'include'`를 사용합니다.
- generated API client 파일은 수동으로 수정하지 않습니다.
- generated API는 package/domain API facade로 감싸서 앱에 노출합니다.

## MSW 규칙

- MSW를 공식 mock layer로 사용합니다.
- mock scenario는 normal, empty, permission denied, sold out, price changed, order failed, session expired 상태를 포함해야 합니다.

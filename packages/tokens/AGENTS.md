# Pharm Tokens Package 에이전트 가이드

이 파일은 `packages/tokens/**`에 적용됩니다.

## Design Token 규칙

- primitive, semantic, component-level token을 분리합니다.
- CSS variable을 runtime theme contract로 사용합니다.
- Sass map은 compile-time helper로만 사용합니다.
- generated CSS/Sass token output은 수동으로 수정하지 않습니다.
- FO와 Admin은 semantic token을 공유할 수 있지만 같은 component token set을 강제하지 않습니다.

## Generated Output

- token source는 `tokens/**`입니다.
- generated CSS/SCSS output은 직접 수정하지 않습니다.
- token output 변경이 필요하면 source token 또는 Style Dictionary config를 수정합니다.

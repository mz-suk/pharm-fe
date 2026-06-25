# Pharm App Bridge Package 에이전트 가이드

이 파일은 `packages/app-bridge/**`에 적용됩니다.

## App Bridge 규칙

- Native integration은 `packages/app-bridge`에 둡니다.
- `window.PharmApp`, `window.WellfyApp`, `window.FlutterWebView` 같은 네이티브 브릿지 객체는 이 패키지 밖에서 접근하지 않습니다.
- Web to Native request/response는 `call`을 사용합니다.
- Web to Native fire-and-forget은 `emit`을 사용합니다.
- Native to Web event는 `on`을 사용합니다.
- local development와 design review를 위한 browser mock behavior를 제공합니다.
- 앱별 native object 세부사항은 교체 가능한 transport 뒤에 숨깁니다.

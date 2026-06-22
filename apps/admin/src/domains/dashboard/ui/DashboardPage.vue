<template>
  <main class="admin-dashboard">
    <section class="admin-dashboard__panel">
      <p class="admin-dashboard__eyebrow">Pharm Admin</p>
      <h1>관리자 앱 골격</h1>
      <p>권한 기반 라우팅과 Element Plus 비즈니스 패턴을 확장할 준비가 된 상태입니다.</p>
      <ElButton type="primary">Element Plus 연결 확인</ElButton>
    </section>
  </main>
</template>

<style scoped lang="scss">
.admin-dashboard {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: var(--pharm-spacing-8);
}

.admin-dashboard__panel {
  width: min(100%, 720px);
  padding: var(--pharm-spacing-8);
  border: 1px solid var(--pharm-color-border-default);
  border-radius: var(--pharm-radius-lg);
  background: var(--pharm-color-bg-surface);
}

.admin-dashboard__eyebrow {
  margin: 0;
  color: var(--pharm-color-text-secondary);
}
</style>

<script setup lang="ts">
const title = 'Pharm FO'
</script>

<template>
  <main class="fo-home">
    <p class="fo-home__eyebrow">Closed medicine commerce</p>
    <h1>{{ title }}</h1>
    <p>FO 앱은 PC/Mobile adaptive UI를 한 앱에서 구성합니다.</p>
  </main>
</template>

<style scoped lang="scss">
.fo-home {
  display: grid;
  min-height: 100vh;
  align-content: center;
  gap: var(--pharm-spacing-4);
  padding: var(--pharm-spacing-8);
}

.fo-home__eyebrow {
  margin: 0;
  color: var(--pharm-color-text-secondary);
}
</style>

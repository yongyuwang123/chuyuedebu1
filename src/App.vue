<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGuaStore } from './store/gua';
import DivinationView from './components/DivinationView.vue';
import ResultView from './components/ResultView.vue';

const store = useGuaStore();
const { phase } = storeToRefs(store);
</script>

<template>
  <div class="app">
    <header class="top">
      <h1 class="seal">观爻</h1>
      <p class="tag">赛博六爻起卦与排盘系统</p>
    </header>

    <main>
      <DivinationView v-if="phase !== 'done'" />
      <ResultView v-else />
    </main>

    <footer class="foot">铜钱落处，天机自显 · 解卦仍需读《增删卜易》《卜筮正宗》</footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.top {
  text-align: center;
  padding: 1.4rem 0 0.4rem;
}
.top h1 {
  font-size: 2.8rem;
  letter-spacing: 1rem;
  margin: 0;
  text-indent: 1rem;
  color: var(--c-qingtong-bright);
  text-shadow: 0 0 18px rgba(176, 141, 87, 0.4);
}
.tag {
  color: var(--c-xuanzhi-dim);
  letter-spacing: 0.5rem;
  font-size: 0.85rem;
  margin: 0.3rem 0 0;
}
main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem 0;
}
.foot {
  text-align: center;
  color: var(--c-xuanzhi-dim);
  font-size: 0.75rem;
  padding: 0.8rem 0 1.2rem;
  opacity: 0.7;
}
</style>

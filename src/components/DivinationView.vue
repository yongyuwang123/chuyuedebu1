<script setup lang="ts">
// 起卦主界面：静心 → 输入所占 → 连点/长按摇卦（铜钱动画）→ 六爻旁白 → 出卦
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGuaStore } from '../store/gua';
import CoinRow from './CoinRow.vue';
import { ensureAudio, playCoinClatter, playChime } from '../core/audio';
import { TEXTS } from '../core/texts';

const store = useGuaStore();
const { question, phase, currentYao, yaos, narration, longitude } = storeToRefs(store);
const spinning = ref(false);

const lastCoins = computed<[number, number, number] | undefined>(() => {
  const last = yaos.value[yaos.value.length - 1];
  return last?.coins ?? undefined;
});

// 六爻生成进度（初→上，1=阳 0=阴 显示）
const progress = computed(() =>
  Array.from({ length: 6 }, (_, i) => {
    const y = yaos.value[i];
    if (!y) return { done: false, sym: '' };
    return { done: true, sym: y.yinyang === 'yang' ? '⚊' : '⚋' };
  }),
);

function onCast() {
  if (store.phase === 'done' || store.currentYao >= 6) return;
  // 防坑：点击瞬间 resume AudioContext，否则首摇静音
  ensureAudio();
  playCoinClatter();
  spinning.value = true;
  store.castOne();
  const justCast = store.currentYao;
  window.setTimeout(() => {
    spinning.value = false;
    if (justCast >= 6) {
      void store.finalize().then(() => playChime());
    }
  }, 560);
}
</script>

<template>
  <section class="divine">
    <p class="ask-label">所占之事</p>
    <input
      v-model="question"
      class="ask-input"
      :placeholder="TEXTS.askPlaceholder"
      :disabled="phase !== 'idle'"
    />

    <p class="narration">{{ narration }}</p>

    <CoinRow :faces="lastCoins" :spinning="spinning" />

    <div class="progress">
      <span
        v-for="(p, i) in progress"
        :key="i"
        class="slot"
        :class="{ done: p.done }"
      >{{ p.done ? p.sym : '·' }}</span>
    </div>

    <p class="convention">{{ TEXTS.convention }}</p>

    <button
      class="btn-ink"
      :disabled="phase === 'done' || currentYao >= 6"
      @click="onCast"
    >
      {{ currentYao === 0 ? '摇卦' : currentYao < 6 ? `第 ${currentYao + 1} 爻` : '成卦' }}
    </button>

    <label class="lon">
      起卦地经度（度）：
      <input
        v-model.number="longitude"
        type="number"
        min="-180"
        max="180"
        step="1"
      />
      <span class="hint">默认 120 = 东八区；用于真太阳时换算（每度 ±4 分钟）</span>
    </label>

    <button v-if="phase === 'done'" class="btn-reset" @click="store.reset()">重起一卦</button>
  </section>
</template>

<style scoped>
.divine {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 560px;
  margin: 0 auto;
  padding: 1rem;
}
.ask-label {
  color: var(--c-qingtong);
  letter-spacing: 0.4rem;
  margin: 0.5rem 0 0;
}
.ask-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--c-qingtong);
  color: var(--c-xuanzhi);
  font-family: inherit;
  font-size: 1.2rem;
  text-align: center;
  padding: 0.5rem;
  outline: none;
}
.ask-input::placeholder {
  color: var(--c-xuanzhi-dim);
  font-size: 0.95rem;
}
.narration {
  min-height: 1.6rem;
  color: var(--c-zhusha-soft);
  font-size: 1.15rem;
  letter-spacing: 0.2rem;
  text-align: center;
}
.progress {
  display: flex;
  gap: 0.8rem;
  font-size: 1.6rem;
  color: var(--c-xuanzhi-dim);
}
.slot.done {
  color: var(--c-qingtong-bright);
}
.convention {
  font-size: 0.78rem;
  color: var(--c-xuanzhi-dim);
  text-align: center;
  max-width: 420px;
  line-height: 1.5;
}
.lon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--c-xuanzhi-dim);
}
.lon input {
  width: 5rem;
  background: var(--c-xuan-2);
  border: 1px solid var(--c-qingtong);
  color: var(--c-xuanzhi);
  font-family: inherit;
  padding: 0.25rem;
  text-align: center;
}
.hint {
  font-size: 0.72rem;
}
.btn-reset {
  background: none;
  border: 1px solid var(--c-xuanzhi-dim);
  color: var(--c-xuanzhi-dim);
  font-family: inherit;
  padding: 0.4rem 1.4rem;
  cursor: pointer;
  border-radius: 2px;
}
.btn-reset:hover {
  color: var(--c-zhusha-soft);
  border-color: var(--c-zhusha);
}
</style>

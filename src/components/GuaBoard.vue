<script setup lang="ts">
// 单卦排盘展示：卦名/卦辞 + 六爻（上爻在上、初爻在下），含世应、纳甲地支、五行、六亲、六神、空亡、动爻朱砂红。
import { computed } from 'vue';
import type { Gua, Yao } from '../core/types';

const props = defineProps<{
  gua: Gua;
  yaos: Yao[];
  caption: string;
}>();

// 渲染顺序：上爻在最上 → 初爻在最下（数组为初→上，reverse）
const rows = computed(() =>
  [...props.yaos]
    .map((y) => ({
      ...y,
      yaoTi: props.gua.lines[y.yao - 1]?.yaoTi ?? `第${y.yao}爻`,
    }))
    .reverse(),
);

const wuxingColor: Record<string, string> = {
  金: '#d8b574',
  木: '#7fae6b',
  水: '#6f9fd0',
  火: '#e0674f',
  土: '#c9a86a',
};
</script>

<template>
  <div class="board panel">
    <div class="head">
      <h3 class="name seal">{{ gua.name }}</h3>
      <span class="sym">{{ gua.symbol }}</span>
    </div>
    <p class="guaci">「{{ gua.guaCi }}」</p>

    <div class="yaos">
      <div
        v-for="r in rows"
        :key="r.yao"
        class="yao"
        :class="{ dong: r.isDong, kong: r.isKongWang }"
      >
        <div class="meta">
          <span class="yaoti">{{ r.yaoTi }}</span>
          <span v-if="r.isShi" class="tag shi">世</span>
          <span v-if="r.isYing" class="tag ying">应</span>
        </div>

        <div class="line">
          <!-- 阳爻：实横条；阴爻：断横条 -->
          <div class="bar" :class="r.yinyang === 'yang' ? 'yang' : 'yin'"></div>
          <span v-if="r.isDong" class="mark">{{ r.value === 9 ? '○' : '×' }}</span>
        </div>

        <div class="info">
          <span class="lq">{{ r.liuqin }}</span>
          <span class="dz" :style="{ color: wuxingColor[r.wuxing ?? ''] }">{{ r.dizhi }}·{{ r.wuxing }}</span>
          <span class="ls">{{ r.liushen }}</span>
          <span v-if="r.isKongWang" class="tag kong">空</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
}
.name {
  font-size: 1.6rem;
  margin: 0;
  letter-spacing: 0.2rem;
}
.sym {
  font-size: 1.4rem;
  color: var(--c-qingtong-bright);
}
.guaci {
  margin: 0.3rem 0 1rem;
  color: var(--c-xuanzhi-dim);
  font-style: italic;
}
.yaos {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.yao {
  display: grid;
  grid-template-columns: 4.2rem 5.5rem 1fr;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0.4rem;
  border-radius: 3px;
}
.yao.dong {
  background: rgba(200, 64, 47, 0.12);
  box-shadow: inset 0 0 0 1px rgba(200, 64, 47, 0.5);
}
.meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.yaoti {
  color: var(--c-xuanzhi);
  font-size: 0.95rem;
}
.tag {
  font-size: 0.7rem;
  padding: 0 0.3rem;
  border-radius: 2px;
  border: 1px solid currentColor;
}
.tag.shi {
  color: var(--c-zhusha);
}
.tag.ying {
  color: var(--c-qingtong-bright);
}
.tag.kong {
  color: #8a8a8a;
}
.line {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
}
.bar {
  height: 10px;
  width: 4.4rem;
  background: var(--c-xuanzhi);
}
.bar.yang {
  /* 阳爻实条 */
  background: linear-gradient(90deg, var(--c-xuanzhi), #fff7e6);
}
.bar.yin {
  /* 阴爻断条 */
  background: transparent;
  border-top: 5px solid var(--c-xuanzhi);
  border-bottom: 5px solid var(--c-xuanzhi);
  height: 0;
  position: relative;
}
.bar.yin::before,
.bar.yin::after {
  content: '';
  position: absolute;
  top: -5px;
  height: 10px;
  width: 1.9rem;
  background: var(--c-xuanzhi);
}
.bar.yin::before {
  left: 0;
}
.bar.yin::after {
  right: 0;
}
.yao.dong .bar {
  background: var(--c-zhusha);
}
.yao.dong .bar.yin {
  border-color: var(--c-zhusha);
}
.yao.dong .bar.yin::before,
.yao.dong .bar.yin::after {
  background: var(--c-zhusha);
}
.mark {
  color: var(--c-zhusha);
  font-weight: 700;
  font-size: 1.1rem;
}
.info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  color: var(--c-xuanzhi-dim);
}
.lq {
  color: var(--c-qingtong-bright);
}
</style>

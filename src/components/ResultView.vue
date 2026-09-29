<script setup lang="ts">
// 排盘结果：本卦 / 变卦 + 动爻朱砂红爻辞 + 六冲六合 / 空亡 / 日干支
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGuaStore } from '../store/gua';
import GuaBoard from './GuaBoard.vue';

const store = useGuaStore();
const { result, riGanZhi, monthBuild, question } = storeToRefs(store);

const benDong = computed(() =>
  (result.value?.yaos ?? [])
    .filter((y) => y.isDong)
    .map((y) => ({
      yaoTi: result.value!.benGua.lines[y.yao - 1]?.yaoTi ?? `第${y.yao}爻`,
      yaoCi: result.value!.benGua.lines[y.yao - 1]?.yaoCi ?? '',
      baihua: result.value!.benGua.lines[y.yao - 1]?.baihua ?? '',
    })),
);
</script>

<template>
  <section class="result" v-if="result">
    <p class="q" v-if="question">所占：<span class="seal">{{ question }}</span></p>

    <div class="boards">
      <GuaBoard :gua="result.benGua" :yaos="result.yaos" caption="本卦" />
      <GuaBoard
        v-if="result.bianGua && result.bianYaos"
        :gua="result.bianGua"
        :yaos="result.bianYaos"
        caption="变卦"
      />
    </div>

    <div class="facts">
      <span>日干支：<b class="seal">{{ riGanZhi }}</b></span>
      <span>月建：<b class="seal">{{ monthBuild }}</b>（节气·lunar-javascript）</span>
      <span>旬空：<b class="seal">{{ result.kongWang[0] }}{{ result.kongWang[1] }}</b></span>
      <span v-if="result.benGua.isLiuChong" class="badge chong">六冲卦</span>
      <span v-if="result.benGua.isLiuHe" class="badge he">六合卦</span>
    </div>

    <div v-if="benDong.length" class="dong">
      <h4 class="seal">动爻 · 爻辞</h4>
      <div v-for="(d, i) in benDong" :key="i" class="dong-item">
        <p class="dt seal">{{ d.yaoTi }}</p>
        <p class="dc">「{{ d.yaoCi }}」</p>
        <p v-if="d.baihua" class="db">{{ d.baihua }}</p>
        <p v-else class="db dim">（白话解析待补，可据《增删卜易》增录）</p>
      </div>
      <p class="note">
        仅示五行生克，不下吉凶断语：动爻生世为助、克世为阻；具体须结合用神、月建日辰旺衰、空亡冲合综合判断。
      </p>
    </div>

    <button class="btn-reset" @click="store.reset()">重起一卦</button>
  </section>
</template>

<style scoped>
.result {
  max-width: 880px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.q {
  text-align: center;
  font-size: 1.1rem;
  color: var(--c-xuanzhi-dim);
}
.boards {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
}
.facts {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
  color: var(--c-xuanzhi-dim);
  font-size: 0.9rem;
  border-top: 1px solid rgba(176, 141, 87, 0.25);
  border-bottom: 1px solid rgba(176, 141, 87, 0.25);
  padding: 0.7rem 0;
}
.facts b {
  color: var(--c-xuanzhi);
}
.badge {
  padding: 0.1rem 0.6rem;
  border-radius: 2px;
  border: 1px solid currentColor;
  font-size: 0.8rem;
}
.badge.chong {
  color: var(--c-zhusha);
}
.badge.he {
  color: var(--c-qingtong-bright);
}
.dong {
  background: rgba(200, 64, 47, 0.08);
  border: 1px solid rgba(200, 64, 47, 0.4);
  border-radius: 4px;
  padding: 1rem 1.4rem;
}
.dong h4 {
  margin: 0 0 0.6rem;
  letter-spacing: 0.3rem;
}
.dong-item {
  margin-bottom: 0.9rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px dashed rgba(200, 64, 47, 0.3);
}
.dt {
  font-size: 1.1rem;
  margin: 0;
}
.dc {
  font-size: 1.15rem;
  color: var(--c-xuanzhi);
  margin: 0.3rem 0;
}
.db {
  color: var(--c-xuanzhi-dim);
  margin: 0.2rem 0 0;
  font-size: 0.92rem;
}
.db.dim {
  font-style: italic;
}
.note {
  font-size: 0.82rem;
  color: var(--c-xuanzhi-dim);
  line-height: 1.6;
  margin: 0.6rem 0 0;
}
.btn-reset {
  align-self: center;
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

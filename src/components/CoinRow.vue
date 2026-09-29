<script setup lang="ts">
// 三枚虚拟铜钱（纯 CSS 翻转，零依赖）。1=背，0=字；以背为阳。
defineProps<{
  faces?: [number, number, number];
  spinning?: boolean;
}>();
</script>

<template>
  <div class="coins">
    <div
      v-for="(f, i) in (faces ?? [1, 1, 1])"
      :key="i"
      class="coin"
      :class="{ back: f === 1, spin: spinning }"
    >
      <div class="coin-inner">
        <div class="face front">字</div>
        <div class="face back">背</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coins {
  display: flex;
  gap: 1.4rem;
  justify-content: center;
  align-items: center;
}
.coin {
  width: 70px;
  height: 70px;
  perspective: 600px;
}
.coin-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0.1, 0.2, 1);
}
.coin.back .coin-inner {
  transform: rotateY(180deg);
}
.coin.spin .coin-inner {
  animation: flip 0.55s ease;
}
@keyframes flip {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
.face {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  font-size: 1.5rem;
  font-weight: 700;
  border: 2px solid var(--c-qingtong);
  background: radial-gradient(circle at 35% 30%, var(--c-qingtong-bright), #6f5630 75%);
  color: #2a1f10;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.45);
}
.face::after {
  /* 方孔 */
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: var(--c-xuan);
  border: 1px solid #3a2c14;
}
.face.back {
  transform: rotateY(180deg);
  background: radial-gradient(circle at 35% 30%, #d8b574, #8a6d3b 75%);
}
</style>

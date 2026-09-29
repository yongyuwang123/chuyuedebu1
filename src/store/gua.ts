// 起卦状态机（Pinia）
// 与算法库 src/core/liuyao.ts 解耦：本 store 只负责管理「摇第几爻 / 原始硬币 / 排盘结果」等 UI 状态。
import { defineStore } from 'pinia';
import { tossCoins, coinsToYao, getLiuYaoInfo } from '../core/liuyao';
import { getTrueSolarTime, getCalendarInfoAsync } from '../core/solar';
import { TEXTS } from '../core/texts';
import type { Yao, LiuYaoResult } from '../core/types';

export type Phase = 'idle' | 'casting' | 'done';

export const useGuaStore = defineStore('gua', {
  state: () => ({
    /** 所占之事 */
    question: '' as string,
    /** 阶段：未起 / 摇卦中 / 已成 */
    phase: 'idle' as Phase,
    /** 已摇出的爻数（0..6） */
    currentYao: 0 as number,
    /** 已摇出的六爻（初→上，yao 1..6） */
    yaos: [] as Yao[],
    /** 起卦地经度（默认 120 = 东八区兜底；设置可改） */
    longitude: 120 as number,
    /** 起卦日干支 */
    riGanZhi: '' as string,
    /** 起卦月建（节气精确，lunar-javascript；旺衰参考） */
    monthBuild: '' as string,
    /** 排盘结果 */
    result: null as LiuYaoResult | null,
    /** 当前旁白文案 */
    narration: TEXTS.idle as string,
  }),
  getters: {
    /** 是否已摇满六爻 */
    isComplete: (s) => s.currentYao >= 6,
    /** 动爻列表 */
    dongYaos: (s) => s.result?.yaos.filter((y) => y.isDong) ?? [],
    /** 是否有动爻 */
    hasDong: (s) => (s.result?.yaos ?? s.yaos).some((y) => y.isDong),
  },
  actions: {
    setQuestion(q: string) {
      this.question = q;
    },
    setLongitude(l: number) {
      this.longitude = l;
    },
    /** 摇一爻（不负责音频；音频由组件在点击瞬间触发，详见 audio.ts 防坑说明） */
    castOne(seedMs?: number) {
      if (this.phase === 'done' || this.currentYao >= 6) return;
      const { faces } = tossCoins(seedMs);
      const yao = coinsToYao(faces, this.currentYao + 1);
      this.yaos.push(yao);
      this.currentYao += 1;
      if (this.currentYao < 6) {
        this.phase = 'casting';
        this.narration = TEXTS.lines[this.currentYao - 1];
      }
    },
    /** 六爻既出 → 算真太阳时、取日干支与节气月建、排盘 */
    async finalize() {
      const solar = getTrueSolarTime(new Date(), this.longitude);
      const cal = await getCalendarInfoAsync(solar);
      this.riGanZhi = cal.riGanZhi;
      this.monthBuild = cal.monthBuild;
      this.result = getLiuYaoInfo(this.yaos, this.riGanZhi);
      this.phase = 'done';
      this.narration = TEXTS.done;
    },
    /** 重起 */
    reset() {
      this.question = '';
      this.phase = 'idle';
      this.currentYao = 0;
      this.yaos = [];
      this.riGanZhi = '';
      this.monthBuild = '';
      this.result = null;
      this.narration = TEXTS.idle;
    },
  },
});

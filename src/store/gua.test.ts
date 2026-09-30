import { setActivePinia, createPinia } from 'pinia';
import { beforeEach, describe, it, expect } from 'vitest';
import { useGuaStore } from './gua';

// 状态机测试：把"信任边界"从算法层延伸到 UI 状态层（起卦→排盘闭环）
describe('起卦状态机', () => {
  // 注意：必须用块体（返回 void），若写成 `() => setActivePinia(...)` 箭头直接返回 Pinia 实例，
  // 会在 vue-tsc 类型检查时报 TS2322（Pinia 不能赋给钩子回调的返回类型），进而导致 CI 构建失败。
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('摇满六爻后 isComplete，finalize 产出完整排盘与合法日干支', async () => {
    const s = useGuaStore();
    for (let i = 0; i < 6; i++) s.castOne(1000 + i * 7);
    expect(s.currentYao).toBe(6);
    expect(s.isComplete).toBe(true);

    await s.finalize();
    expect(s.phase).toBe('done');
    expect(s.result).toBeTruthy();
    expect(s.result!.benGua).toBeTruthy();
    expect(s.result!.yaos.length).toBe(6);
    // 日干支应为 天干+地支 两字（lunar-javascript 缺失时回退内置公式，仍合法）
    expect(s.riGanZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  });

  it('reset 回到初始态', () => {
    const s = useGuaStore();
    s.castOne(1);
    s.setQuestion('去不去平安财险');
    s.reset();
    expect(s.currentYao).toBe(0);
    expect(s.phase).toBe('idle');
    expect(s.question).toBe('');
    expect(s.yaos.length).toBe(0);
  });

  it('已成的卦不会被重复摇', () => {
    const s = useGuaStore();
    for (let i = 0; i < 6; i++) s.castOne(2000 + i);
    s.finalize();
    const before = s.currentYao;
    s.castOne(9999); // 应被忽略
    expect(s.currentYao).toBe(before);
  });
});

// 《观爻》核心排盘算法（纯函数库，与 UI 解耦）
// 数据源/规则见 README §4。信任边界：纳甲/世应/六亲实现须对照开源库断言（见 liuyao.test.ts）。
import type {
  Yao,
  YaoValue,
  YaoState,
  YinYang,
  Gua,
  LiuYaoResult,
  Dizhi,
  Wuxing,
  LiuQin,
} from './types';
import { GUAS } from '../data/guas';
import {
  NAJIA,
  DIZHI_WUXING,
  liuQinOf,
  liuShenStart,
  LIUSHEN_ORDER,
  kongWangOf,
} from './constants';

// —— 起卦（阶段二） ——

/** 三枚铜钱正反面 → 爻数值（以背为阳）。0背=老阴6、1背=少阳7、2背=少阴8、3背=老阳9 */
export function coinFacesToValue(faces: [number, number, number]): YaoValue {
  const backs = faces[0] + faces[1] + faces[2];
  return ([6, 7, 8, 9] as const)[backs];
}

export function valueToState(v: YaoValue): YaoState {
  return v === 6 ? 'laoyin' : v === 7 ? 'shaoyang' : v === 8 ? 'shaoyin' : 'laoyang';
}

export function valueToYinYang(v: YaoValue): YinYang {
  return v === 7 || v === 9 ? 'yang' : 'yin';
}

/** 由一次摇卦的硬币数组生成单爻（保留原始正反面供 UI 展示） */
export function coinsToYao(faces: [number, number, number], yao: number): Yao {
  const value = coinFacesToValue(faces);
  return {
    yao,
    value,
    state: valueToState(value),
    yinyang: valueToYinYang(value),
    isDong: value === 6 || value === 9,
    coins: faces,
  };
}

// 确定性 PRNG（把"机锋种子"映射到三枚硬币；非直接 Math.random 起卦）
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 摇一次卦：以 performance.now() 微秒级尾数为"机锋"种子，驱动 PRNG 决定三枚硬币正反面。
 * 返回原始正反面数组（1=背，0=字）与对应爻数值。
 */
export function tossCoins(seedMs?: number): { faces: [number, number, number]; value: YaoValue } {
  const now = seedMs ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const tail = Math.floor(now * 1000) % 1000000; // 微秒级尾数
  const rng = mulberry32((tail ^ 0x9e3779b9) >>> 0);
  const faces: [number, number, number] = [
    rng() < 0.5 ? 0 : 1,
    rng() < 0.5 ? 0 : 1,
    rng() < 0.5 ? 0 : 1,
  ];
  return { faces, value: coinFacesToValue(faces) };
}

/** 连续摇 6 次，从下往上生成初爻→上爻 */
export function castSixYao(seedMs?: number): Yao[] {
  const yaos: Yao[] = [];
  for (let i = 0; i < 6; i++) {
    const { faces } = tossCoins(seedMs);
    yaos.push(coinsToYao(faces, i + 1));
  }
  return yaos;
}

// —— 排盘（阶段三） ——

/** 由六爻阴阳序列（初→上，1=阳 0=阴）匹配卦 */
export function findGuaByPattern(pattern: string): Gua {
  const g = GUAS.find((x) => x.pattern === pattern);
  if (!g) throw new Error(`未找到匹配卦象：pattern=${pattern}`);
  return g;
}

/** 动爻翻转（老阴变阳、老阳变阴）得到变卦阴阳序列 */
export function bianPattern(yaos: Yao[]): string {
  return yaos
    .map((y) => (y.isDong ? (y.yinyang === 'yang' ? '0' : '1') : y.yinyang === 'yang' ? '1' : '0'))
    .join('');
}

/**
 * 给一组爻装配 纳甲地支 + 五行 + 六亲。
 * 关键：六亲一律以 palaceWuxing（本卦卦宫五行）为"我"判定（变卦六亲也用本卦宫，见 README §4.5）。
 */
export function assignNaJia(yaos: Yao[], gua: Gua, palaceWuxing: Wuxing): Yao[] {
  return yaos.map((y, i) => {
    const trigram = i < 3 ? gua.lower : gua.upper;
    const dizhi = NAJIA[trigram][i] as Dizhi;
    const wuxing = DIZHI_WUXING[dizhi];
    const liuqin = liuQinOf(wuxing, palaceWuxing) as LiuQin;
    return { ...y, dizhi, wuxing, liuqin };
  });
}

/** 安六神（按日干，从初爻起） */
export function assignLiuShen(yaos: Yao[], riGan: string): Yao[] {
  const start = liuShenStart(riGan);
  const base = LIUSHEN_ORDER.indexOf(start);
  return yaos.map((y, i) => ({ ...y, liushen: LIUSHEN_ORDER[(base + i) % 6] }));
}

/** 标注世爻/应爻 */
export function markShiYing(yaos: Yao[], gua: Gua): Yao[] {
  return yaos.map((y) => ({
    ...y,
    isShi: y.yao === gua.shiYao,
    isYing: y.yao === gua.yingYao,
  }));
}

/** 标注空亡（按日柱干支推算的旬空两字） */
export function markKongWang(yaos: Yao[], riGanZhi: string): Yao[] {
  const [a, b] = kongWangOf(riGanZhi);
  return yaos.map((y) => ({ ...y, isKongWang: y.dizhi === a || y.dizhi === b }));
}

/**
 * 排盘主函数：由六爻 + 日干支，返回完整结果（本卦/变卦/逐爻装配/空亡）。
 * 注：README 阶段三原签名 getLiuYaoInfo(benGua, riGanZhi)，此处以六爻为入口更贴合数据流，
 * 本卦由六爻阴阳匹配得出。变卦六亲按本卦卦宫（落实 README §4.5 易错点）。
 */
export function getLiuYaoInfo(yaos: Yao[], riGanZhi: string): LiuYaoResult {
  const riGan = riGanZhi[0];
  const benGua = findGuaByPattern(yaos.map((y) => (y.yinyang === 'yang' ? '1' : '0')).join(''));

  // 本卦逐爻装配（世应 → 纳甲/六亲 → 六神 → 空亡）
  let benYaos = markShiYing(yaos, benGua);
  benYaos = assignNaJia(benYaos, benGua, benGua.palaceWuxing);
  benYaos = assignLiuShen(benYaos, riGan);
  benYaos = markKongWang(benYaos, riGanZhi);

  const hasDong = yaos.some((y) => y.isDong);
  let bianGua: Gua | undefined;
  let bianYaos: Yao[] | undefined;
  if (hasDong) {
    bianGua = findGuaByPattern(bianPattern(yaos));
    // 关键：变卦六亲仍按【本卦卦宫】五行判定（README §4.5 易错点）
    let bian = markShiYing(cloneYaos(yaos), bianGua);
    bian = assignNaJia(bian, bianGua, benGua.palaceWuxing);
    bian = assignLiuShen(bian, riGan);
    bian = markKongWang(bian, riGanZhi);
    bianYaos = bian;
  }

  return {
    yaos: benYaos,
    benGua,
    bianGua,
    bianYaos,
    riGanZhi,
    kongWang: kongWangOf(riGanZhi),
  };
}

function cloneYaos(yaos: Yao[]): Yao[] {
  // 变卦的"爻"仍沿用本卦六爻的动静/阴阳作为载体，仅用于装配展示
  return yaos.map((y) => ({ ...y }));
}

/** 便捷：起卦 + 排盘一站式 */
export function castAndDivine(seedMs: number | undefined, riGanZhi: string): LiuYaoResult {
  return getLiuYaoInfo(castSixYao(seedMs), riGanZhi);
}

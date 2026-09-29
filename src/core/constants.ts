// 《观爻》规则常量（阶段一基础 + 阶段三前置）
// 所有口诀均来自《卜筮正宗》《增删卜易》，并在 README §4 标注。
import type {
  Trigram,
  Dizhi,
  Wuxing,
  LiuQin,
  LiuShen,
} from './types';

/** 八卦 → 五行 */
export const TRIGRAM_WUXING: Record<Trigram, Wuxing> = {
  乾: '金', 兑: '金', 离: '火', 震: '木',
  巽: '木', 坎: '水', 艮: '土', 坤: '土',
};

/** 八卦先天序号（乾1 兑2 离3 震4 巽5 坎6 艮7 坤8），用于生成卦符/组合 */
export const TRIGRAM_INDEX: Record<Trigram, number> = {
  乾: 1, 兑: 2, 离: 3, 震: 4, 巽: 5, 坎: 6, 艮: 7, 坤: 8,
};

/** 纳甲：每经卦 初→上 六地支（下卦=初/二/三，上卦=四/五/上） */
export const NAJIA: Record<Trigram, [Dizhi, Dizhi, Dizhi, Dizhi, Dizhi, Dizhi]> = {
  乾: ['子', '寅', '辰', '午', '申', '戌'],
  坤: ['未', '巳', '卯', '丑', '亥', '酉'],
  震: ['子', '寅', '辰', '午', '申', '戌'], // 同乾
  坎: ['寅', '辰', '午', '申', '戌', '子'],
  艮: ['辰', '午', '申', '戌', '子', '寅'],
  巽: ['丑', '亥', '酉', '未', '巳', '卯'],
  离: ['卯', '丑', '亥', '酉', '未', '巳'],
  兑: ['巳', '卯', '丑', '亥', '酉', '未'],
};

/** 地支 → 五行 */
export const DIZHI_WUXING: Record<Dizhi, Wuxing> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

/** 我生（子孙） */
const SHENG: Record<Wuxing, Wuxing> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
/** 我克（妻财） */
const KE: Record<Wuxing, Wuxing> = { 木: '土', 火: '金', 金: '木', 水: '火', 土: '水' };
/** 克我（官鬼） */
const KE_BY: Record<Wuxing, Wuxing> = { 木: '金', 火: '水', 金: '火', 水: '木', 土: '木' };

/** 六亲：以卦宫五行 palaceWuxing 为"我"，按纳支五行 wuxing 定 */
export function liuQinOf(wuxing: Wuxing, palaceWuxing: Wuxing): LiuQin {
  if (wuxing === palaceWuxing) return '兄弟';
  if (SHENG[palaceWuxing] === wuxing) return '子孙';
  if (KE[palaceWuxing] === wuxing) return '妻财';
  if (KE_BY[palaceWuxing] === wuxing) return '官鬼';
  return '父母'; // 生我
}

/** 六神起法（日干 → 初爻起神） */
const LIUSHEN_BY_GAN: Record<string, LiuShen> = {
  甲: '青龙', 乙: '青龙',
  丙: '朱雀', 丁: '朱雀',
  戊: '勾陈',
  己: '螣蛇',
  庚: '白虎', 辛: '白虎',
  壬: '玄武', 癸: '玄武',
};

export const LIUSHEN_ORDER: LiuShen[] = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];

/** 日干 → 初爻六神 */
export function liuShenStart(gan: string): LiuShen {
  return LIUSHEN_BY_GAN[gan] ?? '青龙';
}

/** 旬空表：以"旬首"干支查空亡两字 */
export const KONGWANG_BY_XUN: Record<string, [Dizhi, Dizhi]> = {
  甲子: ['戌', '亥'],
  甲戌: ['申', '酉'],
  甲申: ['午', '未'],
  甲午: ['辰', '巳'],
  甲辰: ['寅', '卯'],
  甲寅: ['子', '丑'],
};

/** 六十甲子（用于由日柱干支推算旬空） */
export const GANZHI_60: string[] = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
];

/** 由日柱干支推旬空两字 */
export function kongWangOf(riGanZhi: string): [Dizhi, Dizhi] {
  const idx = GANZHI_60.indexOf(riGanZhi);
  if (idx < 0) return ['戌', '亥'];
  const xunShou = GANZHI_60[Math.floor(idx / 10) * 10];
  return KONGWANG_BY_XUN[xunShou] ?? ['戌', '亥'];
}

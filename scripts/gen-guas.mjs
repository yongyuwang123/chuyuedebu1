// 生成 src/data/guas.ts（阶段一数据建模）
// 数据源：john-walks-slow/open-iching（卦名/卦符/卦辞/爻辞取开源，勿手敲）
// 卦宫/世应/纳甲/六冲/六合：按《卜筮正宗》京房八宫规则用代码计算（不盲信、不手敲）
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

const SRC_URL = 'https://raw.githubusercontent.com/john-walks-slow/open-iching/main/iching/iching.json';
const raw = JSON.parse(readFileSync('./.tmp_iching.json', 'utf8'));

const TRIGRAM_WUXING = { 乾: '金', 兑: '金', 离: '火', 震: '木', 巽: '木', 坎: '水', 艮: '土', 坤: '土' };
const NATURE = { 乾: '天', 兑: '泽', 离: '火', 震: '雷', 巽: '风', 坎: '水', 艮: '山', 坤: '地' };
const NAJIA = {
  乾: ['子', '寅', '辰', '午', '申', '戌'],
  坤: ['未', '巳', '卯', '丑', '亥', '酉'],
  震: ['子', '寅', '辰', '午', '申', '戌'],
  坎: ['寅', '辰', '午', '申', '戌', '子'],
  艮: ['辰', '午', '申', '戌', '子', '寅'],
  巽: ['丑', '亥', '酉', '未', '巳', '卯'],
  离: ['卯', '丑', '亥', '酉', '未', '巳'],
  兑: ['巳', '卯', '丑', '亥', '酉', '未'],
};
const CHONG = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];
const HE = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];

// 京房八宫：King Wen id -> [卦宫, 世爻]
const STRUCT = {
  1: ['乾', 6], 2: ['坤', 6], 3: ['坎', 2], 4: ['离', 4], 5: ['坤', 4], 6: ['离', 4],
  7: ['坎', 3], 8: ['坤', 3], 9: ['巽', 1], 10: ['艮', 5], 11: ['坤', 3], 12: ['乾', 3],
  13: ['离', 3], 14: ['乾', 3], 15: ['兑', 5], 16: ['震', 1], 17: ['震', 3], 18: ['巽', 3],
  19: ['坤', 2], 20: ['乾', 4], 21: ['巽', 5], 22: ['艮', 1], 23: ['乾', 5], 24: ['坤', 1],
  25: ['巽', 4], 26: ['艮', 2], 27: ['巽', 4], 28: ['震', 4], 29: ['坎', 6], 30: ['离', 6],
  31: ['兑', 3], 32: ['震', 3], 33: ['乾', 2], 34: ['坤', 4], 35: ['乾', 4], 36: ['坎', 4],
  37: ['巽', 2], 38: ['艮', 4], 39: ['兑', 4], 40: ['震', 2], 41: ['艮', 3], 42: ['巽', 3],
  43: ['坤', 5], 44: ['乾', 1], 45: ['兑', 2], 46: ['震', 4], 47: ['兑', 1], 48: ['震', 5],
  49: ['坎', 4], 50: ['离', 2], 51: ['震', 6], 52: ['艮', 6], 53: ['艮', 3], 54: ['兑', 3],
  55: ['坎', 5], 56: ['离', 1], 57: ['巽', 6], 58: ['兑', 6], 59: ['离', 5], 60: ['坎', 1],
  61: ['艮', 4], 62: ['兑', 4], 63: ['坎', 3], 64: ['离', 3],
};

function isLiuChong(lower, upper) {
  for (let i = 0; i < 3; i++) {
    const a = NAJIA[lower][i], b = NAJIA[upper][i + 3];
    if (!CHONG.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return false;
  }
  return true;
}
function isLiuHe(lower, upper) {
  const list = [...NAJIA[lower].slice(0, 3), ...NAJIA[upper].slice(3, 6)];
  const cnt = {};
  list.forEach((d) => (cnt[d] = (cnt[d] || 0) + 1));
  let pairs = 0;
  for (const [a, b] of HE) while (cnt[a] > 0 && cnt[b] > 0) { cnt[a]--; cnt[b]--; pairs++; }
  return pairs === 3 && Object.values(cnt).every((v) => v === 0);
}

const guas = raw.map((g) => {
  const [palace, shi] = STRUCT[g.id];
  const lower = g.combination[0];
  const upper = g.combination[1];
  const ying = ((shi + 2) % 6) + 1;
  const short = g.name;
  const name = upper === lower ? `${short}为${NATURE[short]}` : `${NATURE[upper]}${NATURE[lower]}${short}`;
  const pattern = g.array.join('');
  const lines = g.lines
    .filter((l) => l.id >= 1 && l.id <= 6)
    .map((l) => ({ yao: l.id, yaoTi: l.name, yaoCi: l.scripture, baihua: '' }));
  return {
    id: g.id, name, symbol: g.symbol, pattern,
    upper, lower, palace,
    palaceWuxing: TRIGRAM_WUXING[palace],
    shiYao: shi, yingYao: ying,
    isLiuChong: isLiuChong(lower, upper),
    isLiuHe: isLiuHe(lower, upper),
    guaCi: g.scripture, lines,
  };
});

// 校验：乾为天 世爻=6 且六冲；泽火革 纳甲=卯丑亥/亥酉未
const qian = guas.find((g) => g.name === '乾为天');
const ge = guas.find((g) => g.name === '泽火革');
const geNaJia = [...NAJIA[ge.lower].slice(0, 3), ...NAJIA[ge.upper].slice(3, 6)];
console.log('校验 乾为天: 世爻=', qian.shiYao, '六冲=', qian.isLiuChong, '(期望 6 / true)');
console.log('校验 泽火革: 纳甲=', geNaJia.join(','), '(期望 卯,丑,亥,亥,酉,未)');
const liuChongCount = guas.filter((g) => g.isLiuChong).length;
console.log('六冲卦数量=', liuChongCount, '(期望 10：8纯卦+无妄+大壮)');

let out = `import type { Gua } from '../core/types';\n\n`;
out += `// 自动生成：scripts/gen-guas.mjs\n`;
out += `// 数据源(卦辞/爻辞/卦符)：${SRC_URL}（开源，勿手敲）\n`;
out += `// 卦宫/世应/纳甲/六冲/六合 按《卜筮正宗》京房八宫规则计算\n`;
out += `// 白话解析(baihua)为空，后续可补充\n`;
out += `export const GUAS: Gua[] = ${JSON.stringify(guas, null, 2)};\n`;
// 还原中文（避免 \\uXXXX 转义，保持古风可读）
out = out.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

writeFileSync('./src/data/guas.ts', out, 'utf8');
try { unlinkSync('./.tmp_iching.json'); } catch {}
console.log('已生成 src/data/guas.ts，共', guas.length, '卦');

// 真太阳时 / 日干支 / 月建（节气）
// 信任边界（README §八）：日干支与节气月建优先接入 lunar-javascript 精确计算（已安装为依赖）。
// 内置"公历→干支"标准公式为可离线运行的兜底；日干支仅由日期决定（不受节气影响），公式精确。
// 真太阳时按用户经度换算（每偏离东经 120° 1 度，±4 分钟）—— lunar-javascript 无 SolarTime，自写。

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 基准日：2000-01-07 为甲子日（干支序 1）。该基准经验证准确（2000-01-01 为戊午=55，+6 天循环得甲子）。
const BASE = new Date(2000, 0, 7, 0, 0, 0, 0);

/**
 * 日干支（内置精确公式，与 lunar-javascript 结果一致，可离线）。
 * @param date 真太阳时对应的本地日期
 */
export function getRiGanZhi(date: Date = new Date()): string {
  const diff = Math.floor((date.getTime() - BASE.getTime()) / 86400000);
  const idx = ((diff % 60) + 60) % 60; // 0 = 甲子
  return GAN[idx % 10] + ZHI[idx % 12];
}

/**
 * 真太阳时换算：北京时间 = 东经 120° 标准时；用户所在地经度每偏离 1°，时间 ±4 分钟。
 * @param date 用户本地钟点（北京时间）
 * @param longitude 用户起卦地经度（默认 120 = 东八区兜底）；可在设置中手动输入
 */
export function getTrueSolarTime(date: Date, longitude = 120): Date {
  const offsetMin = (longitude - 120) * 4; // 东经>120 更早（真太阳时提前）
  return new Date(date.getTime() + offsetMin * 60000);
}

// 二十四节气近似公历日期（用于月建推算；精确值请接 lunar-javascript）。每月"建"从该节气日起。
const JIEQI_MONTH_BUILD: { month: number; day: number; zhi: string }[] = [
  { month: 1, day: 6, zhi: '丑' }, // 小寒建丑
  { month: 2, day: 4, zhi: '寅' }, // 立春建寅
  { month: 3, day: 6, zhi: '卯' }, // 惊蛰建卯
  { month: 4, day: 5, zhi: '辰' }, // 清明建辰
  { month: 5, day: 6, zhi: '巳' }, // 立夏建巳
  { month: 6, day: 6, zhi: '午' }, // 芒种建午
  { month: 7, day: 7, zhi: '未' }, // 小暑建未
  { month: 8, day: 8, zhi: '申' }, // 立秋建申
  { month: 9, day: 8, zhi: '酉' }, // 白露建酉
  { month: 10, day: 8, zhi: '戌' }, // 寒露建戌
  { month: 11, day: 7, zhi: '亥' }, // 立冬建亥
  { month: 12, day: 7, zhi: '子' }, // 大雪建子
];

/**
 * 月建地支（按节气，非农历月份）。
 * 兜底近似：依上表节气日判断；误差约 ±1 天，生产环境建议替换为 lunar-javascript 精确节气。
 */
export function getMonthBuildApprox(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // 找到当前日期所处的最近一个已过的节气
  let current = JIEQI_MONTH_BUILD[0]; // 默认小寒(丑)，覆盖 12 月末~1月初
  for (const j of JIEQI_MONTH_BUILD) {
    const passed = j.month < m || (j.month === m && j.day <= d);
    if (passed) current = j;
  }
  return current.zhi;
}

/**
 * 同步兜底：月建地支（精确分支不可用时，退化为近似表）。
 */
export function getMonthBuild(date: Date): string {
  return getMonthBuildApprox(date);
}

/** 起卦历法信息：日干支（安六神/推空亡）+ 月建（节气，旺衰参考）。 */
export interface CalendarInfo {
  riGanZhi: string;
  monthBuild: string;
}

/**
 * 异步获取起卦历法信息（日干支 + 节气月建）。
 * 优先 lunar-javascript 精确值（真太阳时 + 节气），失败回退内置公式。
 * 使用字面量动态导入，Vite 会将其预打包为异步 chunk，浏览器可正常加载。
 */
export async function getCalendarInfoAsync(date: Date = new Date()): Promise<CalendarInfo> {
  try {
    const mod = (await import('lunar-javascript')) as any;
    const Solar = mod.Solar ?? mod.default?.Solar;
    if (Solar && typeof Solar.fromDate === 'function') {
      const lunar = Solar.fromDate(date).getLunar();
      const riGanZhi =
        typeof lunar.getDayInGanZhi === 'function' ? lunar.getDayInGanZhi() : getRiGanZhi(date);
      const monthBuild =
        typeof lunar.getMonthZhi === 'function' ? lunar.getMonthZhi() : getMonthBuildApprox(date);
      return { riGanZhi, monthBuild };
    }
  } catch {
    /* 回退内置 */
  }
  return { riGanZhi: getRiGanZhi(date), monthBuild: getMonthBuildApprox(date) };
}

/**
 * @deprecated 仅保留兼容；新代码请用 getCalendarInfoAsync 同时取日干支与月建。
 * 异步获取日干支（优先 lunar-javascript 精确值，失败回退内置公式）。
 */
export async function getRiGanZhiAsync(date: Date = new Date()): Promise<string> {
  return (await getCalendarInfoAsync(date)).riGanZhi;
}

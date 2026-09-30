// lunar-javascript 没有官方 TypeScript 类型声明（npm 上无对应 @types 包）。
// 若不加声明，strict 模式下 `import('lunar-javascript')` 会报 TS7016（模块隐式 any）而中断构建。
// 此处仅按"本项目实际调用到的 API"给出最小声明；将来用到更多 API 时在这里补签名即可。
declare module 'lunar-javascript' {
  /** 农历对象（仅声明本项目用到的成员） */
  export interface Lunar {
    /** 日干支，如「甲子」 */
    getDayInGanZhi(): string;
    /** 月建地支，如「寅」（按节气） */
    getMonthZhi(): string;
  }

  /** 公历对象 */
  export interface SolarInstance {
    /** 转为农历对象 */
    getLunar(): Lunar;
  }

  /** 公历静态入口 */
  export const Solar: {
    /** 由 JS Date 构造公历对象 */
    fromDate(date: Date): SolarInstance;
  };

  const lunarJs: { Solar: typeof Solar };
  export default lunarJs;
}

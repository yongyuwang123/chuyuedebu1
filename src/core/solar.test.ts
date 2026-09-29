import { describe, it, expect } from 'vitest';
import {
  getRiGanZhi,
  getMonthBuildApprox,
  getCalendarInfoAsync,
} from './solar';

describe('内置公式（离线兜底，不受节气影响）', () => {
  it('2000-01-07 为甲子日', () => {
    expect(getRiGanZhi(new Date(2000, 0, 7))).toBe('甲子');
  });
  it('2026-09-29 为丙午日（与 lunar-javascript 一致）', () => {
    expect(getRiGanZhi(new Date(2026, 8, 29))).toBe('丙午');
  });
  it('近似月建：1月中旬=丑、2月中旬=寅、9月中旬=酉', () => {
    expect(getMonthBuildApprox(new Date(2026, 0, 15))).toBe('丑');
    expect(getMonthBuildApprox(new Date(2026, 1, 15))).toBe('寅');
    expect(getMonthBuildApprox(new Date(2026, 8, 15))).toBe('酉');
  });
});

describe('lunar-javascript 精确历法（信任边界）', () => {
  it('节气月建：1月=丑、2月=寅、3月=卯、9月=酉', async () => {
    expect((await getCalendarInfoAsync(new Date(2026, 0, 15))).monthBuild).toBe('丑');
    expect((await getCalendarInfoAsync(new Date(2026, 1, 15))).monthBuild).toBe('寅');
    expect((await getCalendarInfoAsync(new Date(2026, 2, 15))).monthBuild).toBe('卯');
    expect((await getCalendarInfoAsync(new Date(2026, 8, 15))).monthBuild).toBe('酉');
  });
  it('日干支与内置公式一致：2000-01-07=甲子', async () => {
    expect((await getCalendarInfoAsync(new Date(2000, 0, 7))).riGanZhi).toBe('甲子');
  });
  it('返回结构含 riGanZhi 与 monthBuild', async () => {
    const info = await getCalendarInfoAsync(new Date(2026, 8, 29));
    expect(info.riGanZhi).toBe('丙午');
    expect(info.monthBuild).toBe('酉');
  });
});

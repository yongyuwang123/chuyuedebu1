import { describe, it, expect } from 'vitest';
import {
  coinFacesToValue,
  findGuaByPattern,
  getLiuYaoInfo,
  assignNaJia,
} from './liuyao';
import { kongWangOf } from '../core/constants';
import { GUAS } from '../data/guas';
import type { Yao } from './types';

// 由阴阳序列构造"静爻"六爻（yang→7少阳，yin→8少阴），用于排盘断言
function yaosFromPattern(pattern: string): Yao[] {
  return pattern.split('').map((c, i) => {
    const yinyang = c === '1' ? 'yang' : 'yin';
    const value = yinyang === 'yang' ? 7 : 8;
    return {
      yao: i + 1,
      yinyang,
      value: value as Yao['value'],
      state: yinyang === 'yang' ? 'shaoyang' : 'shaoyin',
      isDong: false,
    };
  });
}

describe('起卦：硬币映射防呆', () => {
  it('背数 → 数值：0背老阴6、1背少阳7、2背少阴8、3背老阳9', () => {
    expect(coinFacesToValue([0, 0, 0])).toBe(6);
    expect(coinFacesToValue([1, 0, 0])).toBe(7);
    expect(coinFacesToValue([1, 1, 0])).toBe(8);
    expect(coinFacesToValue([1, 1, 1])).toBe(9);
  });
});

describe('卦宫与世应（京房八宫）', () => {
  it('乾为天（111111）世爻在第6爻（上爻），且为六冲', () => {
    const g = findGuaByPattern('111111');
    expect(g.name).toBe('乾为天');
    expect(g.shiYao).toBe(6);
    expect(g.yingYao).toBe(3);
    expect(g.isLiuChong).toBe(true);
    expect(g.isLiuHe).toBe(false);
  });

  it('坤为地（000000）世爻6、六冲', () => {
    const g = findGuaByPattern('000000');
    expect(g.shiYao).toBe(6);
    expect(g.isLiuChong).toBe(true);
  });

  it('地天泰（111000）世爻3、六合', () => {
    const g = findGuaByPattern('111000'); // 下乾(111)上坤(000) → 初→上 111000
    expect(g.name).toBe('地天泰');
    expect(g.shiYao).toBe(3);
    expect(g.isLiuHe).toBe(true);
  });

  it('全部 64 卦均可唯一匹配', () => {
    expect(GUAS).toHaveLength(64);
    for (const g of GUAS) expect(findGuaByPattern(g.pattern).id).toBe(g.id);
  });
});

describe('纳甲（装地支）', () => {
  it('泽火革（上兑下离 101110）纳甲地支 = 卯、丑、亥、亥、酉、未', () => {
    const g = findGuaByPattern('101110');
    expect(g.name).toBe('泽火革');
    const yaos = assignNaJia(yaosFromPattern('101110'), g, g.palaceWuxing);
    expect(yaos.map((y) => y.dizhi)).toEqual(['卯', '丑', '亥', '亥', '酉', '未']);
  });

  it('乾为天 纳甲 = 子、寅、辰、午、申、戌', () => {
    const g = findGuaByPattern('111111');
    const yaos = assignNaJia(yaosFromPattern('111111'), g, g.palaceWuxing);
    expect(yaos.map((y) => y.dizhi)).toEqual(['子', '寅', '辰', '午', '申', '戌']);
  });
});

describe('六亲（按本卦卦宫五行）', () => {
  it('乾宫属金：子水→子孙、寅木→妻财、辰土→父母、午火→官鬼、申金→兄弟、戌土→父母', () => {
    const g = findGuaByPattern('111111'); // 乾宫金
    const yaos = assignNaJia(yaosFromPattern('111111'), g, g.palaceWuxing);
    expect(yaos.map((y) => y.liuqin)).toEqual(['子孙', '妻财', '父母', '官鬼', '兄弟', '父母']);
  });
});

describe('旬空（空亡）', () => {
  it('甲子旬戌亥空', () => {
    expect(kongWangOf('甲子')).toEqual(['戌', '亥']);
  });
  it('甲子日 乾为天 上爻(戌)为空亡', () => {
    const res = getLiuYaoInfo(yaosFromPattern('111111'), '甲子');
    expect(res.yaos[5].isKongWang).toBe(true); // 上爻 戌
    expect(res.yaos[0].isKongWang).toBe(false); // 初爻 子
  });
});

describe('六神（按日干）', () => {
  it('甲日初爻起青龙，依次朱雀/勾陈…', () => {
    const res = getLiuYaoInfo(yaosFromPattern('111111'), '甲子');
    expect(res.yaos[0].liushen).toBe('青龙');
    expect(res.yaos[1].liushen).toBe('朱雀');
    expect(res.yaos[2].liushen).toBe('勾陈');
  });
});

describe('变卦与"变卦六亲按本卦宫"易错点', () => {
  it('乾上爻动（老阳）→ 变卦泽天夬（坤宫）；变爻六亲仍按本卦乾宫金（子水→子孙，而非夬之坤宫土之妻财）', () => {
    const yaos: Yao[] = yaosFromPattern('111111').map((y, i) =>
      i === 5 ? { ...y, value: 9, state: 'laoyang', yinyang: 'yang', isDong: true } : y,
    );
    const res = getLiuYaoInfo(yaos, '甲子');
    expect(res.bianGua?.name).toBe('泽天夬');
    // 变卦初爻 子(水)，按【本卦乾宫金】→ 我生 → 子孙（若误按变卦夬之坤宫土则应为妻财）
    expect(res.bianYaos?.[0].liuqin).toBe('子孙');
  });
});

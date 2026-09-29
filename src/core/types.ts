// 《观爻》核心数据类型（阶段一：数据建模）
// 设计约束（来自 README）：
//  - 爻位 yao 用 1..6（初爻=1，上爻=6）；数组下标 0..5（0=初爻）。
//    所有下标访问必须 `yao - 1`，杜绝 off-by-one。

/** 阴阳 */
export type YinYang = 'yang' | 'yin';

/** 动静属性（四营） */
export type YaoState = 'laoyang' | 'laoyin' | 'shaoyang' | 'shaoyin';
//  laoyang=老阳(变)  laoyin=老阴(变)  shaoyang=少阳(静)  shaoyin=少阴(静)

/** 爻的数值：6=老阴 7=少阳 8=少阴 9=老阳（以背为阳约定） */
export type YaoValue = 6 | 7 | 8 | 9;

/** 五行 */
export type Wuxing = '金' | '木' | '水' | '火' | '土';

/** 六亲（以卦宫五行为"我"） */
export type LiuQin = '父母' | '兄弟' | '子孙' | '妻财' | '官鬼';

/** 六神（六兽，按日干） */
export type LiuShen = '青龙' | '朱雀' | '勾陈' | '螣蛇' | '白虎' | '玄武';

/** 八经卦 */
export type Trigram = '乾' | '兑' | '离' | '震' | '巽' | '坎' | '艮' | '坤';

/** 十二地支 */
export type Dizhi =
  | '子' | '丑' | '寅' | '卯' | '辰' | '巳'
  | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 单爻（排盘后的完整信息） */
export interface Yao {
  /** 爻位 1..6（初=1，上=6） */
  yao: number;
  yinyang: YinYang;
  state: YaoState;
  value: YaoValue;
  /** 是否动爻（6/9 为动） */
  isDong: boolean;
  /** 起卦时三枚铜钱的正反面（1=背，0=字），下标 0..2；仅起卦阶段保留 */
  coins?: [number, number, number];
  // —— 以下为排盘后装配（阶段三填充） ——
  dizhi?: Dizhi;
  wuxing?: Wuxing;
  liuqin?: LiuQin;
  liushen?: LiuShen;
  isKongWang?: boolean;
  isShi?: boolean;
  isYing?: boolean;
}

/** 爻辞条目 */
export interface YaoCi {
  /** 爻位 1..6 */
  yao: number;
  /** 爻题，如 "初九"、"六二" */
  yaoTi: string;
  /** 爻辞原文 */
  yaoCi: string;
  /** 白话解析 */
  baihua: string;
}

/** 卦（本卦 / 变卦） */
export interface Gua {
  /** 京房八宫序号 1..64 */
  id: number;
  /** 卦名，如 "乾"、"泽火革" */
  name: string;
  /** 卦符，如 "☰" */
  symbol: string;
  /** 六爻阴阳序列（初→上，1=阳 0=阴），用于匹配本卦/变卦 */
  pattern: string;
  /** 上卦（外卦） */
  upper: Trigram;
  /** 下卦（内卦） */
  lower: Trigram;
  /** 所属卦宫（八纯卦之一） */
  palace: Trigram;
  /** 卦宫五行 */
  palaceWuxing: Wuxing;
  /** 世爻位置 1..6 */
  shiYao: number;
  /** 应爻位置 1..6（= 世爻 + 3，循环 1..6） */
  yingYao: number;
  /** 是否六冲卦 */
  isLiuChong: boolean;
  /** 是否六合卦 */
  isLiuHe: boolean;
  /** 卦辞 */
  guaCi: string;
  /** 六爻爻辞（初→上） */
  lines: YaoCi[];
}

/** 一次起卦的完整排盘结果 */
export interface LiuYaoResult {
  /** 六爻（初→上），含排盘装配字段 */
  yaos: Yao[];
  /** 本卦 */
  benGua: Gua;
  /** 变卦（无动爻时为 undefined） */
  bianGua?: Gua;
  /** 变卦逐爻装配（六亲按本卦卦宫，无动爻时为 undefined） */
  bianYaos?: Yao[];
  /** 起卦日干支，如 "甲子" */
  riGanZhi: string;
  /** 旬空两字 */
  kongWang: [Dizhi, Dizhi];
}

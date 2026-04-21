export type PassiveKind =
  | "might"
  | "armor"
  | "hollow-heart"
  | "pummarola"
  | "spinach"
  | "candelabrador"
  | "bracer"
  | "empty-bottle"
  | "wings"
  | "magnet";

export interface PassiveDef {
  kind: PassiveKind;
  name: string;
  icon: string;
  description: (lvl: number) => string;
  maxLevel: number;
  apply: (lvl: number, stats: PlayerStatMods) => void;
}

export interface PlayerStatMods {
  damageMul: number;
  armor: number;
  hpMul: number;
  regen: number;
  areaMul: number;
  projectileMul: number;
  cooldownMul: number;
  moveMul: number;
  pickupRadiusMul: number;
  attackSpeedMul: number;
}

export const PASSIVES: Record<PassiveKind, PassiveDef> = {
  might: {
    kind: "might",
    name: "완력",
    icon: "💪",
    description: (l) => `공격력 +${l * 5}%`,
    maxLevel: 5,
    apply: (l, s) => (s.damageMul *= 1 + l * 0.05),
  },
  armor: {
    kind: "armor",
    name: "갑옷",
    icon: "🛡️",
    description: (l) => `받는 데미지 -${l * 1}`,
    maxLevel: 5,
    apply: (l, s) => (s.armor += l),
  },
  "hollow-heart": {
    kind: "hollow-heart",
    name: "텅 빈 심장",
    icon: "❤️",
    description: (l) => `최대 체력 +${l * 20}%`,
    maxLevel: 5,
    apply: (l, s) => (s.hpMul *= 1 + l * 0.2),
  },
  pummarola: {
    kind: "pummarola",
    name: "토마토",
    icon: "🍅",
    description: (l) => `체력 재생 +${l * 0.3}/초`,
    maxLevel: 5,
    apply: (l, s) => (s.regen += l * 0.3),
  },
  spinach: {
    kind: "spinach",
    name: "시금치",
    icon: "🥬",
    description: (l) => `공격력 +${l * 10}%`,
    maxLevel: 5,
    apply: (l, s) => (s.damageMul *= 1 + l * 0.1),
  },
  candelabrador: {
    kind: "candelabrador",
    name: "촛대",
    icon: "🕯️",
    description: (l) => `공격 범위 +${l * 10}%`,
    maxLevel: 5,
    apply: (l, s) => (s.areaMul *= 1 + l * 0.1),
  },
  bracer: {
    kind: "bracer",
    name: "사수 장갑",
    icon: "🏹",
    description: (l) => `투사체 속도 +${l * 10}%`,
    maxLevel: 5,
    apply: (l, s) => (s.projectileMul *= 1 + l * 0.1),
  },
  "empty-bottle": {
    kind: "empty-bottle",
    name: "빈 병",
    icon: "🧪",
    description: (l) => `쿨다운 -${l * 6}%`,
    maxLevel: 5,
    apply: (l, s) => (s.cooldownMul *= 1 - l * 0.06),
  },
  wings: {
    kind: "wings",
    name: "날개",
    icon: "🪽",
    description: (l) => `이동속도 +${l * 10}%`,
    maxLevel: 5,
    apply: (l, s) => (s.moveMul *= 1 + l * 0.1),
  },
  magnet: {
    kind: "magnet",
    name: "자석",
    icon: "🧲",
    description: (l) => `획득 범위 +${l * 20}%`,
    maxLevel: 5,
    apply: (l, s) => (s.pickupRadiusMul *= 1 + l * 0.2),
  },
};

export type WeaponKind =
  | "dagger"
  | "magic"
  | "axe"
  | "whip"
  | "bible"
  | "dagger-evo"
  | "magic-evo"
  | "bible-evo";

export interface WeaponDef {
  kind: WeaponKind;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  sprite: string;
  baseDamage: number;
  baseCooldownMs: number;
  baseSpeed: number;
  baseLifetimeMs: number;
  baseCount: number;
  piercing: number;
  behavior:
    | "shoot-nearest"
    | "orbit"
    | "flame-sideways"
    | "rain"
    | "circle-burst";
  evolvesInto?: WeaponKind;
  evolveRequires?: { passive: string; passiveLevel: number; weaponLevel: number };
  perLevel?: (level: number) => Partial<{
    damage: number;
    count: number;
    cooldownMul: number;
    lifetimeMs: number;
    piercing: number;
  }>;
}

export const WEAPONS: Record<WeaponKind, WeaponDef> = {
  dagger: {
    kind: "dagger",
    name: "단검 투척",
    icon: "🗡️",
    description: "가장 가까운 적에게 단검을 투척",
    maxLevel: 8,
    sprite: "proj-dagger",
    baseDamage: 10,
    baseCooldownMs: 900,
    baseSpeed: 280,
    baseLifetimeMs: 900,
    baseCount: 1,
    piercing: 1,
    behavior: "shoot-nearest",
    evolvesInto: "dagger-evo",
    evolveRequires: { passive: "might", passiveLevel: 3, weaponLevel: 8 },
    perLevel: (lvl) => ({
      damage: 4 + lvl * 2,
      count: lvl >= 3 ? 2 : 1,
      piercing: lvl >= 5 ? 2 : 1,
    }),
  },
  "dagger-evo": {
    kind: "dagger-evo",
    name: "천개의 단검",
    icon: "⚔️",
    description: "단검이 대량으로 쏟아짐",
    maxLevel: 1,
    sprite: "proj-dagger",
    baseDamage: 25,
    baseCooldownMs: 500,
    baseSpeed: 340,
    baseLifetimeMs: 900,
    baseCount: 5,
    piercing: 3,
    behavior: "shoot-nearest",
  },
  magic: {
    kind: "magic",
    name: "마법 미사일",
    icon: "🔮",
    description: "자동 추적 마법 탄환",
    maxLevel: 8,
    sprite: "proj-magic",
    baseDamage: 12,
    baseCooldownMs: 1200,
    baseSpeed: 220,
    baseLifetimeMs: 1400,
    baseCount: 1,
    piercing: 1,
    behavior: "shoot-nearest",
    evolvesInto: "magic-evo",
    evolveRequires: { passive: "empty-bottle", passiveLevel: 3, weaponLevel: 8 },
    perLevel: (lvl) => ({
      damage: 6 + lvl * 2,
      count: lvl >= 4 ? 2 : 1,
    }),
  },
  "magic-evo": {
    kind: "magic-evo",
    name: "카오스 볼",
    icon: "🌀",
    description: "거대한 마법 구체가 다수 관통",
    maxLevel: 1,
    sprite: "proj-magic",
    baseDamage: 35,
    baseCooldownMs: 700,
    baseSpeed: 240,
    baseLifetimeMs: 2000,
    baseCount: 3,
    piercing: 6,
    behavior: "shoot-nearest",
  },
  axe: {
    kind: "axe",
    name: "도끼",
    icon: "🪓",
    description: "위로 던져 포물선을 그리며 떨어짐",
    maxLevel: 6,
    sprite: "proj-axe",
    baseDamage: 20,
    baseCooldownMs: 1800,
    baseSpeed: 260,
    baseLifetimeMs: 1600,
    baseCount: 1,
    piercing: 5,
    behavior: "rain",
    perLevel: (lvl) => ({
      damage: 10 + lvl * 3,
      count: 1 + Math.floor(lvl / 2),
    }),
  },
  whip: {
    kind: "whip",
    name: "채찍",
    icon: "➰",
    description: "양 옆으로 채찍을 휘두름",
    maxLevel: 6,
    sprite: "proj-whip",
    baseDamage: 15,
    baseCooldownMs: 1100,
    baseSpeed: 0,
    baseLifetimeMs: 180,
    baseCount: 1,
    piercing: 99,
    behavior: "flame-sideways",
    perLevel: (lvl) => ({
      damage: 6 + lvl * 3,
      count: 1 + Math.floor(lvl / 2),
    }),
  },
  bible: {
    kind: "bible",
    name: "성경",
    icon: "📖",
    description: "주위를 회전하는 성스러운 책",
    maxLevel: 6,
    sprite: "proj-bible",
    baseDamage: 8,
    baseCooldownMs: 3500,
    baseSpeed: 0,
    baseLifetimeMs: 2800,
    baseCount: 1,
    piercing: 99,
    behavior: "orbit",
    evolvesInto: "bible-evo",
    evolveRequires: { passive: "spinach", passiveLevel: 3, weaponLevel: 6 },
    perLevel: (lvl) => ({
      damage: 3 + lvl * 2,
      count: 1 + Math.floor(lvl / 2),
      lifetimeMs: 2800 + lvl * 300,
    }),
  },
  "bible-evo": {
    kind: "bible-evo",
    name: "영원의 경전",
    icon: "📚",
    description: "성경이 영원히 회전",
    maxLevel: 1,
    sprite: "proj-bible",
    baseDamage: 18,
    baseCooldownMs: 0,
    baseSpeed: 0,
    baseLifetimeMs: 99999,
    baseCount: 4,
    piercing: 99,
    behavior: "orbit",
  },
};

export function weaponStats(kind: WeaponKind, level: number) {
  const def = WEAPONS[kind];
  const per = def.perLevel ? def.perLevel(level) : {};
  return {
    damage: per.damage ?? def.baseDamage + level * 3,
    count: per.count ?? def.baseCount,
    cooldownMs: def.baseCooldownMs * (per.cooldownMul ?? 1),
    lifetimeMs: per.lifetimeMs ?? def.baseLifetimeMs,
    piercing: per.piercing ?? def.piercing,
  };
}

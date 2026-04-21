export type EnemyKind = "zombie" | "bat" | "tank" | "boss";

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  sprite: string;
  baseHp: number;
  speed: number;
  damage: number;
  xpDrop: number;
  isBoss?: boolean;
  size: { w: number; h: number };
}

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  zombie: {
    kind: "zombie",
    name: "좀비",
    sprite: "enemy-zombie",
    baseHp: 20,
    speed: 50,
    damage: 6,
    xpDrop: 1,
    size: { w: 14, h: 14 },
  },
  bat: {
    kind: "bat",
    name: "박쥐",
    sprite: "enemy-bat",
    baseHp: 10,
    speed: 95,
    damage: 4,
    xpDrop: 1,
    size: { w: 16, h: 10 },
  },
  tank: {
    kind: "tank",
    name: "해골 기사",
    sprite: "enemy-tank",
    baseHp: 80,
    speed: 35,
    damage: 12,
    xpDrop: 4,
    size: { w: 16, h: 16 },
  },
  boss: {
    kind: "boss",
    name: "보스",
    sprite: "boss",
    baseHp: 800,
    speed: 55,
    damage: 20,
    xpDrop: 30,
    isBoss: true,
    size: { w: 32, h: 32 },
  },
};

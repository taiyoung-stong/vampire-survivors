export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 4000;

export const TILE = 16;

export const PLAYER_BASE = {
  hp: 100,
  speed: 140,
  pickupRadius: 60,
  attackSpeedMul: 1.0,
  damageMul: 1.0,
  projectileMul: 1.0,
  regen: 0, // HP per second
  moveMul: 1.0,
  armor: 0,
};

export const XP_CURVE = (level: number) => Math.floor(5 + level * 4 + level * level * 0.6);

export const TICK_MS = 16;

export const COLORS = {
  bg: 0x1a1a2e,
  grass: 0x2a3f2a,
  grassAlt: 0x324a32,
  player: 0xfce4a6,
  enemy: 0xd94a4a,
  enemyFast: 0xe94f88,
  enemyTank: 0x7b3fa5,
  boss: 0xc0392b,
  projectile: 0xffffaa,
  projectileMagic: 0x88c8ff,
  xp: 0x66ddff,
  xpBig: 0xff66ff,
  coin: 0xffd24d,
  hpBar: 0xff5555,
  xpBar: 0x6ad9ff,
  uiDark: 0x0f0f1a,
  uiLight: 0xf4f4f4,
};

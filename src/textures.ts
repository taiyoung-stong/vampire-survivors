import Phaser from "phaser";

// Pixel sprite as a 2D string grid. "." = transparent; chars map to palette indices.
export interface SpriteDef {
  palette: string[]; // index 0..9 then a..z
  pattern: string[];
  scale?: number;
}

function paletteIndex(ch: string): number {
  const code = ch.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48; // 0-9
  if (code >= 97 && code <= 122) return 10 + (code - 97); // a-z
  return -1;
}

export function registerPixelSprite(
  scene: Phaser.Scene,
  key: string,
  def: SpriteDef,
): void {
  const scale = def.scale ?? 1;
  const w = def.pattern[0].length * scale;
  const h = def.pattern.length * scale;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  for (let y = 0; y < def.pattern.length; y++) {
    const row = def.pattern[y];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === "." || c === " ") continue;
      const idx = paletteIndex(c);
      if (idx < 0 || idx >= def.palette.length) continue;
      ctx.fillStyle = def.palette[idx];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  scene.textures.addCanvas(key, canvas);
}

// 16x16 sprites. Palette indices as hex colors.

export const SPRITE_PLAYER: SpriteDef = {
  palette: [
    "#2a1a0a", // 0 outline
    "#fce4a6", // 1 skin
    "#c07845", // 2 hair
    "#3a3a78", // 3 clothes
    "#6060a8", // 4 clothes light
    "#e0c070", // 5 accent
    "#000000", // 6 eyes
  ],
  pattern: [
    "................",
    "......02220.....",
    ".....0222220....",
    ".....02111120...",
    ".....02161610...",
    ".....01111110...",
    ".....01111110...",
    "....0033333300..",
    "...03334444300..",
    "...03344444300..",
    "...03344444300..",
    "...00334443300..",
    "....0033330000..",
    ".....011110.....",
    ".....0.0.0......",
    "................",
  ],
};

export const SPRITE_ENEMY_ZOMBIE: SpriteDef = {
  palette: [
    "#1a0505", // 0 outline
    "#c95c3e", // 1 body
    "#7a1f1f", // 2 dark body
    "#f2c28e", // 3 skin
    "#000000", // 4 eyes
  ],
  pattern: [
    "................",
    ".....00000......",
    "....0333330.....",
    "....0343430.....",
    "....0333330.....",
    "...0033333000...",
    "..0011111111110.",
    "..0112112111210.",
    "..0111211121110.",
    "..0221112111220.",
    "..0022112211220.",
    "....0011110.....",
    "....01100110....",
    "....01100110....",
    "....00000000....",
    "................",
  ],
};

export const SPRITE_ENEMY_BAT: SpriteDef = {
  palette: [
    "#000000",
    "#683aa0",
    "#9454d0",
    "#f2c02e",
  ],
  pattern: [
    "................",
    ".0......0.......",
    "00..0000.00.....",
    "0112012211210...",
    "012211111122120.",
    "011111321311110.",
    ".01111313111110.",
    "..011111111110..",
    "...01111111100..",
    "....00111100....",
    "......0110......",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
};

export const SPRITE_ENEMY_TANK: SpriteDef = {
  palette: [
    "#140a2a",
    "#4a2c8a",
    "#7b3fa5",
    "#a266d9",
    "#ffe4a0",
  ],
  pattern: [
    "................",
    "....00000000....",
    "...0222222220...",
    "...02111111120..",
    "...02144441120..",
    "...02141141120..",
    "...02111111120..",
    ".000211111120000",
    ".033211222112330",
    ".033321111113330",
    ".033322222223330",
    ".033300000003330",
    "..033.....0030..",
    "..030......030..",
    "..000......000..",
    "................",
  ],
};

export const SPRITE_BOSS: SpriteDef = {
  palette: [
    "#000",
    "#c0392b",
    "#e74c3c",
    "#f39c12",
    "#2c1a05",
    "#fff"
  ],
  pattern: [
    "................",
    "..000......000..",
    ".0220......0220.",
    "0221100000022210",
    "02211111111122210",
    "02111111111112210",
    "02111555555112210",
    "02115444444511210",
    "02115455554511210",
    "02115455554511210",
    "02115444444511210",
    "02215555555511210",
    "02221111111122210",
    "00222222222222200",
    ".0.02222222220.0.",
    "....00000000....",
  ],
  scale: 2,
};

export const SPRITE_PROJECTILE_DAGGER: SpriteDef = {
  palette: ["#000", "#ffffff", "#ffff99", "#999"],
  pattern: [
    "...0....",
    "..012...",
    ".01112..",
    "011112.",
    "011120.",
    ".0112..",
    "..012..",
    "...0...",
  ],
};

export const SPRITE_PROJECTILE_MAGIC: SpriteDef = {
  palette: ["#000", "#6fd0ff", "#b3ecff", "#0f60a0"],
  pattern: [
    "...00...",
    "..0220..",
    ".012210.",
    "01221220",
    "01222210",
    "01121210",
    ".012220.",
    "..0000..",
  ],
};

export const SPRITE_PROJECTILE_AXE: SpriteDef = {
  palette: ["#000", "#cccccc", "#f5d76e", "#966b3c"],
  pattern: [
    "......0...",
    ".000..03..",
    ".011100330",
    "011111033.",
    "011111103.",
    "011111110.",
    ".01111110.",
    "..011110..",
    "...000....",
    "..........",
  ],
};

export const SPRITE_PROJECTILE_WHIP: SpriteDef = {
  palette: ["#000", "#ffffaa", "#ffdd88"],
  pattern: [
    "0000000000000000",
    "0112112112112110",
    "0122122122122120",
    "0112112112112110",
    "0000000000000000",
  ],
};

export const SPRITE_PROJECTILE_BIBLE: SpriteDef = {
  palette: ["#000", "#ffe58a", "#d4a017", "#f6f6f6"],
  pattern: [
    "................",
    "....00000000....",
    "...0333333330...",
    "..033311113300..",
    "..033122221300..",
    "..033122221300..",
    "..033122221300..",
    "..033122221300..",
    "..033122221300..",
    "..033111211300..",
    "..033322223300..",
    "..033333333300..",
    "...00000000300..",
    ".....022200.....",
    "....00000.......",
    "................",
  ],
};

export const SPRITE_XP_GEM: SpriteDef = {
  palette: ["#000", "#66ddff", "#bff0ff", "#2e8ebf"],
  pattern: [
    "....0000....",
    "...022110...",
    "..02211220..",
    ".0221111220.",
    "022122112220",
    "022221122220",
    "022112211220",
    ".0221111220.",
    "..02211220..",
    "...022110...",
    "....0000....",
    "............",
  ],
};

export const SPRITE_XP_GEM_BIG: SpriteDef = {
  palette: ["#000", "#ff99ff", "#ffccff", "#bf40bf"],
  pattern: [
    ".....0000.....",
    "....022110....",
    "...02211220...",
    "..0221111220..",
    ".022122112220.",
    "02222222222220",
    "02211122211220",
    "02221111112220",
    ".022112211220.",
    "..0221111220..",
    "...02211220...",
    "....022110....",
    ".....0000.....",
    "..............",
  ],
};

export const SPRITE_COIN: SpriteDef = {
  palette: ["#000", "#ffd24d", "#fff1b8", "#b8841c"],
  pattern: [
    "...0000....",
    "..022330...",
    ".02111330..",
    ".0211113320",
    ".02111133320",
    ".02111113320",
    ".02111113320",
    ".02111113320",
    ".0211113320.",
    "..02333330..",
    "...0000.....",
    "............",
  ],
};

export const SPRITE_HEART: SpriteDef = {
  palette: ["#000", "#e74c3c", "#ff8c8c", "#8a1a1a"],
  pattern: [
    "..00...00...",
    ".0220.0220..",
    "0221203221.0",
    "0211113322.0",
    "0211111332.0",
    "0211111133.0",
    ".021111132..",
    "..0211132...",
    "...02133....",
    "....022.....",
    ".....0......",
    "............",
  ],
};

export function registerAllSprites(scene: Phaser.Scene) {
  const list: Array<[string, SpriteDef]> = [
    ["player", SPRITE_PLAYER],
    ["enemy-zombie", SPRITE_ENEMY_ZOMBIE],
    ["enemy-bat", SPRITE_ENEMY_BAT],
    ["enemy-tank", SPRITE_ENEMY_TANK],
    ["boss", SPRITE_BOSS],
    ["proj-dagger", SPRITE_PROJECTILE_DAGGER],
    ["proj-magic", SPRITE_PROJECTILE_MAGIC],
    ["proj-axe", SPRITE_PROJECTILE_AXE],
    ["proj-whip", SPRITE_PROJECTILE_WHIP],
    ["proj-bible", SPRITE_PROJECTILE_BIBLE],
    ["xp-gem", SPRITE_XP_GEM],
    ["xp-gem-big", SPRITE_XP_GEM_BIG],
    ["coin", SPRITE_COIN],
    ["heart", SPRITE_HEART],
  ];
  for (const [key, def] of list) {
    registerPixelSprite(scene, key, def);
  }
}

const KEY = "vampire-meta-v1";

export interface MetaSave {
  coins: number;
  upgrades: Record<string, number>;
  best: {
    timeMs: number;
    kills: number;
    level: number;
  };
}

export interface MetaUpgrade {
  key: string;
  name: string;
  icon: string;
  description: (lvl: number) => string;
  maxLevel: number;
  cost: (lvl: number) => number;
}

export const META_UPGRADES: MetaUpgrade[] = [
  {
    key: "meta-might",
    name: "영구 완력",
    icon: "💪",
    description: (l) => `공격력 시작치 +${l * 5}%`,
    maxLevel: 10,
    cost: (l) => 10 + l * 10,
  },
  {
    key: "meta-hp",
    name: "영구 체력",
    icon: "❤️",
    description: (l) => `최대 체력 +${l * 10}`,
    maxLevel: 10,
    cost: (l) => 10 + l * 10,
  },
  {
    key: "meta-speed",
    name: "영구 속도",
    icon: "🪽",
    description: (l) => `이동속도 +${l * 3}%`,
    maxLevel: 5,
    cost: (l) => 15 + l * 15,
  },
  {
    key: "meta-magnet",
    name: "영구 자석",
    icon: "🧲",
    description: (l) => `획득 범위 +${l * 10}%`,
    maxLevel: 5,
    cost: (l) => 15 + l * 15,
  },
  {
    key: "meta-regen",
    name: "영구 재생",
    icon: "🍃",
    description: (l) => `체력 재생 +${(l * 0.2).toFixed(1)}/초`,
    maxLevel: 5,
    cost: (l) => 20 + l * 20,
  },
  {
    key: "meta-reroll",
    name: "업그레이드 리롤",
    icon: "🎲",
    description: (l) => `레벨업 시 리롤 ${l}회 (라운드당)`,
    maxLevel: 3,
    cost: (l) => 30 + l * 25,
  },
];

const DEFAULT_SAVE: MetaSave = {
  coins: 0,
  upgrades: {},
  best: { timeMs: 0, kills: 0, level: 0 },
};

export function loadMeta(): MetaSave {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SAVE, ...parsed };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function saveMeta(m: MetaSave): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    // ignore
  }
}

export function addCoins(n: number): MetaSave {
  const m = loadMeta();
  m.coins += n;
  saveMeta(m);
  return m;
}

export function upgradeMeta(key: string): MetaSave | null {
  const m = loadMeta();
  const def = META_UPGRADES.find((u) => u.key === key);
  if (!def) return null;
  const lvl = m.upgrades[key] ?? 0;
  if (lvl >= def.maxLevel) return null;
  const cost = def.cost(lvl);
  if (m.coins < cost) return null;
  m.coins -= cost;
  m.upgrades[key] = lvl + 1;
  saveMeta(m);
  return m;
}

export function updateBest(best: MetaSave["best"]): MetaSave {
  const m = loadMeta();
  m.best = {
    timeMs: Math.max(m.best.timeMs, best.timeMs),
    kills: Math.max(m.best.kills, best.kills),
    level: Math.max(m.best.level, best.level),
  };
  saveMeta(m);
  return m;
}

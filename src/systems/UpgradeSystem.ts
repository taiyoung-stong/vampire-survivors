import { WEAPONS, type WeaponKind } from "../data/weapons";
import { PASSIVES, type PassiveKind } from "../data/passives";
import type { Player } from "../entities/Player";

export type UpgradeChoice =
  | {
      kind: "weapon";
      weapon: WeaponKind;
      nextLevel: number;
      name: string;
      icon: string;
      description: string;
    }
  | {
      kind: "passive";
      passive: PassiveKind;
      nextLevel: number;
      name: string;
      icon: string;
      description: string;
    }
  | {
      kind: "evolve";
      newWeapon: WeaponKind;
      from: WeaponKind;
      requires: PassiveKind;
      name: string;
      icon: string;
      description: string;
    }
  | {
      kind: "heal";
      amount: number;
      name: string;
      icon: string;
      description: string;
    };

const MAX_WEAPON_SLOTS = 6;
const MAX_PASSIVE_SLOTS = 6;

export function rollUpgrades(player: Player, count = 4): UpgradeChoice[] {
  const pool: UpgradeChoice[] = [];

  // Evolutions (priority)
  for (const [kindStr, level] of player.weapons) {
    const kind = kindStr as WeaponKind;
    const def = WEAPONS[kind];
    if (!def || !def.evolvesInto || !def.evolveRequires) continue;
    if (level < def.evolveRequires.weaponLevel) continue;
    const passLvl = player.passives.get(def.evolveRequires.passive as PassiveKind) ?? 0;
    if (passLvl < def.evolveRequires.passiveLevel) continue;
    if (player.weapons.has(def.evolvesInto)) continue;
    const evoDef = WEAPONS[def.evolvesInto];
    pool.push({
      kind: "evolve",
      newWeapon: def.evolvesInto,
      from: kind,
      requires: def.evolveRequires.passive as PassiveKind,
      name: `진화! ${evoDef.name}`,
      icon: evoDef.icon,
      description: evoDef.description,
    });
  }

  // Weapons: upgrades for owned or new if slots available
  const ownedWeapons = Array.from(player.weapons.keys()) as WeaponKind[];
  for (const kind of ownedWeapons) {
    const def = WEAPONS[kind];
    const lvl = player.weapons.get(kind) ?? 0;
    if (lvl >= def.maxLevel) continue;
    if (def.kind.endsWith("-evo")) continue;
    pool.push({
      kind: "weapon",
      weapon: kind,
      nextLevel: lvl + 1,
      name: `${def.name} Lv.${lvl + 1}`,
      icon: def.icon,
      description: def.description,
    });
  }

  if (ownedWeapons.length < MAX_WEAPON_SLOTS) {
    for (const kind of Object.keys(WEAPONS) as WeaponKind[]) {
      if (WEAPONS[kind].kind.endsWith("-evo")) continue;
      if (player.weapons.has(kind)) continue;
      pool.push({
        kind: "weapon",
        weapon: kind,
        nextLevel: 1,
        name: `${WEAPONS[kind].name} NEW`,
        icon: WEAPONS[kind].icon,
        description: WEAPONS[kind].description,
      });
    }
  }

  // Passives: upgrades for owned or new
  const ownedPassives = Array.from(player.passives.keys());
  for (const kind of ownedPassives) {
    const def = PASSIVES[kind];
    const lvl = player.passives.get(kind) ?? 0;
    if (lvl >= def.maxLevel) continue;
    pool.push({
      kind: "passive",
      passive: kind,
      nextLevel: lvl + 1,
      name: `${def.name} Lv.${lvl + 1}`,
      icon: def.icon,
      description: def.description(lvl + 1),
    });
  }

  if (ownedPassives.length < MAX_PASSIVE_SLOTS) {
    for (const kind of Object.keys(PASSIVES) as PassiveKind[]) {
      if (player.passives.has(kind)) continue;
      const def = PASSIVES[kind];
      pool.push({
        kind: "passive",
        passive: kind,
        nextLevel: 1,
        name: `${def.name} NEW`,
        icon: def.icon,
        description: def.description(1),
      });
    }
  }

  pool.push({
    kind: "heal",
    amount: 30,
    name: "체력 회복",
    icon: "❤️‍🩹",
    description: "체력을 30 회복",
  });

  // Shuffle and pick
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function applyUpgrade(player: Player, choice: UpgradeChoice): void {
  switch (choice.kind) {
    case "weapon":
      player.addWeapon(choice.weapon);
      break;
    case "passive":
      player.addPassive(choice.passive);
      break;
    case "evolve": {
      // Remove base weapon, add evolved
      player.weapons.delete(choice.from);
      player.weapons.set(choice.newWeapon, 1);
      break;
    }
    case "heal":
      player.heal(choice.amount);
      break;
  }
}

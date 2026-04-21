import Phaser from "phaser";
import { Projectile } from "../entities/Projectile";
import type { Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import { WEAPONS, weaponStats, type WeaponKind } from "../data/weapons";

interface OrbitState {
  projectile: Projectile;
  angle: number;
  radius: number;
}

export class WeaponSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private group: Phaser.Physics.Arcade.Group;
  private cooldowns = new Map<WeaponKind, number>();
  private orbits = new Map<WeaponKind, OrbitState[]>();

  constructor(
    scene: Phaser.Scene,
    player: Player,
    group: Phaser.Physics.Arcade.Group,
  ) {
    this.scene = scene;
    this.player = player;
    this.group = group;
  }

  public update(time: number, delta: number, enemies: Enemy[]): void {
    const weapons = this.player.weapons;
    for (const [kindStr, level] of weapons) {
      const kind = kindStr as WeaponKind;
      const def = WEAPONS[kind];
      if (!def) continue;
      const next = this.cooldowns.get(kind) ?? 0;
      const stats = weaponStats(kind, level);
      const cd = stats.cooldownMs * this.player.stats.cooldownMul;
      if (def.behavior === "orbit") {
        this.updateOrbit(kind, level, stats, time, delta);
        continue;
      }
      if (time < next) continue;
      this.cooldowns.set(kind, time + cd);
      this.fire(kind, level, stats, enemies);
    }
  }

  private fire(
    kind: WeaponKind,
    _level: number,
    stats: ReturnType<typeof weaponStats>,
    enemies: Enemy[],
  ): void {
    const def = WEAPONS[kind];
    const count = stats.count;
    const dmg = stats.damage * this.player.stats.damageMul;
    const pSpeed = (def.baseSpeed || 220) * this.player.stats.projectileMul;
    const size = this.player.stats.areaMul;

    if (def.behavior === "flame-sideways") {
      for (let i = 0; i < count; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        const p = new Projectile(
          this.scene,
          this.player.x + dir * 30,
          this.player.y,
          def.sprite,
          dmg,
          stats.piercing,
          stats.lifetimeMs,
        );
        p.setScale(2 * size, 1 * size);
        p.setFlipX(dir < 0);
        p.setVelocity(0, 0);
        this.group.add(p);
      }
      return;
    }

    if (def.behavior === "rain") {
      for (let i = 0; i < count; i++) {
        const angle = Phaser.Math.FloatBetween(-Math.PI / 3, Math.PI / 3) - Math.PI / 2;
        const vx = Math.cos(angle) * pSpeed * 0.4;
        const vy = Math.sin(angle) * pSpeed;
        const p = new Projectile(
          this.scene,
          this.player.x,
          this.player.y - 20,
          def.sprite,
          dmg,
          stats.piercing,
          stats.lifetimeMs,
        );
        p.setScale(size);
        p.setVelocity(vx, vy);
        p.setAngularVelocity(720);
        this.group.add(p);
      }
      return;
    }

    const nearest = this.findNearestEnemies(enemies, count);
    for (let i = 0; i < count; i++) {
      const target = nearest[i] ?? nearest[0];
      const dx = target ? target.x - this.player.x : 1;
      const dy = target ? target.y - this.player.y : 0;
      const dist = Math.hypot(dx, dy) || 1;
      const seek = kind === "magic" || kind === "magic-evo";
      const p = new Projectile(
        this.scene,
        this.player.x,
        this.player.y,
        def.sprite,
        dmg,
        stats.piercing,
        stats.lifetimeMs,
        seek,
      );
      p.homingStrength = seek ? 4 : 0;
      p.setScale(size);
      p.setVelocity((dx / dist) * pSpeed, (dy / dist) * pSpeed);
      p.setRotation(Math.atan2(dy, dx));
      this.group.add(p);
    }
  }

  private updateOrbit(
    kind: WeaponKind,
    _level: number,
    stats: ReturnType<typeof weaponStats>,
    time: number,
    delta: number,
  ): void {
    const def = WEAPONS[kind];
    const size = this.player.stats.areaMul;
    let state = this.orbits.get(kind);

    const cd = stats.cooldownMs * this.player.stats.cooldownMul;
    const next = this.cooldowns.get(kind) ?? 0;

    // Spawn new orbit set when cooldown ready and set is empty
    const needsSpawn =
      (!state || state.length === 0) && (time >= next || def.kind === "bible-evo");

    if (needsSpawn) {
      state = [];
      const radius = 60 * size;
      const dmg = stats.damage * this.player.stats.damageMul;
      for (let i = 0; i < stats.count; i++) {
        const angle = (i / stats.count) * Math.PI * 2;
        const p = new Projectile(
          this.scene,
          this.player.x,
          this.player.y,
          def.sprite,
          dmg,
          stats.piercing,
          stats.lifetimeMs,
        );
        p.setScale(size);
        this.group.add(p);
        state.push({ projectile: p, angle, radius });
      }
      this.orbits.set(kind, state);
      this.cooldowns.set(kind, time + cd);
      // Kill orbits after lifetime (unless evolved)
      if (def.kind !== "bible-evo") {
        this.scene.time.delayedCall(stats.lifetimeMs, () => {
          const now = this.orbits.get(kind);
          if (!now) return;
          for (const o of now) if (o.projectile.active) o.projectile.kill();
          this.orbits.set(kind, []);
        });
      }
    }

    if (!state || state.length === 0) return;
    const rotSpeed = 2.5; // rad/sec
    for (const o of state) {
      o.angle += (rotSpeed * delta) / 1000;
      if (!o.projectile.active) continue;
      o.projectile.x = this.player.x + Math.cos(o.angle) * o.radius;
      o.projectile.y = this.player.y + Math.sin(o.angle) * o.radius;
      o.projectile.setRotation(o.angle + Math.PI / 2);
      // Evolved bible: stay forever — reset expiry
      if (kind === "bible-evo") o.projectile.expiresAt = time + 5000;
    }
    // Cleanup dead ones
    state = state.filter((o) => o.projectile.active);
    this.orbits.set(kind, state);
  }

  private findNearestEnemies(enemies: Enemy[], count: number): Enemy[] {
    if (enemies.length === 0) return [];
    const sorted = [...enemies]
      .filter((e) => e.active)
      .sort((a, b) => {
        const da = (a.x - this.player.x) ** 2 + (a.y - this.player.y) ** 2;
        const db = (b.x - this.player.x) ** 2 + (b.y - this.player.y) ** 2;
        return da - db;
      });
    return sorted.slice(0, count);
  }

  public updateProjectiles(time: number, delta: number, enemies: Enemy[]): void {
    const children = this.group.getChildren();
    for (const child of children) {
      const p = child as Projectile;
      if (!p.alive || !p.active) continue;
      if (time > p.expiresAt) {
        p.kill();
        continue;
      }
      if (p.seekTarget && p.homingStrength > 0 && enemies.length > 0) {
        const nearest = this.nearestEnemy(p, enemies);
        if (nearest) {
          const body = p.body as Phaser.Physics.Arcade.Body;
          const dx = nearest.x - p.x;
          const dy = nearest.y - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          const curSpeed = Math.hypot(body.velocity.x, body.velocity.y);
          const homing = (p.homingStrength * delta) / 1000;
          body.velocity.x += ((dx / dist) * curSpeed - body.velocity.x) * homing;
          body.velocity.y += ((dy / dist) * curSpeed - body.velocity.y) * homing;
          p.setRotation(Math.atan2(body.velocity.y, body.velocity.x));
        }
      }
    }
  }

  private nearestEnemy(p: Projectile, enemies: Enemy[]): Enemy | null {
    let best: Enemy | null = null;
    let bestD = Infinity;
    for (const e of enemies) {
      if (!e.active) continue;
      const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }
}

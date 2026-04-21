import Phaser from "phaser";
import { ENEMIES, type EnemyKind } from "../data/enemies";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public kind: EnemyKind;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public damage: number;
  public xpDrop: number;
  public isBoss: boolean;
  private hitCooldowns = new Map<number, number>(); // projectileId -> last hit time
  public dealContactAt = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    kind: EnemyKind,
    difficultyMul: number,
  ) {
    const def = ENEMIES[kind];
    super(scene, x, y, def.sprite);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.kind = kind;
    this.maxHp = Math.ceil(def.baseHp * difficultyMul);
    this.hp = this.maxHp;
    this.speed = def.speed;
    this.damage = def.damage;
    this.xpDrop = def.xpDrop;
    this.isBoss = !!def.isBoss;
    this.setSize(def.size.w, def.size.h);
    this.setDepth(5);
  }

  public moveToward(px: number, py: number): void {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / dist) * this.speed, (dy / dist) * this.speed);
    this.setFlipX(dx < 0);
  }

  public takeDamage(amount: number, now: number, projectileId?: number): boolean {
    if (projectileId !== undefined) {
      const last = this.hitCooldowns.get(projectileId) ?? 0;
      if (now - last < 200) return false;
      this.hitCooldowns.set(projectileId, now);
    }
    this.hp -= amount;
    void now;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.active) this.clearTint();
    });
    return this.hp <= 0;
  }

  public knockback(dx: number, dy: number, force: number): void {
    const len = Math.hypot(dx, dy) || 1;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.velocity.x += (dx / len) * force;
    body.velocity.y += (dy / len) * force;
  }
}

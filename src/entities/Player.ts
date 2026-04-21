import Phaser from "phaser";
import { PLAYER_BASE } from "../config";
import { PASSIVES, type PassiveKind, type PlayerStatMods } from "../data/passives";
import { loadMeta } from "../systems/MetaStore";

export class Player extends Phaser.Physics.Arcade.Sprite {
  public hp: number;
  public maxHp: number;
  public speed: number;
  public xp = 0;
  public level = 1;
  public kills = 0;
  public coinsEarned = 0;
  public pickupRadius: number;
  public stats: PlayerStatMods;

  public weapons: Map<string, number> = new Map(); // kind -> level
  public passives: Map<PassiveKind, number> = new Map();
  private iframesUntil = 0;
  private regenAcc = 0;
  private facingLeft = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setSize(12, 14).setOffset(2, 2);

    this.stats = this.computeBaseStats();

    this.maxHp = PLAYER_BASE.hp * this.stats.hpMul;
    this.hp = this.maxHp;
    this.speed = PLAYER_BASE.speed * this.stats.moveMul;
    this.pickupRadius = PLAYER_BASE.pickupRadius * this.stats.pickupRadiusMul;

    this.setDepth(10);
  }

  private computeBaseStats(): PlayerStatMods {
    const base: PlayerStatMods = {
      damageMul: 1.0,
      armor: 0,
      hpMul: 1.0,
      regen: 0,
      areaMul: 1.0,
      projectileMul: 1.0,
      cooldownMul: 1.0,
      moveMul: 1.0,
      pickupRadiusMul: 1.0,
      attackSpeedMul: 1.0,
    };
    // meta upgrades
    const meta = loadMeta();
    const mUp = meta.upgrades;
    const lMight = mUp["meta-might"] ?? 0;
    if (lMight) base.damageMul *= 1 + lMight * 0.05;
    const lHp = mUp["meta-hp"] ?? 0;
    if (lHp) base.hpMul *= 1 + (lHp * 10) / 100;
    const lSpeed = mUp["meta-speed"] ?? 0;
    if (lSpeed) base.moveMul *= 1 + lSpeed * 0.03;
    const lMagnet = mUp["meta-magnet"] ?? 0;
    if (lMagnet) base.pickupRadiusMul *= 1 + lMagnet * 0.1;
    const lRegen = mUp["meta-regen"] ?? 0;
    if (lRegen) base.regen += lRegen * 0.2;
    return base;
  }

  public recomputeStats(): void {
    const base = this.computeBaseStats();
    for (const [kind, lvl] of this.passives) {
      PASSIVES[kind].apply(lvl, base);
    }
    this.stats = base;
    const newMax = PLAYER_BASE.hp * base.hpMul;
    const hpPct = this.hp / this.maxHp;
    this.maxHp = newMax;
    this.hp = Math.min(this.maxHp, this.hp);
    this.speed = PLAYER_BASE.speed * base.moveMul;
    this.pickupRadius = PLAYER_BASE.pickupRadius * base.pickupRadiusMul;
    if (hpPct < 0.2) this.hp = Math.min(this.maxHp, this.hp + 5); // tiny heal on levelup
  }

  public takeDamage(raw: number, now: number): boolean {
    if (now < this.iframesUntil) return false;
    const dmg = Math.max(1, raw - this.stats.armor);
    this.hp -= dmg;
    this.iframesUntil = now + 450;
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 100,
      repeat: 2,
    });
    return true;
  }

  public heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  public gainXp(amount: number): boolean {
    this.xp += amount;
    return this.checkLevel();
  }

  private checkLevel(): boolean {
    let leveled = false;
    for (;;) {
      const need = this.xpForNext();
      if (this.xp < need) break;
      this.xp -= need;
      this.level += 1;
      leveled = true;
    }
    if (leveled) this.recomputeStats();
    return leveled;
  }

  public xpForNext(): number {
    return Math.floor(5 + this.level * 4 + this.level * this.level * 0.6);
  }

  public tick(delta: number): void {
    if (this.stats.regen > 0 && this.hp < this.maxHp) {
      this.regenAcc += delta;
      if (this.regenAcc >= 1000) {
        const whole = Math.floor(this.regenAcc / 1000);
        this.regenAcc -= whole * 1000;
        this.heal(whole * this.stats.regen);
      }
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      if (body.velocity.x < -5) this.facingLeft = true;
      else if (body.velocity.x > 5) this.facingLeft = false;
      this.setFlipX(this.facingLeft);
    }
  }

  public addWeapon(kind: string): void {
    const cur = this.weapons.get(kind) ?? 0;
    this.weapons.set(kind, cur + 1);
  }

  public addPassive(kind: PassiveKind): void {
    const cur = this.passives.get(kind) ?? 0;
    this.passives.set(kind, cur + 1);
    this.recomputeStats();
  }
}

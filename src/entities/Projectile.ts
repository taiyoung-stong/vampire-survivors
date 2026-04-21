import Phaser from "phaser";

let nextId = 1;

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public projId: number;
  public damage: number;
  public piercing: number;
  public expiresAt: number;
  public seekTarget: boolean;
  public rotationSpeed = 0;
  public homingStrength = 0;
  public alive = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    damage: number,
    piercing: number,
    lifetimeMs: number,
    seek = false,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.projId = nextId++;
    this.damage = damage;
    this.piercing = piercing;
    this.expiresAt = scene.time.now + lifetimeMs;
    this.seekTarget = seek;
    this.setDepth(8);
    this.setSize(8, 8);
  }

  public hit(): boolean {
    this.piercing -= 1;
    return this.piercing <= 0;
  }

  public kill(): void {
    this.alive = false;
    this.destroy();
  }
}

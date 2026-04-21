import Phaser from "phaser";

export class XPGem extends Phaser.Physics.Arcade.Sprite {
  public value: number;
  public magnetized = false;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number, big = false) {
    super(scene, x, y, big ? "xp-gem-big" : "xp-gem");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.value = value;
    this.setSize(10, 10);
    this.setDepth(3);
  }

  public seek(px: number, py: number, delta: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 400;
    const step = (speed * delta) / 1000;
    if (dist < 8) return true;
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    return false;
  }
}

export class Coin extends Phaser.Physics.Arcade.Sprite {
  public value: number;
  constructor(scene: Phaser.Scene, x: number, y: number, value = 1) {
    super(scene, x, y, "coin");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.value = value;
    this.setSize(10, 10);
    this.setDepth(3);
  }
  public seek(px: number, py: number, delta: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 360;
    const step = (speed * delta) / 1000;
    if (dist < 8) return true;
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    return false;
  }
}

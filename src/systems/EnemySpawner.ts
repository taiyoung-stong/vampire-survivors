import Phaser from "phaser";
import { Enemy } from "../entities/Enemy";
import { ENEMIES, type EnemyKind } from "../data/enemies";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";

export class EnemySpawner {
  private scene: Phaser.Scene;
  private group: Phaser.Physics.Arcade.Group;
  private playerFn: () => { x: number; y: number };
  private timeStart: number;
  private nextBossMs = 180000; // 3 minutes
  private spawnAccumulator = 0;

  constructor(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.Group,
    playerFn: () => { x: number; y: number },
  ) {
    this.scene = scene;
    this.group = group;
    this.playerFn = playerFn;
    this.timeStart = scene.time.now;
  }

  public update(time: number, delta: number): void {
    const elapsed = time - this.timeStart;
    const rate = this.spawnRatePerSec(elapsed);
    this.spawnAccumulator += (delta / 1000) * rate;
    while (this.spawnAccumulator >= 1) {
      this.spawnAccumulator -= 1;
      this.spawn(elapsed);
    }

    if (elapsed >= this.nextBossMs) {
      this.nextBossMs += 180000;
      this.spawnBoss(elapsed);
    }
  }

  public difficultyMul(elapsedMs: number): number {
    return 1 + Math.min(6, elapsedMs / 60000);
  }

  private spawnRatePerSec(elapsedMs: number): number {
    return 2 + Math.min(15, elapsedMs / 20000);
  }

  private spawn(elapsedMs: number): void {
    const mul = this.difficultyMul(elapsedMs);
    const pool: EnemyKind[] = ["zombie"];
    if (elapsedMs > 30000) pool.push("bat");
    if (elapsedMs > 60000) pool.push("bat");
    if (elapsedMs > 90000) pool.push("tank");
    if (elapsedMs > 180000) pool.push("tank", "bat");
    const kind = pool[Math.floor(Math.random() * pool.length)];
    const pos = this.pickOffscreenSpawn();
    const e = new Enemy(this.scene, pos.x, pos.y, kind, mul);
    this.group.add(e);
  }

  private spawnBoss(elapsedMs: number): void {
    const mul = this.difficultyMul(elapsedMs) * 1.5;
    const pos = this.pickOffscreenSpawn(120);
    const e = new Enemy(this.scene, pos.x, pos.y, "boss", mul);
    e.setScale(1.0); // boss sprite already 32x32
    this.group.add(e);
  }

  private pickOffscreenSpawn(margin = 40): { x: number; y: number } {
    const p = this.playerFn();
    const camHalfW = GAME_WIDTH / 2 + margin;
    const camHalfH = GAME_HEIGHT / 2 + margin;
    const side = Math.floor(Math.random() * 4);
    let x = p.x;
    let y = p.y;
    if (side === 0) {
      x = p.x - camHalfW;
      y = p.y + Phaser.Math.Between(-camHalfH, camHalfH);
    } else if (side === 1) {
      x = p.x + camHalfW;
      y = p.y + Phaser.Math.Between(-camHalfH, camHalfH);
    } else if (side === 2) {
      y = p.y - camHalfH;
      x = p.x + Phaser.Math.Between(-camHalfW, camHalfW);
    } else {
      y = p.y + camHalfH;
      x = p.x + Phaser.Math.Between(-camHalfW, camHalfW);
    }
    return { x, y };
  }
}

export { ENEMIES };

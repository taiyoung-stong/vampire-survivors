import Phaser from "phaser";
import { WORLD_WIDTH, WORLD_HEIGHT, TILE, COLORS } from "../config";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { XPGem, Coin } from "../entities/XPGem";
import { Projectile } from "../entities/Projectile";
import { WeaponSystem } from "../systems/WeaponSystem";
import { EnemySpawner } from "../systems/EnemySpawner";
import { addCoins, updateBest } from "../systems/MetaStore";

export class GameScene extends Phaser.Scene {
  player!: Player;
  keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    UP: Phaser.Input.Keyboard.Key;
    DOWN: Phaser.Input.Keyboard.Key;
    LEFT: Phaser.Input.Keyboard.Key;
    RIGHT: Phaser.Input.Keyboard.Key;
  };
  enemyGroup!: Phaser.Physics.Arcade.Group;
  projectileGroup!: Phaser.Physics.Arcade.Group;
  gemGroup!: Phaser.Physics.Arcade.Group;
  coinGroup!: Phaser.Physics.Arcade.Group;
  weaponSystem!: WeaponSystem;
  spawner!: EnemySpawner;
  elapsedMs = 0;
  levelingUp = false;
  gameOver = false;

  constructor() {
    super("Game");
  }

  create(): void {
    this.elapsedMs = 0;
    this.gameOver = false;
    this.levelingUp = false;

    this.drawBackground();

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.player.addWeapon("dagger");
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    const keyboard = this.input.keyboard!;
    this.keys = {
      W: keyboard.addKey("W"),
      A: keyboard.addKey("A"),
      S: keyboard.addKey("S"),
      D: keyboard.addKey("D"),
      UP: keyboard.addKey("UP"),
      DOWN: keyboard.addKey("DOWN"),
      LEFT: keyboard.addKey("LEFT"),
      RIGHT: keyboard.addKey("RIGHT"),
    };

    this.enemyGroup = this.physics.add.group({ runChildUpdate: false });
    this.projectileGroup = this.physics.add.group({ runChildUpdate: false });
    this.gemGroup = this.physics.add.group({ runChildUpdate: false });
    this.coinGroup = this.physics.add.group({ runChildUpdate: false });

    this.weaponSystem = new WeaponSystem(this, this.player, this.projectileGroup);
    this.spawner = new EnemySpawner(this, this.enemyGroup, () => ({
      x: this.player.x,
      y: this.player.y,
    }));

    // Player vs enemy collision
    this.physics.add.overlap(
      this.player,
      this.enemyGroup,
      (_p, eObj) => {
        if (this.gameOver) return;
        const e = eObj as Enemy;
        const now = this.time.now;
        if (now - (e.dealContactAt || 0) < 400) return;
        e.dealContactAt = now;
        const killed = this.player.takeDamage(e.damage, now);
        if (killed && this.player.hp <= 0) {
          this.doGameOver();
        }
      },
      undefined,
      this,
    );

    // Projectile vs enemy
    this.physics.add.overlap(
      this.projectileGroup,
      this.enemyGroup,
      (pObj, eObj) => {
        const p = pObj as Projectile;
        const e = eObj as Enemy;
        if (!p.alive || !e.active) return;
        const now = this.time.now;
        const dead = e.takeDamage(p.damage, now, p.projId);
        if (dead && e.hp <= 0) this.killEnemy(e);
        if (p.seekTarget === false || true) {
          // consume piercing
          if (p.hit()) p.kill();
        }
      },
      undefined,
      this,
    );

    // Launch HUD
    this.scene.launch("HUD", { gameScene: this });
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.grass, 1);
    g.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    g.fillStyle(COLORS.grassAlt, 1);
    const cellSize = TILE * 2;
    for (let y = 0; y < WORLD_HEIGHT; y += cellSize) {
      for (let x = 0; x < WORLD_WIDTH; x += cellSize) {
        if (((x / cellSize) ^ (y / cellSize)) & 1) {
          g.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
    // dots
    g.fillStyle(0x405a40, 0.6);
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      g.fillRect(x, y, 2, 2);
    }
    g.setDepth(0);
  }

  private killEnemy(e: Enemy): void {
    const x = e.x;
    const y = e.y;
    const drop = e.xpDrop;
    const isBoss = e.isBoss;
    e.destroy();
    this.player.kills += 1;

    // XP gem drop
    const gem = new XPGem(this, x, y, drop, drop >= 4);
    this.gemGroup.add(gem);

    // Coin drop chance
    if (isBoss || Math.random() < 0.03) {
      const coin = new Coin(this, x + 8, y + 8, isBoss ? 10 : 1);
      this.coinGroup.add(coin);
    }
  }

  private doGameOver(): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    const coinsEarned = this.player.coinsEarned + Math.floor(this.player.kills / 10);
    this.player.coinsEarned = coinsEarned;
    addCoins(coinsEarned);
    updateBest({
      timeMs: this.elapsedMs,
      kills: this.player.kills,
      level: this.player.level,
    });
    this.time.delayedCall(500, () => {
      this.scene.stop("HUD");
      this.scene.start("GameOver", {
        timeMs: this.elapsedMs,
        kills: this.player.kills,
        level: this.player.level,
        coinsEarned,
      });
    });
  }

  update(time: number, delta: number): void {
    if (this.gameOver || this.levelingUp) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.elapsedMs += delta;

    // Input
    let vx = 0;
    let vy = 0;
    if (this.keys.A.isDown || this.keys.LEFT.isDown) vx -= 1;
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) vx += 1;
    if (this.keys.W.isDown || this.keys.UP.isDown) vy -= 1;
    if (this.keys.S.isDown || this.keys.DOWN.isDown) vy += 1;
    const len = Math.hypot(vx, vy) || 1;
    this.player.setVelocity((vx / len) * this.player.speed, (vy / len) * this.player.speed);
    this.player.tick(delta);

    // Enemies seek
    const enemies = this.enemyGroup.getChildren() as Enemy[];
    for (const e of enemies) {
      if (!e.active) continue;
      e.moveToward(this.player.x, this.player.y);
    }

    // Weapons
    this.weaponSystem.update(time, delta, enemies);
    this.weaponSystem.updateProjectiles(time, delta, enemies);

    // Spawner
    this.spawner.update(time, delta);

    // Gem pickup
    const gems = this.gemGroup.getChildren() as XPGem[];
    const radius = this.player.pickupRadius;
    let leveled = false;
    for (const gem of gems) {
      if (!gem.active) continue;
      const dx = this.player.x - gem.x;
      const dy = this.player.y - gem.y;
      const d = Math.hypot(dx, dy);
      if (!gem.magnetized && d < radius) gem.magnetized = true;
      if (gem.magnetized) {
        const done = gem.seek(this.player.x, this.player.y, delta);
        if (done) {
          if (this.player.gainXp(gem.value)) leveled = true;
          gem.destroy();
        }
      }
    }

    const coins = this.coinGroup.getChildren() as Coin[];
    for (const c of coins) {
      if (!c.active) continue;
      const dx = this.player.x - c.x;
      const dy = this.player.y - c.y;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        const done = c.seek(this.player.x, this.player.y, delta);
        if (done) {
          this.player.coinsEarned += c.value;
          c.destroy();
        }
      }
    }

    if (leveled) this.openLevelUp();
  }

  public openLevelUp(): void {
    if (this.levelingUp) return;
    this.levelingUp = true;
    this.scene.launch("LevelUp", { gameScene: this });
  }

  public resumeFromLevelUp(): void {
    this.levelingUp = false;
  }
}

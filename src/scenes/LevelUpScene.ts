import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import type { GameScene } from "./GameScene";
import { rollUpgrades, applyUpgrade, type UpgradeChoice } from "../systems/UpgradeSystem";
import { loadMeta } from "../systems/MetaStore";

export class LevelUpScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private choices: UpgradeChoice[] = [];
  private rerollsLeft = 0;

  constructor() {
    super("LevelUp");
  }

  create(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;
    const meta = loadMeta();
    this.rerollsLeft = meta.upgrades["meta-reroll"] ?? 0;

    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.7,
    );
    overlay.setScrollFactor(0);

    this.choices = rollUpgrades(this.gameScene.player, 4);

    const title = this.add
      .text(GAME_WIDTH / 2, 60, `✨ LEVEL UP! (Lv.${this.gameScene.player.level})`, {
        fontSize: "28px",
        color: "#ffff66",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.tweens.add({
      targets: title,
      scale: { from: 0.6, to: 1 },
      duration: 300,
      ease: "Back.easeOut",
    });

    this.renderChoices();

    if (this.rerollsLeft > 0) {
      this.makeRerollBtn();
    }
  }

  private renderChoices(): void {
    const existing = (this.children.list as Phaser.GameObjects.GameObject[]).filter(
      (c) => (c as any).__choice,
    );
    for (const e of existing) e.destroy();

    const cardW = 200;
    const cardH = 240;
    const total = this.choices.length;
    const gap = 18;
    const totalW = total * cardW + (total - 1) * gap;
    const startX = GAME_WIDTH / 2 - totalW / 2;
    const y = GAME_HEIGHT / 2 - 40;

    this.choices.forEach((ch, i) => {
      const x = startX + i * (cardW + gap) + cardW / 2;
      const card = this.makeCard(ch, x, y, cardW, cardH);
      (card as any).__choice = true;
    });
  }

  private makeCard(
    choice: UpgradeChoice,
    x: number,
    y: number,
    w: number,
    h: number,
  ): Phaser.GameObjects.Container {
    const bgColor =
      choice.kind === "evolve" ? 0x7a3db2 : choice.kind === "heal" ? 0x3a6b3a : 0x1f2a4a;
    const bg = this.add
      .rectangle(0, 0, w, h, bgColor, 0.95)
      .setStrokeStyle(3, 0xffffff, 0.6);

    const iconTxt = this.add
      .text(0, -h / 2 + 60, choice.icon, { fontSize: "56px" })
      .setOrigin(0.5);

    const nameTxt = this.add
      .text(0, -h / 2 + 130, choice.name, {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: "monospace",
        align: "center",
        wordWrap: { width: w - 20 },
      })
      .setOrigin(0.5);

    const descTxt = this.add
      .text(0, -h / 2 + 180, choice.description, {
        fontSize: "11px",
        color: "#cfcfcf",
        fontFamily: "monospace",
        align: "center",
        wordWrap: { width: w - 20 },
      })
      .setOrigin(0.5);

    const c = this.add.container(x, y, [bg, iconTxt, nameTxt, descTxt]);
    c.setSize(w, h);
    c.setScrollFactor(0);
    c.setInteractive({ useHandCursor: true });
    c.setDepth(100);
    c.on("pointerover", () => {
      this.tweens.add({ targets: c, scale: 1.05, duration: 100 });
      bg.setStrokeStyle(3, 0xffff66, 1);
    });
    c.on("pointerout", () => {
      this.tweens.add({ targets: c, scale: 1, duration: 100 });
      bg.setStrokeStyle(3, 0xffffff, 0.6);
    });
    c.on("pointerdown", () => {
      applyUpgrade(this.gameScene.player, choice);
      this.close();
    });

    this.tweens.add({
      targets: c,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.8, to: 1 },
      duration: 300,
      delay: Math.random() * 100,
    });
    return c;
  }

  private makeRerollBtn(): void {
    const btn = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 60,
        `🎲 리롤 (${this.rerollsLeft}회 남음)`,
        {
          fontSize: "14px",
          color: "#ffffff",
          fontFamily: "monospace",
          backgroundColor: "#333",
          padding: { x: 12, y: 8 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      if (this.rerollsLeft <= 0) return;
      this.rerollsLeft -= 1;
      this.choices = rollUpgrades(this.gameScene.player, 4);
      this.renderChoices();
      if (this.rerollsLeft <= 0) btn.destroy();
      else btn.setText(`🎲 리롤 (${this.rerollsLeft}회 남음)`);
    });
  }

  private close(): void {
    this.gameScene.resumeFromLevelUp();
    // Handle multi-level-up cascading
    if (this.gameScene.player.xp >= this.gameScene.player.xpForNext()) {
      this.gameScene.openLevelUp();
    }
    this.scene.stop();
  }
}

import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import type { GameScene } from "./GameScene";
import { WEAPONS } from "../data/weapons";
import { PASSIVES } from "../data/passives";

export class HUDScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private hpBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private timeText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private weaponsText!: Phaser.GameObjects.Text;
  private passivesText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;

  constructor() {
    super("HUD");
  }

  create(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;

    this.xpBar = this.add.graphics().setDepth(1001).setScrollFactor(0);

    this.hpBar = this.add.graphics().setDepth(1001).setScrollFactor(0);

    this.timeText = this.add
      .text(GAME_WIDTH / 2, 26, "00:00", {
        fontSize: "26px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    this.levelText = this.add
      .text(20, 50, "Lv.1", {
        fontSize: "16px",
        color: "#ffd24d",
        fontFamily: "monospace",
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.killText = this.add
      .text(20, 70, "Kills: 0", {
        fontSize: "12px",
        color: "#f4f4f4",
        fontFamily: "monospace",
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.coinText = this.add
      .text(20, 86, "🪙 0", {
        fontSize: "12px",
        color: "#ffd24d",
        fontFamily: "monospace",
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.hpText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 32, "", {
        fontSize: "11px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    this.weaponsText = this.add
      .text(GAME_WIDTH - 20, 50, "", {
        fontSize: "12px",
        color: "#a0e8ff",
        fontFamily: "monospace",
        align: "right",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1001);

    this.passivesText = this.add
      .text(GAME_WIDTH - 20, 170, "", {
        fontSize: "11px",
        color: "#e0a0ff",
        fontFamily: "monospace",
        align: "right",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1001);
  }

  update(): void {
    const p = this.gameScene.player;
    if (!p || !p.active) return;

    // Time
    const ms = this.gameScene.elapsedMs;
    this.timeText.setText(fmtTime(ms));

    // Level & kills & coins
    this.levelText.setText(`Lv.${p.level}`);
    this.killText.setText(`Kills: ${p.kills}`);
    this.coinText.setText(`🪙 ${p.coinsEarned}`);

    // HP bar (bottom-center)
    const hpW = 300;
    const hpH = 14;
    const hpX = GAME_WIDTH / 2 - hpW / 2;
    const hpY = GAME_HEIGHT - 24;
    this.hpBar.clear();
    this.hpBar.fillStyle(0x101020, 0.8);
    this.hpBar.fillRect(hpX - 2, hpY - 2, hpW + 4, hpH + 4);
    this.hpBar.fillStyle(0xff3030, 1);
    const hpPct = Math.max(0, p.hp / p.maxHp);
    this.hpBar.fillRect(hpX, hpY, hpW * hpPct, hpH);
    this.hpBar.lineStyle(2, 0xffffff, 0.7);
    this.hpBar.strokeRect(hpX - 2, hpY - 2, hpW + 4, hpH + 4);
    this.hpText.setText(`${Math.ceil(p.hp)} / ${Math.ceil(p.maxHp)}`);

    // XP bar (top)
    const xpW = GAME_WIDTH - 40;
    const xpH = 10;
    const xpX = 20;
    const xpY = 14;
    this.xpBar.clear();
    this.xpBar.fillStyle(0x101020, 0.8);
    this.xpBar.fillRect(xpX - 1, xpY - 1, xpW + 2, xpH + 2);
    this.xpBar.fillStyle(0x6ad9ff, 1);
    const needed = p.xpForNext();
    const xpPct = Math.max(0, Math.min(1, p.xp / needed));
    this.xpBar.fillRect(xpX, xpY, xpW * xpPct, xpH);

    // Weapons
    const wLines = ["🗡️ WEAPONS"];
    for (const [kind, lvl] of p.weapons) {
      const def = WEAPONS[kind as keyof typeof WEAPONS];
      if (def) wLines.push(`${def.icon} ${def.name} Lv.${lvl}`);
    }
    this.weaponsText.setText(wLines.join("\n"));

    // Passives
    const pLines = ["✨ PASSIVES"];
    for (const [kind, lvl] of p.passives) {
      const def = PASSIVES[kind];
      if (def) pLines.push(`${def.icon} ${def.name} Lv.${lvl}`);
    }
    this.passivesText.setText(pLines.join("\n"));
  }
}

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

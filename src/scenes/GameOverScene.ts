import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import { loadMeta } from "../systems/MetaStore";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(data: { timeMs: number; kills: number; level: number; coinsEarned: number }): void {
    this.cameras.main.setBackgroundColor(0x0a0a1a);
    const meta = loadMeta();

    this.add
      .text(GAME_WIDTH / 2, 90, "☠️ GAME OVER", {
        fontSize: "42px",
        color: "#ff6b6b",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const rows = [
      [`생존 시간`, fmtTime(data.timeMs)],
      [`처치`, `${data.kills}`],
      [`도달 레벨`, `Lv.${data.level}`],
      [`획득 코인`, `🪙 ${data.coinsEarned}`],
      [`보유 코인`, `🪙 ${meta.coins}`],
    ];
    const startY = 180;
    rows.forEach(([label, val], i) => {
      this.add.text(GAME_WIDTH / 2 - 140, startY + i * 32, label, {
        fontSize: "16px",
        color: "#a0a0c0",
        fontFamily: "monospace",
      });
      this.add.text(GAME_WIDTH / 2 + 40, startY + i * 32, val, {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      });
    });

    const againBtn = this.add
      .text(GAME_WIDTH / 2 - 80, GAME_HEIGHT - 80, "▶ 재도전", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#4a8cd9",
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    againBtn.on("pointerdown", () => this.scene.start("Game"));

    const menuBtn = this.add
      .text(GAME_WIDTH / 2 + 80, GAME_HEIGHT - 80, "🏠 메뉴", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#333",
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    menuBtn.on("pointerdown", () => this.scene.start("Menu"));
  }
}

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

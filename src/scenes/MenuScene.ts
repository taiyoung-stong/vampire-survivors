import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import { loadMeta, upgradeMeta, META_UPGRADES } from "../systems/MetaStore";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a1a);

    const title = this.add
      .text(GAME_WIDTH / 2, 80, "🧛 뱀파이어 서바이버즈", {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 84,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const meta = loadMeta();
    this.add
      .text(GAME_WIDTH / 2, 130, `🪙 ${meta.coins}`, {
        fontSize: "20px",
        color: "#ffd24d",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        160,
        `최고 기록: ${fmtTime(meta.best.timeMs)} · ${meta.best.kills}킬 · Lv.${meta.best.level}`,
        {
          fontSize: "12px",
          color: "#a0a0c0",
          fontFamily: "monospace",
        },
      )
      .setOrigin(0.5);

    // Play button
    const playBtn = this.makeButton(
      GAME_WIDTH / 2,
      210,
      240,
      50,
      "▶ 게임 시작",
      0x4a8cd9,
      () => this.scene.start("Game"),
    );
    playBtn.setDepth(10);

    // Upgrades list
    this.add
      .text(GAME_WIDTH / 2, 260, "영구 강화", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const cols = 3;
    const cellW = 280;
    const cellH = 50;
    const startX = GAME_WIDTH / 2 - (cols * cellW) / 2 + cellW / 2;
    const startY = 300;

    META_UPGRADES.forEach((def, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * cellW;
      const y = startY + row * (cellH + 8);
      const lvl = meta.upgrades[def.key] ?? 0;
      const maxed = lvl >= def.maxLevel;
      const cost = maxed ? 0 : def.cost(lvl);
      const label = maxed
        ? `${def.icon} ${def.name} MAX`
        : `${def.icon} ${def.name} Lv.${lvl}/${def.maxLevel}  (🪙${cost})`;
      const color = maxed ? 0x3a6b3a : meta.coins >= cost ? 0x4a6b9a : 0x3a3a4a;
      this.makeButton(x, y, cellW - 8, cellH - 6, label, color, () => {
        if (maxed) return;
        const next = upgradeMeta(def.key);
        if (next) {
          this.scene.restart();
        }
      }, 11);
    });

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 30,
        "이동: WASD / 방향키   ·   자동 공격",
        {
          fontSize: "10px",
          color: "#808080",
          fontFamily: "monospace",
        },
      )
      .setOrigin(0.5);
  }

  private makeButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    bgColor: number,
    onClick: () => void,
    fontSize = 14,
  ): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(0, 0, w, h, bgColor).setStrokeStyle(2, 0xffffff, 0.3);
    const txt = this.add
      .text(0, 0, label, {
        fontSize: `${fontSize}px`,
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    const container = this.add.container(x, y, [bg, txt]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on("pointerover", () => bg.setFillStyle(brighten(bgColor, 0.15)));
    container.on("pointerout", () => bg.setFillStyle(bgColor));
    container.on("pointerdown", onClick);
    return container;
  }
}

function brighten(c: number, amt: number): number {
  const r = Math.min(255, ((c >> 16) & 0xff) + Math.floor(255 * amt));
  const g = Math.min(255, ((c >> 8) & 0xff) + Math.floor(255 * amt));
  const b = Math.min(255, (c & 0xff) + Math.floor(255 * amt));
  return (r << 16) | (g << 8) | b;
}

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

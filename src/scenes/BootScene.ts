import Phaser from "phaser";
import { registerAllSprites } from "../textures";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    registerAllSprites(this);
    this.scene.start("Menu");
  }
}

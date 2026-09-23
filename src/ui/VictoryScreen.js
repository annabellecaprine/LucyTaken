import { SpriteGenerator } from '../gfx/Sprites.js';

export class VictoryScreen {
    constructor() {
        this.lucySprite = SpriteGenerator.generateLucySprites();
        this.redPandaSprite = SpriteGenerator.generateRedPandaSprites();
        this.blinkTimer = 0;
    }

    draw(ctx, player, width, height) {
        this.blinkTimer++;

        // Triumphant Retro Gold/Navy Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, width - 12, height - 12);

        // Victory Title Header
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('CONGRATULATIONS!', width / 2, 32);

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('LUCY HAS BEEN RESCUED!', width / 2, 48);

        // Draw Rescue Sprite Scene (Red Panda standing happily beside rescued Lucy)
        ctx.save();
        ctx.translate(width / 2 - 24, 70);

        // Red Panda Hero
        ctx.drawImage(this.redPandaSprite, 0, 0, 24, 24, -12, 0, 36, 36);
        // Rescued Lucy
        ctx.drawImage(this.lucySprite, 36, 0, 32, 32, 16, 0, 36, 36);

        ctx.restore();

        // Victory Quote Parody
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('YOU ARE INDEED A BAD ENOUGH', width / 2, 126);
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('RED PANDA!', width / 2, 138);

        // Score Card Box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(30, 150, width - 60, 40);

        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#66fcf1';
        ctx.fillText(`FINAL SCORE: ${player.score.toString().padStart(6, '0')}`, width / 2, 165);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`REMAINING LIVES: ${player.lives}`, width / 2, 178);

        // Replay Flash Prompt
        if (Math.floor(this.blinkTimer / 25) % 2 === 0) {
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = '#f1c40f';
            ctx.fillText('PRESS ENTER TO REPLAY', width / 2, 212);
        }
    }
}

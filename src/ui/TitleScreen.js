import { SpriteGenerator } from '../gfx/Sprites.js';

export class TitleScreen {
    constructor() {
        this.lucySprite = SpriteGenerator.generateLucySprites();
        this.amandaSprite = SpriteGenerator.generateAmandaSprites();
        this.blinkTimer = 0;
    }

    draw(ctx, width, height) {
        this.blinkTimer++;

        // Iconic NES Parody Green Screen Background
        ctx.fillStyle = '#00aa00'; // NES Vibrant Green
        ctx.fillRect(0, 0, width, height);

        // Darker green border / frame accent
        ctx.strokeStyle = '#007700';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, width - 8, height - 8);

        // Title Text Header
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        // Shadow
        ctx.fillStyle = '#000000';
        ctx.fillText('LUCY HAS BEEN TAKEN!', width / 2 + 1, 28);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('LUCY HAS BEEN TAKEN!', width / 2, 27);

        // Subheader Question
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText('ARE YOU A BAD ENOUGH DUDE', width / 2 + 1, 46);
        ctx.fillText('TO RESCUE THE KITTY?', width / 2 + 1, 56);

        ctx.fillStyle = '#f1c40f'; // Gold text
        ctx.fillText('ARE YOU A BAD ENOUGH DUDE', width / 2, 45);
        ctx.fillText('TO RESCUE THE KITTY?', width / 2, 55);

        // Draw Parody Character Artwork in Center (Bound Lucy & Smirking Amanda)
        ctx.save();
        ctx.translate(width / 2 - 32, 75);

        // Draw Amanda (Black cat boss holding sofa/ground)
        ctx.drawImage(this.amandaSprite, 0, 0, 32, 32, 28, 0, 48, 48);

        // Draw Bound Lucy
        ctx.drawImage(this.lucySprite, 0, 0, 32, 32, -12, 4, 48, 48);

        ctx.restore();

        // Controls Legend Banner
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(16, 140, width - 32, 42);

        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = '#66fcf1';
        ctx.fillText('HERO: RED PANDA BRAWLER', width / 2, 150);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('MOVE: WASD/ARROWS  PUNCH: J/Z  KICK: K/X', width / 2, 163);
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('SPECIAL TAIL SWIPE: L/C/SPACE', width / 2, 174);

        // Press Start Flash Prompt
        if (Math.floor(this.blinkTimer / 25) % 2 === 0) {
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.fillStyle = '#000000';
            ctx.fillText('PRESS START / ENTER', width / 2 + 1, 206);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('PRESS START / ENTER', width / 2, 205);
        }
    }
}

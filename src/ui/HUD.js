export class HUD {
    static draw(ctx, player, stageManager, width) {
        ctx.save();

        // Top HUD Bar Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, 24);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(0, 24, width, 1); // Gold separator line

        // 1. Player HP Bar
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('1P RED PANDA', 8, 10);

        const hpPercent = Math.max(0, player.hp / player.maxHp);
        ctx.fillStyle = '#333333';
        ctx.fillRect(8, 13, 60, 6);

        ctx.fillStyle = hpPercent > 0.5 ? '#2ecc71' : (hpPercent > 0.25 ? '#f1c40f' : '#e74c3c');
        ctx.fillRect(8, 13, Math.floor(60 * hpPercent), 6);

        // HP Bar Frame
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(7, 12, 62, 8);

        // 2. Lives & Score
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`LIVES:${player.lives}`, 80, 16);
        ctx.fillText(`SCORE:${player.score.toString().padStart(6, '0')}`, 145, 16);

        // 3. Stage Indicator
        ctx.fillStyle = '#66fcf1';
        ctx.fillText(`STAGE ${stageManager.stageId}`, 215, 16);

        // 4. Boss HP Bar (if Amanda Boss is present)
        if (stageManager.boss && !stageManager.boss.isDead) {
            const boss = stageManager.boss;
            const bHpPercent = Math.max(0, boss.hp / boss.maxHp);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(40, 205, 176, 26);
            ctx.strokeStyle = '#f1c40f';
            ctx.strokeRect(40, 205, 176, 26);

            ctx.fillStyle = '#f1c40f';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(boss.name, width / 2, 215);

            ctx.fillStyle = '#333333';
            ctx.fillRect(48, 218, 160, 6);
            ctx.fillStyle = '#e74c3c'; // Red boss health
            ctx.fillRect(48, 218, Math.floor(160 * bHpPercent), 6);
        }

        ctx.restore();
    }
}

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 256;
        this.height = 240;

        // Disable anti-aliasing for NES pixel perfection
        this.ctx.imageSmoothingEnabled = false;

        this.shakeAmount = 0;
        this.shakeDuration = 0;
        this.hitSparks = [];
    }

    clear(color = '#000000') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    applyCameraTransform(cameraX) {
        this.ctx.save();

        let offsetX = -cameraX;
        let offsetY = 0;

        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            offsetX += (Math.random() * 2 - 1) * this.shakeAmount;
            offsetY += (Math.random() * 2 - 1) * this.shakeAmount;
        }

        this.ctx.translate(Math.floor(offsetX), Math.floor(offsetY));
    }

    restoreTransform() {
        this.ctx.restore();
    }

    triggerShake(amount = 4, duration = 8) {
        this.shakeAmount = amount;
        this.shakeDuration = duration;
    }

    addHitSpark(x, y, text = 'POW!') {
        this.hitSparks.push({
            x, y, text,
            life: 12,
            maxLife: 12,
            vy: -0.5
        });
    }

    updateAndRenderHitSparks(cameraX) {
        this.ctx.save();
        this.ctx.translate(Math.floor(-cameraX), 0);
        this.ctx.font = '8px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';

        for (let i = this.hitSparks.length - 1; i >= 0; i--) {
            const spark = this.hitSparks[i];
            spark.life--;
            spark.y += spark.vy;

            // Flash color between white and yellow
            this.ctx.fillStyle = spark.life % 2 === 0 ? '#ffffff' : '#f1c40f';
            this.ctx.fillText(spark.text, Math.floor(spark.x), Math.floor(spark.y));

            if (spark.life <= 0) {
                this.hitSparks.splice(i, 1);
            }
        }
        this.ctx.restore();
    }

    // Y-sorting: sort entities by Z depth before rendering
    renderEntities(entities, cameraX) {
        this.applyCameraTransform(cameraX);

        // Sort by Z (world depth baseline)
        const sorted = [...entities].sort((a, b) => a.z - b.z);

        for (const entity of sorted) {
            entity.draw(this.ctx);
        }

        this.restoreTransform();
        this.updateAndRenderHitSparks(cameraX);
    }

    // Draw 8-bit NES style pixel text
    drawText(text, x, y, color = '#ffffff', align = 'left', size = 8) {
        this.ctx.save();
        this.ctx.font = `${size}px "Press Start 2P", monospace`;
        this.ctx.textAlign = align;

        // Draw black text shadow for 8-bit contrast
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText(text, Math.floor(x) + 1, Math.floor(y) + 1);

        this.ctx.fillStyle = color;
        this.ctx.fillText(text, Math.floor(x), Math.floor(y));
        this.ctx.restore();
    }
}

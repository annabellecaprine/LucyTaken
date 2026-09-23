export class Backgrounds {
    // Render NES Parallax Backgrounds based on current stage
    static drawStage(ctx, stageId, cameraX) {
        if (stageId === 1) {
            this.drawAlleyway(ctx, cameraX);
        } else if (stageId === 2) {
            this.drawRooftops(ctx, cameraX);
        } else if (stageId === 3) {
            this.drawVelvetLounge(ctx, cameraX);
        }
    }

    // Stage 1: Neon Alleyway
    static drawAlleyway(ctx, cameraX) {
        // Sky
        ctx.fillStyle = '#0f051d';
        ctx.fillRect(0, 0, 256, 240);

        // Far background skyline (Parallax 0.2)
        ctx.fillStyle = '#1c1033';
        const bgX = -(cameraX * 0.2) % 40;
        for (let i = -1; i < 8; i++) {
            ctx.fillRect(bgX + i * 40, 60, 25, 180);
            ctx.fillRect(bgX + i * 40 + 10, 40, 15, 200);
        }

        // Brick Buildings (Parallax 1.0)
        ctx.fillStyle = '#4a2511'; // Brick brown
        const wallX = -cameraX;
        ctx.fillRect(wallX, 80, 1000, 60);

        // Brick line texture
        ctx.fillStyle = '#30160a';
        for (let x = wallX; x < wallX + 1000; x += 16) {
            ctx.fillRect(x, 80, 1, 60);
        }

        // Street Ground ($Z$ playfield baseline from Z=140 to 220)
        ctx.fillStyle = '#2c3e50'; // Dark asphalt street
        ctx.fillRect(wallX, 140, 1000, 100);

        // Sidewalk curb
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(wallX, 136, 1000, 4);

        // Neon signs & Posters on building
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#e74c3c';
        ctx.fillText('CAT BAR', wallX + 60, 100);
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('NIGHT CITY', wallX + 280, 105);
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('SYNDICATE', wallX + 480, 95);
    }

    // Stage 2: Rooftop Chase
    static drawRooftops(ctx, cameraX) {
        // Night sky with stars
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, 256, 240);

        // Moon & Distant skyline (Parallax 0.15)
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(200, 40, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#181828';
        const bgX = -(cameraX * 0.15) % 50;
        for (let i = -1; i < 7; i++) {
            ctx.fillRect(bgX + i * 50, 70, 30, 170);
        }

        // Rooftop floor & parapet wall
        const wallX = -cameraX;
        ctx.fillStyle = '#34495e';
        ctx.fillRect(wallX, 140, 1000, 100);

        // Rooftop tiles
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(wallX, 136, 1000, 4);
    }

    // Stage 3: Amanda's Velvet Lounge
    static drawVelvetLounge(ctx, cameraX) {
        // Deep purple velvet walls
        ctx.fillStyle = '#2d132c';
        ctx.fillRect(0, 0, 256, 240);

        const wallX = -cameraX;

        // Gold wallpaper pillars
        ctx.fillStyle = '#801336';
        for (let x = wallX; x < wallX + 600; x += 80) {
            ctx.fillRect(x, 40, 16, 100);
            ctx.fillStyle = '#ee4540';
            ctx.fillRect(x + 4, 40, 8, 100);
            ctx.fillStyle = '#801336';
        }

        // Gold Chandelier in center
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(wallX + 180, 40, 40, 10);
        ctx.fillRect(wallX + 195, 20, 10, 20);

        // Lush Carpet Floor ($Z$=140 to 220)
        ctx.fillStyle = '#c0392b'; // Crimson carpet
        ctx.fillRect(wallX, 140, 600, 100);

        // Carpet border
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(wallX, 136, 600, 4);

        // Boss Velvet Throne
        ctx.fillStyle = '#801336';
        ctx.fillRect(wallX + 380, 100, 50, 40);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(wallX + 375, 95, 60, 6);
    }
}

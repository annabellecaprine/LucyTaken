// High-Resolution 32x32 NES Pixel-Art Generator
// Rendered programmatically with crisp shapes, shading, and limb detail.

export class SpriteGenerator {
    static createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas: c, ctx };
    }

    // Draw Red Panda Hero (32x32 per frame, 8 frames)
    static generateRedPandaSprites() {
        const frameW = 32;
        const frameH = 32;
        const count = 8;
        const { canvas, ctx } = this.createCanvas(frameW * count, frameH);

        for (let f = 0; f < count; f++) {
            ctx.save();
            ctx.translate(f * frameW, 0);

            // Base colors
            const rustRed = '#d35400';
            const rustLight = '#e67e22';
            const white = '#ffffff';
            const darkFur = '#1e272e';
            const yellowRing = '#f1c40f';
            const greenEye = '#2ecc71';

            // 1. Ringed Tail (Behind Body)
            ctx.save();
            ctx.translate(6, 18);
            if (f === 7) {
                // Tail Swipe Spinning Whirlwind
                ctx.strokeStyle = rustLight;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(10, -2, 14, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = yellowRing;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(10, -2, 10, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                // Normal Fluffy Ringed Tail
                const tailOffset = (f === 1 || f === 3) ? 1 : 0;
                ctx.fillStyle = rustRed;
                ctx.fillRect(-4, -10 + tailOffset, 8, 14);
                ctx.fillStyle = yellowRing;
                ctx.fillRect(-4, -8 + tailOffset, 8, 3);
                ctx.fillRect(-4, -3 + tailOffset, 8, 3);
                ctx.fillStyle = darkFur;
                ctx.fillRect(-4, 2 + tailOffset, 8, 2);
            }
            ctx.restore();

            // 2. Legs & Feet
            const legOffset1 = (f === 2) ? -2 : (f === 3 ? 2 : 0);
            const legOffset2 = (f === 2) ? 2 : (f === 3 ? -2 : 0);

            ctx.fillStyle = darkFur;
            if (f === 6) {
                // Kick Pose (Right leg extended forward)
                ctx.fillRect(10, 22, 6, 4); // Left standing leg
                ctx.fillRect(18, 18, 10, 5); // Extended Kick Leg
                // Kick arc line
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(22, 20, 8, -Math.PI / 4, Math.PI / 4);
                ctx.stroke();
            } else {
                ctx.fillRect(11 + legOffset1, 22, 4, 8); // Left leg
                ctx.fillRect(17 + legOffset2, 22, 4, 8); // Right leg
            }

            // 3. Torso & Vest
            ctx.fillStyle = rustRed;
            ctx.fillRect(11, 14, 10, 9);
            ctx.fillStyle = darkFur; // Vest
            ctx.fillRect(11, 15, 3, 7);
            ctx.fillRect(18, 15, 3, 7);

            // 4. Arms & Gloves
            ctx.fillStyle = darkFur;
            if (f === 4) {
                // Punch 1 (Extended right arm)
                ctx.fillRect(10, 15, 4, 4);
                ctx.fillStyle = rustRed;
                ctx.fillRect(18, 14, 10, 5); // Extended Fist
                // Punch wind arc
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.fillRect(26, 13, 4, 7);
            } else if (f === 5) {
                // Uppercut Punch
                ctx.fillStyle = rustRed;
                ctx.fillRect(18, 8, 5, 10); // Uppercut fist going up
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(17, 4, 7, 4); // Yellow impact sparkle
            } else {
                ctx.fillRect(8, 16, 4, 6);
                ctx.fillRect(20, 16, 4, 6);
            }

            // 5. Head & Face Features
            ctx.fillStyle = rustRed;
            ctx.fillRect(10, 4, 12, 10);

            // Fluffy Ears
            ctx.fillStyle = rustRed;
            ctx.fillRect(8, 2, 4, 4);
            ctx.fillRect(20, 2, 4, 4);
            ctx.fillStyle = white; // Inner ear fluff
            ctx.fillRect(9, 3, 2, 2);
            ctx.fillRect(21, 3, 2, 2);

            // White Cheek Markings & Snout (Red Panda Mask)
            ctx.fillStyle = white;
            ctx.fillRect(9, 9, 3, 4);  // Left cheek
            ctx.fillRect(20, 9, 3, 4); // Right cheek
            ctx.fillRect(14, 10, 4, 4); // Snout

            // Black Nose
            ctx.fillStyle = darkFur;
            ctx.fillRect(15, 10, 2, 2);

            // Hero Green Eyes
            ctx.fillStyle = greenEye;
            ctx.fillRect(12, 7, 2, 3);
            ctx.fillRect(18, 7, 2, 3);

            ctx.restore();
        }

        return canvas;
    }

    // Draw Amanda Boss (32x32 per frame, 3 frames)
    static generateAmandaSprites() {
        const frameW = 32;
        const frameH = 32;
        const count = 3;
        const { canvas, ctx } = this.createCanvas(frameW * count, frameH);

        for (let f = 0; f < count; f++) {
            ctx.save();
            ctx.translate(f * frameW, 0);

            const blackFur = '#181818';
            const whiteShirt = '#ffffff';
            const vestDark = '#2c3e50';
            const greenEye = '#2ecc71';
            const gold = '#f1c40f';
            const redLip = '#e74c3c';

            // Tail
            ctx.strokeStyle = blackFur;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(6, 20, 8, 0, Math.PI);
            ctx.stroke();

            // Legs
            ctx.fillStyle = vestDark;
            const walkShift = f === 1 ? 2 : 0;
            ctx.fillRect(11 - walkShift, 22, 4, 9);
            ctx.fillRect(17 + walkShift, 22, 4, 9);

            // Body & Stylish Waistcoat
            ctx.fillStyle = whiteShirt;
            ctx.fillRect(11, 12, 10, 10);
            ctx.fillStyle = vestDark;
            ctx.fillRect(10, 13, 3, 8);
            ctx.fillRect(19, 13, 3, 8);

            // Gold Brooch
            ctx.fillStyle = gold;
            ctx.fillRect(15, 14, 2, 2);

            // Arms & Slash FX
            if (f === 2) {
                // Dash Slash stance
                ctx.fillStyle = blackFur;
                ctx.fillRect(18, 14, 10, 4); // Extended arm
                // Red Slash claw lines
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(24, 10); ctx.lineTo(30, 22);
                ctx.moveTo(27, 8); ctx.lineTo(31, 18);
                ctx.stroke();
            } else {
                ctx.fillStyle = blackFur;
                ctx.fillRect(8, 14, 3, 7);
                ctx.fillRect(21, 14, 3, 7);
            }

            // Head & Ears
            ctx.fillStyle = blackFur;
            ctx.fillRect(10, 4, 12, 9);
            // Ears
            ctx.fillRect(9, 1, 3, 4);
            ctx.fillRect(20, 1, 3, 4);
            ctx.fillStyle = '#ff7675';
            ctx.fillRect(10, 2, 1, 2);
            ctx.fillRect(21, 2, 1, 2);

            // Eyes
            ctx.fillStyle = greenEye;
            ctx.fillRect(12, 7, 3, 2);
            ctx.fillRect(17, 7, 3, 2);

            // Lipstick / mouth
            ctx.fillStyle = redLip;
            ctx.fillRect(15, 10, 2, 1);

            ctx.restore();
        }

        return canvas;
    }

    // Draw Lucy (32x32 per frame, 2 frames: Bound & Rescued)
    static generateLucySprites() {
        const frameW = 32;
        const frameH = 32;
        const { canvas, ctx } = this.createCanvas(frameW * 2, frameH);

        // Frame 0: Bound Lucy
        ctx.save();
        ctx.translate(0, 0);
        // Blonde Hair & Ears
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(10, 4, 12, 12);
        ctx.fillStyle = '#e67e22'; // Orange ears
        ctx.fillRect(8, 2, 4, 4);
        ctx.fillRect(20, 2, 4, 4);
        // Blue eyes & blushing cheeks
        ctx.fillStyle = '#3498db';
        ctx.fillRect(12, 8, 2, 2);
        ctx.fillRect(18, 8, 2, 2);
        ctx.fillStyle = '#ff7675';
        ctx.fillRect(11, 10, 2, 1);
        ctx.fillRect(19, 10, 2, 1);
        // Dark Hoodie & Bound Ropes
        ctx.fillStyle = '#34495e';
        ctx.fillRect(11, 15, 10, 12);
        ctx.fillStyle = '#e74c3c'; // Ropes
        ctx.fillRect(9, 17, 14, 3);
        ctx.fillRect(9, 22, 14, 3);
        ctx.restore();

        // Frame 1: Rescued Lucy
        ctx.save();
        ctx.translate(32, 0);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(10, 4, 12, 14);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(8, 2, 4, 4);
        ctx.fillRect(20, 2, 4, 4);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(12, 8, 2, 2);
        ctx.fillRect(18, 8, 2, 2);
        // Smile
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(14, 11, 4, 1);
        // Clothes
        ctx.fillStyle = '#34495e';
        ctx.fillRect(11, 16, 10, 10);
        // Waving arm
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(21, 12, 4, 8);
        ctx.restore();

        return canvas;
    }

    // Draw Enemies (Alley Cat, Ninja Cat, Bouncer)
    static generateEnemySprites() {
        const frameW = 32;
        const frameH = 32;
        const { canvas, ctx } = this.createCanvas(frameW * 3, frameH);

        // 1. Alley Cat Thug (Red Headband, Gray Fur, Red Gloves)
        ctx.save();
        ctx.translate(0, 0);
        ctx.fillStyle = '#7f8c8d'; // Gray fur
        ctx.fillRect(10, 4, 12, 10);
        ctx.fillRect(9, 2, 3, 3);
        ctx.fillRect(20, 2, 3, 3);
        // Red Headband
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(9, 5, 14, 3);
        // Yellow eyes
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(12, 9, 2, 2);
        ctx.fillRect(18, 9, 2, 2);
        // Body & Red Gloves
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(11, 14, 10, 9);
        ctx.fillRect(11, 22, 4, 8);
        ctx.fillRect(17, 22, 4, 8);
        ctx.fillStyle = '#e74c3c'; // Gloves
        ctx.fillRect(7, 16, 4, 5);
        ctx.fillRect(21, 16, 4, 5);
        ctx.restore();

        // 2. Ninja Cat (Dark Purple Hood, Yellow Eyes)
        ctx.save();
        ctx.translate(32, 0);
        ctx.fillStyle = '#2d132c'; // Dark Purple Hood
        ctx.fillRect(10, 3, 12, 11);
        ctx.fillRect(9, 1, 3, 3);
        ctx.fillRect(20, 1, 3, 3);
        // Yellow Eyes
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(12, 7, 3, 2);
        ctx.fillRect(17, 7, 3, 2);
        // Suit & Claws
        ctx.fillStyle = '#1c1033';
        ctx.fillRect(11, 14, 10, 9);
        ctx.fillRect(11, 22, 4, 8);
        ctx.fillRect(17, 22, 4, 8);
        ctx.fillStyle = '#bdc3c7'; // Claws
        ctx.fillRect(6, 15, 5, 3);
        ctx.fillRect(21, 15, 5, 3);
        ctx.restore();

        // 3. Bulldog Bouncer (Bulky, Spiked Collar)
        ctx.save();
        ctx.translate(64, 0);
        ctx.fillStyle = '#a0522d'; // Brown fur
        ctx.fillRect(8, 2, 16, 12);
        // Spiked Collar
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(7, 13, 18, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(9, 14, 2, 2);
        ctx.fillRect(15, 14, 2, 2);
        ctx.fillRect(21, 14, 2, 2);
        // Bulky Body
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(9, 16, 14, 10);
        ctx.fillRect(9, 25, 6, 6);
        ctx.fillRect(17, 25, 6, 6);
        ctx.restore();

        return canvas;
    }
}

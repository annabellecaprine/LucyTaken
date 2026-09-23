// Programmatic NES 8-Bit Pixel Art Generator
// Creates crisp off-screen canvas sprite sheets for Red Panda, Lucy, Amanda, and Enemies.

export class SpriteGenerator {
    static createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas: c, ctx };
    }

    // Draw pixel grid from ascii array
    static drawPixelGrid(ctx, grid, palette, scale = 1, offsetX = 0, offsetY = 0) {
        for (let r = 0; r < grid.length; r++) {
            const row = grid[r];
            for (let c = 0; c < row.length; c++) {
                const char = row[c];
                if (char !== '.' && palette[char]) {
                    ctx.fillStyle = palette[char];
                    ctx.fillRect(offsetX + c * scale, offsetY + r * scale, scale, scale);
                }
            }
        }
    }

    // Generate Red Panda Hero Sprite Sheets
    static generateRedPandaSprites() {
        const palette = {
            R: '#d35400', // Rust orange/red fur
            r: '#e67e22', // Light orange highlight
            W: '#ffffff', // White face mask / ear tips
            B: '#2c3e50', // Dark legs / paws / ears
            K: '#111111', // Black outline & eyes
            T: '#e67e22', // Tail light ring
            D: '#7f8c8d', // Belt / detail
            E: '#2ecc71', // Hero Green eyes
        };

        // 16x24 base pixel grids for states
        const idle1 = [
            "..RRRRR..",
            ".RWWWWWR.",
            "RWKEEKEWR",
            "RWKEEKEWR",
            ".RWWWWWR.",
            "..RBBB..",
            ".RDRRRDR.",
            ".RDRRRDR.",
            "RRDRRRDRR",
            ".RDRRRDR.",
            "..B...B..",
            "..B...B..",
            ".BB...BB."
        ];

        const idle2 = [
            "..RRRRR..",
            ".RWWWWWR.",
            "RWKEEKEWR",
            "RWKEEKEWR",
            ".RWWWWWR.",
            "..RBBB..",
            ".RDRRRDR.",
            ".RDRRRDR.",
            ".RDRRRDR.",
            "..RBBB..",
            "..B...B..",
            ".BB...BB.",
            ".BB...BB."
        ];

        const punch = [
            "..RRRRR..",
            ".RWWWWWR.",
            "RWKEEKEWR",
            ".RWWWWWR.",
            "..RBBB...",
            ".RDRRRBBB",
            "RRDRRRBBB",
            ".RDRRR...",
            "..B...B..",
            ".BB...BB."
        ];

        const kick = [
            "..RRRRR..",
            ".RWWWWWR.",
            "RWKEEKEWR",
            ".RWWWWWR.",
            "..RBBB...",
            ".RDRRR...",
            "RRDRRRBBB",
            ".RDRRR...",
            "..B...BB.",
            ".BB......"
        ];

        // Spinning Tail Swipe (Special frame showing giant fluffy ringed tail)
        const tailSwipe = [
            ".TTRRRTT.",
            "TTRRRRRTT",
            "TRWWWWWRT",
            "RWKEEKEWR",
            "RWWWWWWWR",
            "RBBBBBBBR",
            "RRRRRRRRR",
            ".TTRRRTT.",
            "..BB.BB.."
        ];

        const { canvas, ctx } = this.createCanvas(128, 48);

        // Frame 0: Idle 1
        this.drawPixelGrid(ctx, idle1, palette, 1, 4, 8);
        // Frame 1: Idle 2
        this.drawPixelGrid(ctx, idle2, palette, 1, 28, 8);
        // Frame 2: Punch
        this.drawPixelGrid(ctx, punch, palette, 1, 52, 8);
        // Frame 3: Kick
        this.drawPixelGrid(ctx, kick, palette, 1, 76, 8);
        // Frame 4: Tail Swipe
        this.drawPixelGrid(ctx, tailSwipe, palette, 1, 100, 8);

        return canvas;
    }

    // Generate Amanda Boss Sprites (Black Cat in Stylish Waistcoat)
    static generateAmandaSprites() {
        const palette = {
            K: '#181818', // Black fur
            E: '#2ecc71', // Piercing green eyes
            W: '#ffffff', // White shirt
            V: '#2c3e50', // Dark waistcoat
            G: '#f1c40f', // Gold brooch
            R: '#e74c3c'  // Red sofa detail / lipstick
        };

        const stance = [
            ".K...K.",
            "KK...KK",
            "KKKKKKK",
            "KKEKEKK",
            "KKKKKKK",
            ".WVVVW.",
            ".WVVVW.",
            ".WVGVW.",
            ".WVVVW.",
            "..K.K..",
            "..K.K..",
            ".KK.KK."
        ];

        const slash = [
            "..K...K.",
            ".KK...KK",
            "KKKKKKKK",
            "KKKEKEKK",
            ".WVVVKKK",
            ".WVVVKKK",
            ".WVGV...",
            "..K.KK..",
            ".KK..KK."
        ];

        const { canvas, ctx } = this.createCanvas(64, 32);
        this.drawPixelGrid(ctx, stance, palette, 1, 4, 4);
        this.drawPixelGrid(ctx, slash, palette, 1, 36, 4);

        return canvas;
    }

    // Generate Lucy Sprites (Blonde Catgirl in distress)
    static generateLucySprites() {
        const palette = {
            O: '#e67e22', // Orange fur ears/tail
            Y: '#f1c40f', // Blonde hair
            E: '#3498db', // Blue eyes
            P: '#ff7675', // Blushing pink
            R: '#d63031', // Rope bound
            H: '#2d3436'  // Dark hoodie
        };

        const bound = [
            ".O...O.",
            "OYYYYYO",
            "YYEEYYY",
            "YYYYYYY",
            ".RRHRR.",
            ".RRRRR.",
            ".RRHRR.",
            "..HH..."
        ];

        const rescued = [
            ".O...O.",
            "OYYYYYO",
            "YYEEYYY",
            "YYYYYYY",
            ".YYYYY.",
            "..HH...",
            "..HH..."
        ];

        const { canvas, ctx } = this.createCanvas(64, 32);
        this.drawPixelGrid(ctx, bound, palette, 1, 4, 8);
        this.drawPixelGrid(ctx, rescued, palette, 1, 36, 8);

        return canvas;
    }

    // Generate Enemy Thugs (Alley Cats, Ninjas, Bulldogs)
    static generateEnemySprites() {
        const alleyCatPalette = {
            C: '#7f8c8d', // Gray fur
            R: '#e74c3c', // Red headband
            E: '#f1c40f', // Yellow eyes
            B: '#2c3e50', // Vest
            W: '#ffffff'
        };

        const alleyCat = [
            ".C...C.",
            "CRRRRRC",
            "CCECECC",
            "CCCCCCC",
            ".BBB...",
            "CBBBCCC",
            ".BBB...",
            "..C.C..",
            ".CC.CC."
        ];

        const { canvas, ctx } = this.createCanvas(64, 32);
        this.drawPixelGrid(ctx, alleyCat, alleyCatPalette, 1, 4, 8);

        return canvas;
    }
}

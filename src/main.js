import { Renderer } from './engine/Renderer.js';
import { input } from './engine/Input.js';
import { audio } from './engine/Audio.js';
import { Player } from './entities/Player.js';
import { StageManager } from './world/StageManager.js';
import { Backgrounds } from './world/Backgrounds.js';
import { TitleScreen } from './ui/TitleScreen.js';
import { HUD } from './ui/HUD.js';
import { VictoryScreen } from './ui/VictoryScreen.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);

        this.player = new Player(40, 0, 175);
        this.stageManager = new StageManager();

        this.titleScreen = new TitleScreen();
        this.victoryScreen = new VictoryScreen();

        this.gameState = 'TITLE'; // TITLE, PLAYING, STAGE_CLEAR, STAGE_TRANSITION, VICTORY, GAME_OVER
        this.gameOverTimer = 0;
        this.transitionTimer = 0;

        this.setupUIControls();
        this.init();
    }

    setupUIControls() {
        const btnSound = document.getElementById('btn-sound');
        const btnCrt = document.getElementById('btn-crt');
        const btnFullscreen = document.getElementById('btn-fullscreen');
        const crtOverlay = document.getElementById('crt-overlay');

        if (btnSound) {
            btnSound.addEventListener('click', () => {
                const enabled = audio.toggleSound();
                btnSound.textContent = enabled ? '🔊 AUDIO: ON' : '🔇 AUDIO: OFF';
                btnSound.classList.toggle('active', enabled);
            });
        }

        if (btnCrt) {
            btnCrt.addEventListener('click', () => {
                crtOverlay.classList.toggle('disabled');
                const isActive = !crtOverlay.classList.contains('disabled');
                btnCrt.textContent = isActive ? '📺 CRT FILTER: ON' : '📺 CRT FILTER: OFF';
                btnCrt.classList.toggle('active', isActive);
            });
        }

        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', () => {
                const wrapper = document.querySelector('.screen-wrapper');
                if (!document.fullscreenElement) {
                    wrapper.requestFullscreen().catch(err => console.log(err));
                } else {
                    document.exitFullscreen();
                }
            });
        }

        // Allow clicking canvas screen to focus and start/reset game
        this.canvas.addEventListener('click', () => {
            window.focus();
            audio.init();
            if (this.gameState === 'TITLE') {
                this.startNewGame();
            } else if (this.gameState === 'VICTORY' || this.gameState === 'GAME_OVER') {
                this.returnToTitleScreen();
            }
        });
    }

    init() {
        audio.startMusic('title');
        this.loop();
    }

    returnToTitleScreen() {
        this.gameState = 'TITLE';
        this.player = new Player(40, 0, 175);
        this.stageManager = new StageManager();
        audio.startMusic('title');
    }

    startNewGame() {
        this.player = new Player(40, 0, 175);
        this.stageManager.loadStage(1, this.player);
        this.gameState = 'PLAYING';
        this.gameOverTimer = 0;
    }

    nextStage() {
        const nextStageId = this.stageManager.stageId + 1;
        if (nextStageId <= 3) {
            this.gameState = 'STAGE_TRANSITION';
            this.transitionTimer = 90;
        } else {
            this.gameState = 'VICTORY';
            audio.startMusic('victory');
        }
    }

    handlePlayerDeath() {
        this.player.lives--;
        audio.playKnockdown();

        if (this.player.lives <= 0) {
            this.gameState = 'GAME_OVER';
            this.gameOverTimer = 180; // 3 second auto-return to Title screen
        } else {
            // Respawn player
            this.player.hp = this.player.maxHp;
            this.player.isDead = false;
            this.player.state = 'IDLE';
            this.player.x = this.stageManager.cameraX + 40;
            this.player.z = 175;
            this.player.y = 0;
            this.player.isInvincible = true;
            this.player.invincibleTimer = 90; // Temporary spawn invincibility
        }
    }

    update() {
        input.update();

        if (this.gameState === 'TITLE') {
            if (input.isStartPressed()) {
                this.startNewGame();
            }
        } else if (this.gameState === 'PLAYING') {
            // Handle Player Input & State
            this.player.handleInput(input);

            // Update Stage Manager (Camera, Waves, Enemy AI, Items)
            const bounds = this.stageManager.update(this.player, this.renderer);

            // Update Player Physics
            this.player.update(bounds, this.stageManager.enemies, this.renderer);

            // Check Boss hit collisions with Player Tail Swipe / Attacks
            if (this.stageManager.boss && !this.stageManager.boss.isDead && this.player.activeHitbox) {
                import('./engine/Collision.js').then(({ Collision }) => {
                    if (Collision.check3DBox(this.player.activeHitbox, Collision.getHurtbox(this.stageManager.boss))) {
                        const hitSuccess = this.stageManager.boss.takeDamage(
                            this.player.activeHitbox.damage,
                            this.player.activeHitbox.knockbackX,
                            0
                        );
                        if (hitSuccess) {
                            this.player.score += 250;
                            this.renderer.addHitSpark(this.stageManager.boss.x, this.stageManager.boss.z - 30, 'BOSS HIT!');
                        }
                    }
                });
            }

            // Handle Player Death ONCE when hp hit 0
            if (this.player.isDead && this.player.hp <= 0) {
                this.handlePlayerDeath();
            }

            // Check Stage Clear
            if (this.stageManager.stageCleared) {
                this.gameState = 'STAGE_CLEAR';
                this.transitionTimer = 180;
                this.player.score += 1500; // Flat time bonus
                this.player.state = 'IDLE';
                audio.playPickup();
            }
        } else if (this.gameState === 'STAGE_CLEAR') {
            this.transitionTimer--;
            if (this.transitionTimer <= 0) {
                this.nextStage();
            }
        } else if (this.gameState === 'STAGE_TRANSITION') {
            this.transitionTimer--;
            if (this.transitionTimer <= 0) {
                const nextId = this.stageManager.stageId + 1;
                this.stageManager.loadStage(nextId, this.player);
                this.gameState = 'PLAYING';
            }
        } else if (this.gameState === 'GAME_OVER') {
            this.gameOverTimer--;
            if (this.gameOverTimer <= 0 || input.isStartPressed()) {
                this.returnToTitleScreen();
            }
        } else if (this.gameState === 'VICTORY') {
            if (input.isStartPressed()) {
                this.returnToTitleScreen();
            }
        }
    }

    drawPlayfield() {
        // 1. Draw Parallax Background
        this.renderer.applyCameraTransform(this.stageManager.cameraX);
        Backgrounds.drawStage(this.renderer.ctx, this.stageManager.stageId, this.stageManager.cameraX);
        this.renderer.restoreTransform();

        // 2. Draw Y-Sorted 2.5D Entities (Player, Enemies, Boss, Items)
        const allEntities = this.stageManager.getAllEntities(this.player);
        this.renderer.renderEntities(allEntities, this.stageManager.cameraX);

        // 3. Draw Stage Arrow / Item Overlays
        this.renderer.applyCameraTransform(this.stageManager.cameraX);
        this.stageManager.drawOverlayUI(this.renderer.ctx);
        this.renderer.restoreTransform();

        // 4. Draw Screen-space HUD
        HUD.draw(this.renderer.ctx, this.player, this.stageManager, this.renderer.width);
    }

    render() {
        this.renderer.clear();

        if (this.gameState === 'TITLE') {
            this.titleScreen.draw(this.renderer.ctx, this.renderer.width, this.renderer.height);
        } else if (this.gameState === 'PLAYING') {
            this.drawPlayfield();
        } else if (this.gameState === 'STAGE_CLEAR') {
            this.drawPlayfield();
            this.renderer.clear('rgba(0,0,0,0.6)');
            this.renderer.drawText(`STAGE ${this.stageManager.stageId} CLEAR!`, this.renderer.width / 2, 100, '#66fcf1', 'center', 10);
            this.renderer.drawText(`BONUS: +1500`, this.renderer.width / 2, 130, '#f1c40f', 'center', 8);
        } else if (this.gameState === 'STAGE_TRANSITION') {
            const alpha = Math.min(1, (90 - this.transitionTimer) / 30);
            this.drawPlayfield();
            this.renderer.clear(`rgba(0,0,0,${alpha})`);
            if (this.transitionTimer < 45) {
                this.renderer.drawText(`STAGE ${this.stageManager.stageId + 1} START`, this.renderer.width / 2, 120, '#ffffff', 'center', 10);
            }
        } else if (this.gameState === 'VICTORY') {
            this.victoryScreen.draw(this.renderer.ctx, this.player, this.renderer.width, this.renderer.height);
        } else if (this.gameState === 'GAME_OVER') {
            this.renderer.drawText('GAME OVER', this.renderer.width / 2, 100, '#e74c3c', 'center', 14);
            this.renderer.drawText('RETURNING TO TITLE...', this.renderer.width / 2, 130, '#ffffff', 'center', 7);
            this.renderer.drawText('PRESS ENTER / CLICK', this.renderer.width / 2, 150, '#f1c40f', 'center', 7);
        }
    }

    loop = () => {
        this.update();
        this.render();
        input.clearJustPressed();
        requestAnimationFrame(this.loop);
    };
}

// Bootstrap Game on Window Load
window.addEventListener('DOMContentLoaded', () => {
    // Explicitly force browser to load the font so canvas doesn't use massive fallbacks
    if (document.fonts) {
        document.fonts.load('10px "Press Start 2P"').then(() => {
            new Game();
        }).catch(() => {
            new Game();
        });
    } else {
        new Game();
    }
});

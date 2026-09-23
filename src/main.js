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

        this.gameState = 'TITLE'; // TITLE, PLAYING, VICTORY, GAME_OVER

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
    }

    init() {
        audio.startMusic('title');
        this.loop();
    }

    startNewGame() {
        this.player = new Player(40, 0, 175);
        this.stageManager.loadStage(1, this.player);
        this.gameState = 'PLAYING';
    }

    nextStage() {
        const nextStageId = this.stageManager.stageId + 1;
        if (nextStageId <= 3) {
            this.stageManager.loadStage(nextStageId, this.player);
        } else {
            this.gameState = 'VICTORY';
            audio.startMusic('victory');
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

            // Check Player Death / Respawn
            if (this.player.isDead) {
                this.player.lives--;
                if (this.player.lives <= 0) {
                    this.gameState = 'GAME_OVER';
                } else {
                    // Respawn player
                    this.player.hp = this.player.maxHp;
                    this.player.isDead = false;
                    this.player.state = 'IDLE';
                    this.player.x = this.stageManager.cameraX + 40;
                    this.player.z = 175;
                    this.player.isInvincible = true;
                    this.player.invincibleTimer = 60;
                }
            }

            // Check Stage Clear
            if (this.stageManager.stageCleared) {
                this.nextStage();
            }
        } else if (this.gameState === 'VICTORY' || this.gameState === 'GAME_OVER') {
            if (input.isStartPressed()) {
                this.gameState = 'TITLE';
                audio.startMusic('title');
            }
        }
    }

    render() {
        this.renderer.clear();

        if (this.gameState === 'TITLE') {
            this.titleScreen.draw(this.renderer.ctx, this.renderer.width, this.renderer.height);
        } else if (this.gameState === 'PLAYING') {
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
        } else if (this.gameState === 'VICTORY') {
            this.victoryScreen.draw(this.renderer.ctx, this.player, this.renderer.width, this.renderer.height);
        } else if (this.gameState === 'GAME_OVER') {
            this.renderer.drawText('GAME OVER', this.renderer.width / 2, 110, '#e74c3c', 'center', 14);
            this.renderer.drawText('PRESS ENTER TO RESTART', this.renderer.width / 2, 140, '#ffffff', 'center', 8);
        }
    }

    loop = () => {
        this.update();
        this.render();
        requestAnimationFrame(this.loop);
    };
}

// Bootstrap Game on Window Load
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

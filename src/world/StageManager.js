import { Enemy } from '../entities/Enemy.js';
import { BossAmanda } from '../entities/BossAmanda.js';
import { audio } from '../engine/Audio.js';

export class StageManager {
    constructor() {
        this.stageId = 1;
        this.cameraX = 0;
        this.targetCameraX = 0;
        this.cameraLockX = 0;
        this.isLocked = false;
        this.waveIndex = 0;
        this.waves = [];
        this.enemies = [];
        this.boss = null;
        this.items = [];
        this.stageCleared = false;
        this.goPromptTimer = 0;
    }

    loadStage(stageId, player) {
        this.stageId = stageId;
        this.cameraX = 0;
        this.targetCameraX = 0;
        this.cameraLockX = 0;
        this.isLocked = false;
        this.waveIndex = 0;
        this.enemies = [];
        this.boss = null;
        this.items = [];
        this.stageCleared = false;
        this.goPromptTimer = 0;

        player.x = 40;
        player.z = 170;
        player.y = 0;

        if (stageId === 1) {
            audio.startMusic('stage1');
            this.waves = [
                { triggerX: 120, enemies: [{ type: 'alley_cat', x: 220, z: 160 }, { type: 'alley_cat', x: 250, z: 190 }] },
                { triggerX: 300, enemies: [{ type: 'alley_cat', x: 400, z: 150 }, { type: 'ninja', x: 420, z: 180 }, { type: 'alley_cat', x: 440, z: 200 }] },
                { triggerX: 520, enemies: [{ type: 'bouncer', x: 620, z: 175 }, { type: 'ninja', x: 650, z: 155 }] }
            ];
        } else if (stageId === 2) {
            audio.startMusic('stage2');
            this.waves = [
                { triggerX: 100, enemies: [{ type: 'ninja', x: 200, z: 160 }, { type: 'ninja', x: 230, z: 190 }] },
                { triggerX: 320, enemies: [{ type: 'bouncer', x: 420, z: 170 }, { type: 'alley_cat', x: 440, z: 150 }, { type: 'ninja', x: 460, z: 200 }] }
            ];
        } else if (stageId === 3) {
            audio.startMusic('boss');
            this.waves = [
                { triggerX: 80, isBossWave: true }
            ];
        }
    }

    spawnMinionsForBoss() {
        if (this.boss) {
            this.enemies.push(new Enemy(this.boss.x - 40, 0, 160, 'ninja'));
            this.enemies.push(new Enemy(this.boss.x + 40, 0, 190, 'alley_cat'));
        }
    }

    spawnFishPickup(x, z) {
        this.items.push({
            x, z,
            type: 'fish',
            healAmount: 35,
            life: 300
        });
    }

    update(player, renderer) {
        // 1. Camera Follow Player
        if (!this.isLocked) {
            this.targetCameraX = Math.max(this.cameraX, player.x - 80);
            this.cameraX += (this.targetCameraX - this.cameraX) * 0.1;
        }

        // Camera playfield boundaries
        const bounds = {
            minX: this.cameraX + 16,
            maxX: this.cameraX + 240,
            minZ: 145,
            maxZ: 215
        };

        player.x = Math.max(bounds.minX, Math.min(bounds.maxX, player.x));

        // 2. Wave Triggers
        if (this.waveIndex < this.waves.length) {
            const wave = this.waves[this.waveIndex];
            if (player.x >= wave.triggerX && !this.isLocked) {
                this.isLocked = true;
                this.cameraLockX = this.cameraX;

                if (wave.isBossWave) {
                    this.boss = new BossAmanda(this.cameraX + 200, 0, 175);
                    audio.playBossAlert();
                } else {
                    for (const eData of wave.enemies) {
                        this.enemies.push(new Enemy(eData.x, 0, eData.z, eData.type));
                    }
                }
            }
        }

        // 3. Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.updateAI(player, bounds, renderer);

            if (enemy.isDead) {
                if (Math.random() < 0.35) {
                    this.spawnFishPickup(enemy.x, enemy.z);
                }
                this.enemies.splice(i, 1);
            }
        }

        // 4. Update Boss
        if (this.boss) {
            this.boss.updateAI(player, bounds, renderer, this);
            if (this.boss.isDead) {
                this.stageCleared = true;
            }
        }

        // 5. Check Wave Clearance
        if (this.isLocked && this.enemies.length === 0 && (!this.boss || this.boss.isDead)) {
            this.isLocked = false;
            this.waveIndex++;
            this.goPromptTimer = 120;

            if (this.waveIndex >= this.waves.length && !this.boss) {
                this.stageCleared = true;
            }
        }

        // 6. Check Item Pickups
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.life--;

            const dx = Math.abs(player.x - item.x);
            const dz = Math.abs(player.z - item.z);

            if (dx < 16 && dz < 12) {
                player.hp = Math.min(player.maxHp, player.hp + item.healAmount);
                audio.playPickup();
                if (renderer) renderer.addHitSpark(player.x, player.z - 20, 'YUM! +HP');
                this.items.splice(i, 1);
            } else if (item.life <= 0) {
                this.items.splice(i, 1);
            }
        }

        if (this.goPromptTimer > 0) this.goPromptTimer--;

        return bounds;
    }

    drawOverlayUI(ctx) {
        // Draw "GO ▶" arrow flashing prompt when wave cleared
        if (this.goPromptTimer > 0 && Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.save();
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillStyle = '#f1c40f';
            ctx.textAlign = 'right';
            ctx.fillText('GO ▶▶', 240, 50);
            ctx.restore();
        }

        // Draw Fish Item Pickups
        for (const item of this.items) {
            ctx.save();
            ctx.translate(item.x - this.cameraX, item.z);
            ctx.fillStyle = '#3498db';
            ctx.fillRect(-6, -4, 12, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -2, 4, 2);
            ctx.restore();
        }
    }

    getAllEntities(player) {
        const list = [player, ...this.enemies, ...this.items];
        if (this.boss) list.push(this.boss);
        return list;
    }
}

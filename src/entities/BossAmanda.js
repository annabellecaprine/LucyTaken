import { Entity } from './Entity.js';
import { SpriteGenerator } from '../gfx/Sprites.js';
import { Collision } from '../engine/Collision.js';
import { audio } from '../engine/Audio.js';

export class BossAmanda extends Entity {
    constructor(x, y, z) {
        super(x, y, z);
        this.name = 'AMANDA (SYNDICATE BOSS)';
        this.hp = 350;
        this.maxHp = 350;
        this.width = 24;
        this.height = 32;

        this.speedX = 2.0;
        this.speedZ = 1.5;

        this.phase = 1;
        this.attackCooldown = 0;

        this.spriteCanvas = SpriteGenerator.generateAmandaSprites();
        this.activeHitbox = null;
    }

    updateAI(player, bounds, renderer, stageManager) {
        if (this.isDead || !player || player.isDead || this.state === 'KNOCKDOWN') return;

        this.updatePhysics(bounds);

        if (this.attackCooldown > 0) this.attackCooldown--;

        if (this.phase === 1 && this.hp < this.maxHp / 2) {
            this.phase = 2;
            this.speedX = 2.6;
            this.speedZ = 1.9;
            audio.playBossAlert();
            if (renderer) renderer.addHitSpark(this.x, this.z - 30, 'PHASE 2 ENRAGED!');
            if (stageManager) stageManager.spawnMinionsForBoss();
        }

        if (this.state === 'HURT') {
            if (this.stateTimer > 10) this.state = 'IDLE';
            return;
        }

        const dx = player.x - this.x;
        const dz = player.z - this.z;
        this.facingRight = dx > 0;

        if (this.state === 'DASH_SLASH' || this.state === 'VELVET_STRIKE') {
            if (this.stateTimer > 16) {
                this.state = 'IDLE';
                this.activeHitbox = null;
            }
            return;
        }

        if (Math.abs(dz) > 6) {
            this.vz = (dz > 0 ? 1 : -1) * this.speedZ;
        }

        if (Math.abs(dx) > 30) {
            this.vx = (dx > 0 ? 1 : -1) * this.speedX;
            this.state = 'WALK';
        } else if (this.attackCooldown <= 0) {
            if (Math.random() < 0.6) {
                this.executeDashSlash(player, renderer);
            } else {
                this.executeVelvetStrike(player, renderer);
            }
        }
    }

    executeDashSlash(player, renderer) {
        this.state = 'DASH_SLASH';
        this.stateTimer = 0;
        this.attackCooldown = 40;
        this.vx = this.facingRight ? 5.5 : -5.5;
        audio.playKick();

        this.activeHitbox = {
            ...Collision.createHitbox(this, 14, -28, 0, 30, 26, 16),
            damage: 18,
            knockbackX: this.facingRight ? 6 : -6,
            knockbackZ: 0
        };

        if (player && Collision.check3DBox(this.activeHitbox, Collision.getHurtbox(player))) {
            const hitSuccess = player.takeDamage(18, this.facingRight ? 6 : -6, 0);
            if (hitSuccess) {
                audio.playHit();
                window.comboCount = 0;
                if (renderer) {
                    renderer.triggerShake(5, 8);
                    renderer.addHitSpark(player.x, player.z - player.y - 20, 'SLASH!', '#e74c3c');
                    renderer.addHitSpark(player.x - 10, player.z - player.y - 30, '-18', '#e74c3c');
                }
            }
        }
    }

    executeVelvetStrike(player, renderer) {
        this.state = 'VELVET_STRIKE';
        this.stateTimer = 0;
        this.attackCooldown = 50;
        audio.playPunch();

        this.activeHitbox = {
            ...Collision.createHitbox(this, 12, -26, 0, 24, 24, 12),
            damage: 14,
            knockbackX: this.facingRight ? 4 : -4,
            knockbackZ: 0
        };

        if (player && Collision.check3DBox(this.activeHitbox, Collision.getHurtbox(player))) {
            const hitSuccess = player.takeDamage(14, this.facingRight ? 4 : -4, 0);
            if (hitSuccess) {
                audio.playHit();
                window.comboCount = 0;
                if (renderer) {
                    renderer.addHitSpark(player.x, player.z - player.y - 20, 'WHACK!', '#e74c3c');
                    renderer.addHitSpark(player.x - 10, player.z - player.y - 30, '-14', '#e74c3c');
                }
            }
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        // Shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.z, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dash Attack Red Range Indicator
        if (this.state === 'DASH_SLASH') {
            ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 1;
            const dir = this.facingRight ? 1 : -1;
            ctx.beginPath();
            ctx.ellipse(this.x + dir * 16, this.z, 18, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();

        // Sprite
        ctx.save();
        ctx.translate(this.x, this.z - this.y);

        if (!this.facingRight) ctx.scale(-1, 1);

        if (this.state === 'KNOCKDOWN' || this.state === 'DEAD') {
            ctx.rotate(-Math.PI / 2); // Flop onto back
            ctx.translate(-24, 8);
        }

        if (this.isInvincible && Math.floor(Date.now() / 30) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const frame = this.state === 'DASH_SLASH' ? 2 : (this.state === 'WALK' ? 1 : 0);
        ctx.drawImage(this.spriteCanvas, frame * 32, 0, 32, 32, -16, -32, 32, 32);

        ctx.restore();
    }
}

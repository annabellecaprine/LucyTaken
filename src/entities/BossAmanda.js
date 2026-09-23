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
        this.width = 18;
        this.height = 26;

        this.speedX = 1.9;
        this.speedZ = 1.4;

        this.phase = 1;
        this.dashTimer = 0;
        this.attackCooldown = 0;

        this.spriteCanvas = SpriteGenerator.generateAmandaSprites();
        this.activeHitbox = null;
    }

    updateAI(player, bounds, renderer, stageManager) {
        if (this.isDead || !player) return;

        this.updatePhysics(bounds);

        if (this.attackCooldown > 0) this.attackCooldown--;

        // Phase shift at 50% HP
        if (this.phase === 1 && this.hp < this.maxHp / 2) {
            this.phase = 2;
            this.speedX = 2.4;
            this.speedZ = 1.8;
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

        // Alignment & Combat logic
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
        this.vx = this.facingRight ? 5 : -5; // Fast dash
        audio.playKick();

        this.activeHitbox = {
            ...Collision.createHitbox(this, 12, -22, 0, 26, 22, 14),
            damage: 18,
            knockbackX: this.facingRight ? 5 : -5,
            knockbackZ: 0
        };

        if (player && Collision.check3DBox(this.activeHitbox, Collision.getHurtbox(player))) {
            player.takeDamage(18, this.facingRight ? 5 : -5, 0);
            audio.playHit();
            if (renderer) {
                renderer.triggerShake(5, 8);
                renderer.addHitSpark(player.x, player.z - player.y - 20, 'SLASH!');
            }
        }
    }

    executeVelvetStrike(player, renderer) {
        this.state = 'VELVET_STRIKE';
        this.stateTimer = 0;
        this.attackCooldown = 50;
        audio.playPunch();

        this.activeHitbox = {
            ...Collision.createHitbox(this, 10, -20, 0, 20, 20, 10),
            damage: 14,
            knockbackX: this.facingRight ? 3 : -3,
            knockbackZ: 0
        };

        if (player && Collision.check3DBox(this.activeHitbox, Collision.getHurtbox(player))) {
            player.takeDamage(14, this.facingRight ? 3 : -3, 0);
            audio.playHit();
            if (renderer) renderer.addHitSpark(player.x, player.z - player.y - 20, 'WHACK!');
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        // Ground Shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.z, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Sprite
        ctx.save();
        ctx.translate(this.x, this.z - this.y);

        if (!this.facingRight) ctx.scale(-1, 1);

        if (this.isInvincible && Math.floor(Date.now() / 30) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const frame = this.state === 'DASH_SLASH' ? 1 : 0;
        ctx.drawImage(this.spriteCanvas, frame * 32, 0, 32, 32, -16, -28, 32, 32);

        ctx.restore();
    }
}

import { Entity } from './Entity.js';
import { SpriteGenerator } from '../gfx/Sprites.js';
import { Collision } from '../engine/Collision.js';
import { audio } from '../engine/Audio.js';

export class Enemy extends Entity {
    constructor(x, y, z, type = 'alley_cat') {
        super(x, y, z);
        this.type = type;
        this.width = 24;
        this.height = 32;

        if (type === 'ninja') {
            this.hp = 60;
            this.maxHp = 60;
            this.speedX = 1.9;
            this.speedZ = 1.3;
            this.name = 'Ninja Cat';
            this.spriteFrame = 1;
        } else if (type === 'bouncer') {
            this.hp = 140;
            this.maxHp = 140;
            this.speedX = 1.0;
            this.speedZ = 0.8;
            this.name = 'Bouncer';
            this.spriteFrame = 2;
        } else {
            this.hp = 80;
            this.maxHp = 80;
            this.speedX = 1.4;
            this.speedZ = 1.0;
            this.name = 'Alley Cat';
            this.spriteFrame = 0;
        }

        this.attackCooldown = 0;
        this.spriteCanvas = SpriteGenerator.generateEnemySprites();
        this.activeHitbox = null;
    }

    updateAI(player, bounds, renderer) {
        if (this.isDead || !player || player.isDead) return;

        this.updatePhysics(bounds);

        if (this.state === 'KNOCKDOWN') return;

        if (this.attackCooldown > 0) this.attackCooldown--;

        if (this.state === 'HURT') {
            if (this.stateTimer > 12) this.state = 'IDLE';
            return;
        }

        const dx = player.x - this.x;
        const dz = player.z - this.z;

        this.facingRight = dx > 0;

        if (this.state === 'ATTACK') {
            if (this.stateTimer > 15) {
                this.state = 'IDLE';
                this.activeHitbox = null;
            }
            return;
        }

        // Align with Player depth
        if (Math.abs(dz) > 6) {
            this.vz = (dz > 0 ? 1 : -1) * this.speedZ;
            this.state = 'WALK';
        }

        // Move in X plane
        if (Math.abs(dx) > 22) {
            this.vx = (dx > 0 ? 1 : -1) * this.speedX;
            this.state = 'WALK';
        } else if (Math.abs(dz) <= 8 && this.attackCooldown <= 0) {
            this.executeAttack(player, renderer);
        }
    }

    executeAttack(player, renderer) {
        this.state = 'ATTACK';
        this.stateTimer = 0;
        this.attackCooldown = 45 + Math.floor(Math.random() * 25);
        audio.playPunch();

        this.activeHitbox = {
            ...Collision.createHitbox(this, 10, -26, 0, 24, 26, 12),
            damage: 10,
            knockbackX: this.facingRight ? 4 : -4,
            knockbackZ: 0
        };

        if (player && Collision.check3DBox(this.activeHitbox, Collision.getHurtbox(player))) {
            const hitSuccess = player.takeDamage(10, this.facingRight ? 4 : -4, 0);
            if (hitSuccess) {
                audio.playHit();
                window.comboCount = 0; // Reset player combo
                if (renderer) {
                    renderer.addHitSpark(player.x, player.z - player.y - 20, 'OUCH!', '#e74c3c');
                    renderer.addHitSpark(player.x - 10, player.z - player.y - 30, '-10', '#e74c3c');
                }
            }
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        // Shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.z, 11, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Attack Range Indicator
        if (this.state === 'ATTACK') {
            ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 1;
            const dir = this.facingRight ? 1 : -1;
            ctx.beginPath();
            ctx.ellipse(this.x + dir * 12, this.z, 14, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();

        // Sprite
        ctx.save();
        ctx.translate(this.x, this.z - this.y);

        // Floating HP Bar (drawn upright before rotation)
        if (this.hp < this.maxHp) {
            const hpPercent = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = '#111111';
            ctx.fillRect(-8, -38, 16, 2);
            ctx.fillStyle = hpPercent > 0.5 ? '#2ecc71' : '#e74c3c';
            ctx.fillRect(-8, -38, Math.floor(16 * hpPercent), 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-9, -39, 18, 4);
        }

        if (!this.facingRight) ctx.scale(-1, 1);

        if (this.state === 'KNOCKDOWN' || this.state === 'DEAD') {
            ctx.rotate(-Math.PI / 2); // Flop onto back
            ctx.translate(-24, 8);
        }

        if (this.isInvincible && Math.floor(Date.now() / 40) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.drawImage(
            this.spriteCanvas,
            this.spriteFrame * 32, 0, 32, 32,
            -16, -32, 32, 32
        );

        ctx.restore();
    }
}

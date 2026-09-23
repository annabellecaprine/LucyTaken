import { Entity } from './Entity.js';
import { SpriteGenerator } from '../gfx/Sprites.js';
import { Collision } from '../engine/Collision.js';
import { audio } from '../engine/Audio.js';

export class Enemy extends Entity {
    constructor(x, y, z, type = 'alley_cat') {
        super(x, y, z);
        this.type = type;

        if (type === 'ninja') {
            this.hp = 60;
            this.maxHp = 60;
            this.speedX = 1.8;
            this.speedZ = 1.2;
            this.name = 'Ninja Cat';
        } else if (type === 'bouncer') {
            this.hp = 140;
            this.maxHp = 140;
            this.speedX = 1.0;
            this.speedZ = 0.8;
            this.name = 'Bouncer';
        } else {
            this.hp = 80;
            this.maxHp = 80;
            this.speedX = 1.3;
            this.speedZ = 1.0;
            this.name = 'Alley Cat';
        }

        this.attackCooldown = 0;
        this.spriteCanvas = SpriteGenerator.generateEnemySprites();
        this.activeHitbox = null;
    }

    updateAI(player, bounds, renderer) {
        if (this.isDead || !player || player.isDead) return;

        this.updatePhysics(bounds);

        if (this.attackCooldown > 0) this.attackCooldown--;

        if (this.state === 'HURT') {
            if (this.stateTimer > 12) this.state = 'IDLE';
            return;
        }

        // Calculate 3D distances to Player
        const dx = player.x - this.x;
        const dz = player.z - this.z;
        const dist2D = Math.sqrt(dx * dx + dz * dz);

        this.facingRight = dx > 0;

        // AI State logic
        if (this.state === 'ATTACK') {
            if (this.stateTimer > 15) {
                this.state = 'IDLE';
                this.activeHitbox = null;
            }
            return;
        }

        // Move to align with Player depth (Z plane)
        if (Math.abs(dz) > 6) {
            this.vz = (dz > 0 ? 1 : -1) * this.speedZ;
            this.state = 'WALK';
        }

        // Move towards player in X plane
        if (Math.abs(dx) > 20) {
            this.vx = (dx > 0 ? 1 : -1) * this.speedX;
            this.state = 'WALK';
        } else if (Math.abs(dz) <= 8 && this.attackCooldown <= 0) {
            // Execute enemy attack
            this.executeAttack(player, renderer);
        }
    }

    executeAttack(player, renderer) {
        this.state = 'ATTACK';
        this.stateTimer = 0;
        this.attackCooldown = 50 + Math.floor(Math.random() * 30);
        audio.playPunch();

        this.activeHitbox = {
            ...Collision.createHitbox(this, 8, -20, 0, 18, 20, 10),
            damage: 10,
            knockbackX: this.facingRight ? 3 : -3,
            knockbackZ: 0
        };

        if (player && Collision.check3DBox(this.activeHitbox, Collision.getHurtbox(player))) {
            player.takeDamage(10, this.facingRight ? 3 : -3, 0);
            audio.playHit();
            if (renderer) renderer.addHitSpark(player.x, player.z - player.y - 20, 'OUCH!');
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        // Shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.z, 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Sprite
        ctx.save();
        ctx.translate(this.x, this.z - this.y);

        if (!this.facingRight) ctx.scale(-1, 1);

        if (this.isInvincible && Math.floor(Date.now() / 40) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.drawImage(this.spriteCanvas, 0, 0, 24, 24, -12, -24, 24, 24);
        ctx.restore();
    }
}

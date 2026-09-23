import { Entity } from './Entity.js';
import { SpriteGenerator } from '../gfx/Sprites.js';
import { audio } from '../engine/Audio.js';
import { Collision } from '../engine/Collision.js';

export class Player extends Entity {
    constructor(x, y, z) {
        super(x, y, z);
        this.width = 24;
        this.height = 32;

        this.speedX = 2.4;
        this.speedZ = 1.5;

        this.comboStep = 0;
        this.comboTimer = 0;

        this.lives = 3;
        this.score = 0;

        // Generate high-res 32x32 sprites
        this.spriteCanvas = SpriteGenerator.generateRedPandaSprites();
        this.activeHitbox = null;
    }

    handleInput(input) {
        if (this.state === 'HURT' || this.state === 'KNOCKDOWN' || this.state === 'DEAD') {
            return;
        }

        const dx = input.moveX();
        const dz = input.moveZ();

        if (dx > 0) this.facingRight = true;
        if (dx < 0) this.facingRight = false;

        // Jump
        if (this.isOnGround() && input.isKickPressed() && (this.state === 'IDLE' || this.state === 'WALK')) {
            this.vy = 6.0;
            this.state = 'JUMP';
            this.stateTimer = 0;
            audio.playKick();
            return;
        }

        // Special Spinning Tail Swipe Attack
        if (input.isSpecialPressed() && (this.state === 'IDLE' || this.state === 'WALK' || this.state === 'JUMP')) {
            this.executeTailSwipe();
            return;
        }

        // Punch attack
        if (input.isPunchPressed()) {
            if (!this.isOnGround()) {
                this.executeJumpAttack();
            } else {
                this.executePunchCombo();
            }
            return;
        }

        // Movement
        if (this.state === 'IDLE' || this.state === 'WALK') {
            if (dx !== 0 || dz !== 0) {
                this.vx = dx * this.speedX;
                this.vz = dz * this.speedZ;
                this.state = 'WALK';
            } else {
                this.state = 'IDLE';
            }
        }
    }

    executePunchCombo() {
        this.state = 'PUNCH';
        this.stateTimer = 0;
        this.comboStep = (this.comboStep % 3) + 1;
        this.vx = this.facingRight ? 2.0 : -2.0;

        audio.playPunch();

        const range = this.comboStep === 3 ? 32 : 24;
        const damage = this.comboStep === 3 ? 30 : 15;
        const knockback = this.comboStep === 3 ? (this.facingRight ? 6 : -6) : (this.facingRight ? 3 : -3);

        this.activeHitbox = {
            ...Collision.createHitbox(this, 12, -26, 0, range, 26, 12),
            damage: damage,
            knockbackX: knockback,
            knockbackZ: 0
        };
    }

    executeJumpAttack() {
        this.state = 'JUMP_ATTACK';
        this.stateTimer = 0;
        audio.playKick();

        this.activeHitbox = {
            ...Collision.createHitbox(this, 14, -28, 0, 28, 26, 14),
            damage: 25,
            knockbackX: this.facingRight ? 5 : -5,
            knockbackZ: 0
        };
    }

    executeTailSwipe() {
        this.state = 'TAIL_SWIPE';
        this.stateTimer = 0;
        audio.playTailSwipe();

        // 360 degree surrounding hitbox!
        this.activeHitbox = {
            x: this.x - 30,
            y: this.y - 28,
            z: this.z,
            width: 60,
            height: 30,
            zDepth: 24,
            owner: this,
            damage: 40,
            knockbackX: this.facingRight ? 8 : -8,
            knockbackZ: 0,
            isSpecial: true
        };
    }

    update(bounds, enemies, renderer) {
        this.updatePhysics(bounds);

        if (this.state === 'PUNCH' && this.stateTimer > 12) {
            this.state = 'IDLE';
            this.activeHitbox = null;
        } else if (this.state === 'JUMP_ATTACK' && (this.isOnGround() || this.stateTimer > 18)) {
            this.state = 'IDLE';
            this.activeHitbox = null;
        } else if (this.state === 'TAIL_SWIPE') {
            if (this.stateTimer === 6 && renderer) {
                renderer.triggerShake(5, 8);
            }
            if (this.stateTimer > 20) {
                this.state = 'IDLE';
                this.activeHitbox = null;
            }
        } else if (this.state === 'HURT' && this.stateTimer > 14) {
            this.state = 'IDLE';
        }

        // Hitbox collisions
        if (this.activeHitbox && enemies) {
            for (const enemy of enemies) {
                if (!enemy.isDead && Collision.check3DBox(this.activeHitbox, Collision.getHurtbox(enemy))) {
                    const hitSuccess = enemy.takeDamage(
                        this.activeHitbox.damage,
                        this.activeHitbox.knockbackX,
                        this.activeHitbox.knockbackZ
                    );
                    if (hitSuccess) {
                        this.score += 100;
                        if (renderer) {
                            const text = this.activeHitbox.isSpecial ? 'TAIL SWIPE!' : (this.comboStep === 3 ? 'K.O.!' : 'WHAM!');
                            renderer.addHitSpark(enemy.x, enemy.z - enemy.y - 20, text);
                        }
                    }
                }
            }
        }
    }

    draw(ctx) {
        // 1. Ground Shadow (Z baseline)
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.z, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Visible Attack Hit Range Indicator (when attacking)
        if (this.activeHitbox) {
            ctx.fillStyle = this.activeHitbox.isSpecial ? 'rgba(241, 196, 15, 0.25)' : 'rgba(231, 76, 60, 0.25)';
            ctx.strokeStyle = this.activeHitbox.isSpecial ? '#f1c40f' : '#e74c3c';
            ctx.lineWidth = 1;

            ctx.beginPath();
            if (this.activeHitbox.isSpecial) {
                ctx.ellipse(this.x, this.z, 28, 12, 0, 0, Math.PI * 2);
            } else {
                const dir = this.facingRight ? 1 : -1;
                ctx.ellipse(this.x + dir * 14, this.z, 16, 8, 0, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();

        // 3. Draw Sprite
        ctx.save();
        ctx.translate(this.x, this.z - this.y);

        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        if (this.isInvincible && Math.floor(Date.now() / 40) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Select sprite frame index
        let frameIndex = 0;
        if (this.state === 'WALK') {
            frameIndex = 2 + Math.floor((this.stateTimer / 6) % 2);
        } else if (this.state === 'PUNCH') {
            frameIndex = this.comboStep === 2 ? 5 : 4;
        } else if (this.state === 'JUMP' || this.state === 'JUMP_ATTACK') {
            frameIndex = 6;
        } else if (this.state === 'TAIL_SWIPE') {
            frameIndex = 7;
        } else if (this.state === 'IDLE') {
            frameIndex = Math.floor((Date.now() / 400) % 2);
        }

        ctx.drawImage(
            this.spriteCanvas,
            frameIndex * 32, 0, 32, 32,
            -16, -32, 32, 32
        );

        ctx.restore();
    }
}

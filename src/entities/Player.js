import { Entity } from './Entity.js';
import { SpriteGenerator } from '../gfx/Sprites.js';
import { audio } from '../engine/Audio.js';
import { Collision } from '../engine/Collision.js';

export class Player extends Entity {
    constructor(x, y, z) {
        super(x, y, z);
        this.speedX = 2.2;
        this.speedZ = 1.4;

        this.comboStep = 0;
        this.comboTimer = 0;

        this.lives = 3;
        this.score = 0;

        // Generate sprites
        this.spriteCanvas = SpriteGenerator.generateRedPandaSprites();

        // Active attack hitbox reference
        this.activeHitbox = null;
    }

    handleInput(input) {
        if (this.state === 'HURT' || this.state === 'KNOCKDOWN' || this.state === 'DEAD') {
            return;
        }

        const dx = input.moveX();
        const dz = input.moveZ();

        // Facing direction
        if (dx > 0) this.facingRight = true;
        if (dx < 0) this.facingRight = false;

        // Jumping
        if (this.isOnGround() && input.isKickPressed() && (this.state === 'IDLE' || this.state === 'WALK')) {
            this.vy = 5.5;
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

        // Movement if not attacking
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
        this.vx = this.facingRight ? 1.5 : -1.5; // Slight forward lunge

        audio.playPunch();

        const range = this.comboStep === 3 ? 24 : 18;
        const damage = this.comboStep === 3 ? 25 : 12;
        const knockback = this.comboStep === 3 ? (this.facingRight ? 5 : -5) : (this.facingRight ? 2 : -2);

        this.activeHitbox = {
            ...Collision.createHitbox(this, 10, -20, 0, range, 20, 10),
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
            ...Collision.createHitbox(this, 12, -22, 0, 22, 20, 12),
            damage: 20,
            knockbackX: this.facingRight ? 4 : -4,
            knockbackZ: 0
        };
    }

    executeTailSwipe() {
        this.state = 'TAIL_SWIPE';
        this.stateTimer = 0;
        audio.playTailSwipe();

        // 360 degree surrounding hitbox!
        this.activeHitbox = {
            x: this.x - 24,
            y: this.y - 20,
            z: this.z,
            width: 48,
            height: 24,
            zDepth: 20,
            owner: this,
            damage: 35,
            knockbackX: this.facingRight ? 6 : -6,
            knockbackZ: 0,
            isSpecial: true
        };
    }

    update(bounds, enemies, renderer) {
        this.updatePhysics(bounds);

        // Reset state after attack animations complete
        if (this.state === 'PUNCH' && this.stateTimer > 12) {
            this.state = 'IDLE';
            this.activeHitbox = null;
        } else if (this.state === 'JUMP_ATTACK' && (this.isOnGround() || this.stateTimer > 18)) {
            this.state = 'IDLE';
            this.activeHitbox = null;
        } else if (this.state === 'TAIL_SWIPE') {
            if (this.stateTimer === 8 && renderer) {
                renderer.triggerShake(4, 6);
            }
            if (this.stateTimer > 20) {
                this.state = 'IDLE';
                this.activeHitbox = null;
            }
        } else if (this.state === 'HURT' && this.stateTimer > 14) {
            this.state = 'IDLE';
        }

        // Check attack collisions against enemies
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
        // 1. Shadow on the ground baseline (Z plane)
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.z, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Draw Sprite
        ctx.save();
        ctx.translate(this.x, this.z - this.y);

        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        // Flashing when invincible
        if (this.isInvincible && Math.floor(Date.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Frame selection
        let frameIndex = 0;
        if (this.state === 'WALK') {
            frameIndex = Math.floor((this.stateTimer / 6) % 2);
        } else if (this.state === 'PUNCH') {
            frameIndex = 2;
        } else if (this.state === 'JUMP' || this.state === 'JUMP_ATTACK') {
            frameIndex = 3;
        } else if (this.state === 'TAIL_SWIPE') {
            frameIndex = 4;
        }

        // Draw sprite slice from off-screen sprite sheet (24x24 per frame)
        ctx.drawImage(
            this.spriteCanvas,
            frameIndex * 24, 0, 24, 24,
            -12, -24, 24, 24
        );

        ctx.restore();
    }
}

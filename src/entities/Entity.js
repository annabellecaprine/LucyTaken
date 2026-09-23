export class Entity {
    constructor(x, y, z) {
        this.x = x;       // Horizontal X position
        this.y = y;       // Height off ground (0 = on ground)
        this.z = z;       // Depth position (Z plane depth: e.g. 140 to 220)

        this.vx = 0;      // X velocity
        this.vy = 0;      // Y vertical velocity (jumping)
        this.vz = 0;      // Z depth velocity
        this.gravity = 0.45;

        this.width = 16;
        this.height = 24;
        this.zDepth = 8;

        this.facingRight = true;
        this.state = 'IDLE';
        this.stateTimer = 0;

        this.hp = 100;
        this.maxHp = 100;
        this.isDead = false;
        this.isInvincible = false;
        this.invincibleTimer = 0;
    }

    updatePhysics(bounds) {
        // Apply depth movement
        this.z += this.vz;
        if (bounds) {
            this.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, this.z));
        }

        // Apply horizontal movement
        this.x += this.vx;

        // Apply vertical jump gravity
        this.y += this.vy;
        if (this.y > 0) {
            this.vy -= this.gravity;
        } else {
            this.y = 0;
            // Bounce on ground if knocked down
            if (this.state === 'KNOCKDOWN' && this.vy < -1) {
                this.vy = -this.vy * 0.4; // Bounce
                this.vx *= 0.6;
            } else {
                this.vy = 0;
            }
        }

        // Friction (only apply if on ground and not wildly bouncing)
        if (this.isOnGround() && this.state !== 'KNOCKDOWN') {
            this.vx *= 0.82;
            this.vz *= 0.82;
        } else if (this.state === 'KNOCKDOWN' && this.isOnGround() && Math.abs(this.vy) < 1) {
            this.vx *= 0.6;
            this.vz *= 0.6;
        }

        // Get up (or die) after lying on the ground for 60 frames
        if (this.state === 'KNOCKDOWN' && this.isOnGround() && Math.abs(this.vy) < 1) {
            if (this.hp <= 0) {
                if (this.stateTimer > 60) {
                    this.isDead = true;
                    this.state = 'DEAD';
                }
            } else {
                if (this.stateTimer > 60) {
                    this.state = 'IDLE';
                    this.stateTimer = 0;
                    this.invincibleTimer = 30; // Invincible while getting up
                }
            }
        }

        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) this.isInvincible = false;
        }

        this.stateTimer++;
    }

    takeDamage(amount, knockbackX = 0, knockbackZ = 0) {
        if (this.isInvincible || this.isDead || this.state === 'DEAD') return false;

        this.hp = Math.max(0, this.hp - amount);
        this.isInvincible = true;
        this.invincibleTimer = 16;

        // Slightly launch into air on heavy hit or death
        const isKnockdown = this.hp <= 0 || Math.abs(knockbackX) > 5;
        this.vx = knockbackX;
        this.vz = knockbackZ;
        this.stateTimer = 0;

        if (isKnockdown) {
            this.state = 'KNOCKDOWN';
            this.vy = 4.0; // Launch up
            this.invincibleTimer = 60; // Invincible while knocked down
        } else {
            this.state = 'HURT';
            // Stash hit-stun recoiling force
            this.vx = knockbackX * 0.5;
        }

        // Clear any active attacks
        this.activeHitbox = null;
        return true;
    }

    isOnGround() {
        return this.y <= 0;
    }
}


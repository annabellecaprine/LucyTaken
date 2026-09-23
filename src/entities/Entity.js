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
            this.vy = 0;
        }

        // Friction
        this.vx *= 0.82;
        this.vz *= 0.82;

        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) this.isInvincible = false;
        }

        this.stateTimer++;
    }

    takeDamage(amount, knockbackX = 0, knockbackZ = 0) {
        if (this.isInvincible || this.isDead) return false;

        this.hp = Math.max(0, this.hp - amount);
        this.isInvincible = true;
        this.invincibleTimer = 16;

        this.vx = knockbackX;
        this.vz = knockbackZ;
        this.stateTimer = 0;

        if (this.hp <= 0) {
            this.state = 'DEAD';
            this.isDead = true;
        } else {
            this.state = 'HURT';
        }
        return true;
    }

    isOnGround() {
        return this.y <= 0;
    }
}

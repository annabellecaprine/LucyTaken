export class Collision {
    // Check 3D bounding box overlap for 2.5D Beat 'Em Up combat
    static check3DBox(boxA, boxB) {
        const xOverlap = Math.abs(boxA.x - boxB.x) * 2 < (boxA.width + boxB.width);
        const zOverlap = Math.abs(boxA.z - boxB.z) < (boxA.zDepth + boxB.zDepth);
        const yOverlap = (boxA.y < boxB.y + boxB.height) && (boxA.y + boxA.height > boxB.y);

        return xOverlap && zOverlap && yOverlap;
    }

    // Create an attack hitbox relative to an entity's position and facing direction
    static createHitbox(owner, offsetX, offsetY, offsetZ, width, height, zDepth) {
        const dir = owner.facingRight ? 1 : -1;
        const x = owner.facingRight ? owner.x + offsetX : owner.x - offsetX - width;

        return {
            x: x,
            y: owner.y + offsetY,
            z: owner.z + offsetZ,
            width: width,
            height: height,
            zDepth: zDepth,
            owner: owner
        };
    }

    // Get hurtbox for an entity
    static getHurtbox(entity) {
        return {
            x: entity.x - entity.width / 2,
            y: entity.y - entity.height, // entity Y is baseline feet height offset by jump Y
            z: entity.z,
            width: entity.width,
            height: entity.height,
            zDepth: entity.zDepth || 8,
            owner: entity
        };
    }
}

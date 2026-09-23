export class InputManager {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
        this.gamepadState = {};

        window.addEventListener('keydown', (e) => {
            // Prevent scrolling for game controls
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyZ', 'KeyX', 'KeyC'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    update() {
        this.previousKeys = { ...this.keys };
        this.pollGamepad();
    }

    isDown(code) {
        return !!this.keys[code] || !!this.gamepadState[code];
    }

    isJustPressed(code) {
        return (!!this.keys[code] && !this.previousKeys[code]) || !!this.gamepadState[code + '_just'];
    }

    // Directional helpers (supports WASD & Arrows)
    moveX() {
        let dx = 0;
        if (this.isDown('ArrowLeft') || this.isDown('KeyA')) dx -= 1;
        if (this.isDown('ArrowRight') || this.isDown('KeyD')) dx += 1;
        return dx;
    }

    moveZ() {
        let dz = 0;
        if (this.isDown('ArrowUp') || this.isDown('KeyW')) dz -= 1;
        if (this.isDown('ArrowDown') || this.isDown('KeyS')) dz += 1;
        return dz;
    }

    isPunchPressed() {
        return this.isJustPressed('KeyJ') || this.isJustPressed('KeyZ');
    }

    isKickPressed() {
        return this.isJustPressed('KeyK') || this.isJustPressed('KeyX');
    }

    isSpecialPressed() {
        return this.isJustPressed('KeyL') || this.isJustPressed('KeyC') || this.isJustPressed('Space');
    }

    isStartPressed() {
        return this.isJustPressed('Enter') || this.isJustPressed('KeyJ') || this.isJustPressed('KeyZ');
    }

    pollGamepad() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0];
        if (!gp) return;

        // D-Pad / Left Stick
        this.gamepadState['ArrowLeft'] = gp.axes[0] < -0.4 || gp.buttons[14]?.pressed;
        this.gamepadState['ArrowRight'] = gp.axes[0] > 0.4 || gp.buttons[15]?.pressed;
        this.gamepadState['ArrowUp'] = gp.axes[1] < -0.4 || gp.buttons[12]?.pressed;
        this.gamepadState['ArrowDown'] = gp.axes[1] > 0.4 || gp.buttons[13]?.pressed;

        // Action buttons: A (Kick/Jump) = buttons[0], X (Punch) = buttons[2], Y/B (Special) = buttons[3]/[1]
        const punchNow = gp.buttons[2]?.pressed || gp.buttons[0]?.pressed;
        this.gamepadState['KeyJ_just'] = punchNow && !this.gamepadState['KeyJ_last'];
        this.gamepadState['KeyJ_last'] = punchNow;

        const kickNow = gp.buttons[1]?.pressed;
        this.gamepadState['KeyK_just'] = kickNow && !this.gamepadState['KeyK_last'];
        this.gamepadState['KeyK_last'] = kickNow;

        const specNow = gp.buttons[3]?.pressed || gp.buttons[5]?.pressed;
        this.gamepadState['KeyL_just'] = specNow && !this.gamepadState['KeyL_last'];
        this.gamepadState['KeyL_last'] = specNow;
    }
}

export const input = new InputManager();

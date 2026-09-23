export class InputManager {
    constructor() {
        this.keys = {};
        this.justPressedKeys = {};
        this.gamepadState = {};

        // Helper normalizer for codes and character keys
        const handleKeyDown = (e) => {
            const code = e.code || '';
            const key = e.key ? e.key.toLowerCase() : '';

            // Prevent scrolling / default browser actions for game keys
            if (
                ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyZ', 'KeyX', 'KeyC', 'KeyJ', 'KeyK', 'KeyL', 'Enter'].includes(code) ||
                [' ', 'z', 'x', 'c', 'j', 'k', 'l', 'enter', 'w', 'a', 's', 'd'].includes(key)
            ) {
                e.preventDefault();
            }

            // If not already down, mark as just pressed
            if (!this.keys[code] && (!key || !this.keys[key])) {
                if (code) this.justPressedKeys[code] = true;
                if (key) this.justPressedKeys[key] = true;
            }

            if (code) this.keys[code] = true;
            if (key) this.keys[key] = true;
        };

        const handleKeyUp = (e) => {
            const code = e.code || '';
            const key = e.key ? e.key.toLowerCase() : '';
            if (code) this.keys[code] = false;
            if (key) this.keys[key] = false;
        };

        window.addEventListener('keydown', handleKeyDown, { passive: false });
        window.addEventListener('keyup', handleKeyUp, { passive: false });

        // Focus window when canvas / screen is clicked
        window.addEventListener('pointerdown', () => {
            window.focus();
        });
    }

    // Called once per frame in the main game loop AFTER update logic completes
    clearJustPressed() {
        this.justPressedKeys = {};
    }

    update() {
        this.pollGamepad();
    }

    isDown(codeOrKey) {
        const k = codeOrKey.toLowerCase();
        return !!this.keys[codeOrKey] || !!this.keys[k] || !!this.gamepadState[codeOrKey];
    }

    isJustPressed(codeOrKey) {
        const k = codeOrKey.toLowerCase();
        return !!this.justPressedKeys[codeOrKey] || !!this.justPressedKeys[k] || !!this.gamepadState[codeOrKey + '_just'];
    }

    moveX() {
        let dx = 0;
        if (this.isDown('ArrowLeft') || this.isDown('KeyA') || this.isDown('a')) dx -= 1;
        if (this.isDown('ArrowRight') || this.isDown('KeyD') || this.isDown('d')) dx += 1;
        return dx;
    }

    moveZ() {
        let dz = 0;
        if (this.isDown('ArrowUp') || this.isDown('KeyW') || this.isDown('w')) dz -= 1;
        if (this.isDown('ArrowDown') || this.isDown('KeyS') || this.isDown('s')) dz += 1;
        return dz;
    }

    isPunchPressed() {
        return this.isJustPressed('KeyJ') || this.isJustPressed('j') || this.isJustPressed('KeyZ') || this.isJustPressed('z');
    }

    isKickPressed() {
        return this.isJustPressed('KeyK') || this.isJustPressed('k') || this.isJustPressed('KeyX') || this.isJustPressed('x');
    }

    isSpecialPressed() {
        return (
            this.isJustPressed('KeyL') ||
            this.isJustPressed('l') ||
            this.isJustPressed('KeyC') ||
            this.isJustPressed('c') ||
            this.isJustPressed('Space') ||
            this.isJustPressed(' ')
        );
    }

    isStartPressed() {
        return (
            this.isJustPressed('Enter') ||
            this.isJustPressed('enter') ||
            this.isJustPressed('Space') ||
            this.isJustPressed(' ') ||
            this.isPunchPressed() ||
            this.isKickPressed()
        );
    }

    pollGamepad() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0];
        if (!gp) return;

        this.gamepadState['ArrowLeft'] = gp.axes[0] < -0.4 || gp.buttons[14]?.pressed;
        this.gamepadState['ArrowRight'] = gp.axes[0] > 0.4 || gp.buttons[15]?.pressed;
        this.gamepadState['ArrowUp'] = gp.axes[1] < -0.4 || gp.buttons[12]?.pressed;
        this.gamepadState['ArrowDown'] = gp.axes[1] > 0.4 || gp.buttons[13]?.pressed;

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

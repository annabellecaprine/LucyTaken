class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.currentTrack = null;
        this.musicTimer = null;
        this.stepCount = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSound() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.currentTrack) {
            this.stopMusic();
        }
        return this.enabled;
    }

    // 8-bit Sound Effects Generators
    playPunch() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playKick() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playTailSwipe() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        // Whoosh pitch sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        osc.frequency.linearRampToValueAtTime(200, now + 0.25);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);

        // Add noise layer
        this.playNoise(0.2, 0.15);
    }

    playHit() {
        if (!this.enabled) return;
        this.playNoise(0.12, 0.3);
    }

    playKnockdown() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
        this.playNoise(0.25, 0.4);
    }

    playPickup() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.2, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.05);
            osc.stop(now + (idx + 1) * 0.05);
        });
    }

    playBossAlert() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.2);
        osc.frequency.linearRampToValueAtTime(150, now + 0.4);
        osc.frequency.linearRampToValueAtTime(600, now + 0.6);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
    }

    playNoise(duration, volume = 0.2) {
        this.init();
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    // Chiptune Music Synthesizer Loop Engine
    startMusic(trackName) {
        if (this.currentTrack === trackName) return;
        this.stopMusic();
        this.currentTrack = trackName;
        if (!this.enabled) return;
        this.init();

        this.stepCount = 0;
        const tempo = trackName === 'boss' ? 140 : (trackName === 'title' ? 120 : 128);
        const intervalMs = (60 / tempo / 4) * 1000; // 16th notes

        // Sequence definitions (MIDI note frequencies)
        const tracks = {
            title: {
                melody: [261, 0, 329, 392, 523, 0, 392, 329, 293, 0, 349, 440, 587, 0, 440, 349],
                bass: [130, 130, 130, 130, 146, 146, 146, 146, 164, 164, 164, 164, 130, 130, 130, 130]
            },
            stage1: {
                melody: [330, 330, 0, 392, 440, 0, 392, 330, 293, 293, 0, 349, 392, 0, 349, 293],
                bass: [164, 0, 164, 164, 146, 0, 146, 146, 130, 0, 130, 130, 146, 0, 146, 146]
            },
            stage2: {
                melody: [440, 523, 659, 0, 523, 440, 392, 0, 349, 440, 523, 0, 440, 349, 330, 0],
                bass: [220, 220, 0, 220, 174, 174, 0, 174, 196, 196, 0, 196, 164, 164, 0, 164]
            },
            boss: {
                melody: [220, 233, 220, 233, 261, 277, 261, 233, 220, 0, 220, 233, 330, 311, 293, 277],
                bass: [110, 110, 116, 116, 110, 110, 116, 116, 110, 110, 116, 116, 130, 130, 123, 123]
            },
            victory: {
                melody: [523, 0, 659, 0, 783, 0, 1046, 1046, 0, 0, 783, 1046, 0, 0, 0, 0],
                bass: [261, 261, 329, 329, 392, 392, 523, 523, 261, 261, 329, 329, 523, 523, 523, 523]
            }
        };

        const seq = tracks[trackName] || tracks.stage1;

        this.musicTimer = setInterval(() => {
            if (!this.enabled || this.ctx.state !== 'running') return;
            const step = this.stepCount % 16;
            const now = this.ctx.currentTime;

            // Melody channel (Square wave)
            const mNote = seq.melody[step];
            if (mNote > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(mNote, now);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            }

            // Bass channel (Triangle wave)
            const bNote = seq.bass[step];
            if (bNote > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(bNote, now);

                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.15);
            }

            // Drum noise beat on 4th & 12th step
            if (step % 4 === 2) {
                this.playNoise(0.05, 0.08);
            }

            this.stepCount++;
        }, intervalMs);
    }

    stopMusic() {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
        this.currentTrack = null;
    }
}

export const audio = new AudioEngine();

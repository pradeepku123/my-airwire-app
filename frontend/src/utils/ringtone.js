// Simple synth ringtone using Web Audio API
let audioCtx = null;
let oscillator = null;
let gainNode = null;
let intervalId = null;

export const startRingtone = () => {
    if (oscillator) return; // Already playing

    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume context if suspended (browser autoplay policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const createOscillator = () => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime); // 440Hz
            osc.frequency.setValueAtTime(480, audioCtx.currentTime + 0.1); // Modulation

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            // Envelope: Fade in, hold, fade out
            const now = audioCtx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
            gain.gain.linearRampToValueAtTime(0.5, now + 1.8);
            gain.gain.linearRampToValueAtTime(0, now + 2.0);

            osc.start(now);
            osc.stop(now + 2.0);
        };

        // Play immediately
        createOscillator();

        // Loop every 3 seconds
        intervalId = setInterval(() => {
            createOscillator();
        }, 3000);

        oscillator = true; // Mark as playing

    } catch (err) {
        console.error("Ringtone error:", err);
    }
};

export const stopRingtone = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    oscillator = null;
};

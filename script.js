class PomodoroTimer {
    constructor(durationMinutes = 25) {
        this.duration = durationMinutes * 60;
        this.timeLeft = this.duration;
        this.timerId = null;
        this.isRunning = false;

        this.timeDisplay = document.getElementById('time-display');
        this.customInput = document.getElementById('custom-minutes');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.circle = document.querySelector('.progress-ring__circle');
        const radius = this.circle.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;

        this.audioContext = null;

        this.init();
    }

    init() {
        this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.circle.style.strokeDashoffset = this.circumference;

        this.updateDisplay();
        this.setProgress(100);

        this.startBtn.addEventListener('click', () => {
            this.initAudio();
            this.start();
        });
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.customInput.addEventListener('change', (e) => this.handleInputChange(e));

        // Prevent typing non-numbers
        this.customInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playAlarm() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.5); // Drop to A4

        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    handleInputChange(e) {
        let minutes = parseInt(e.target.value);
        if (isNaN(minutes) || minutes < 1) minutes = 1;
        if (minutes > 180) minutes = 180; // Max 3 hours cap

        this.customInput.value = minutes;
        this.duration = minutes * 60;
        this.timeLeft = this.duration;

        // If running, stop and reset with new time
        if (this.isRunning) {
            this.pause();
        }

        this.updateDisplay();
        this.setProgress(100);
        this.pauseBtn.disabled = true;
        this.startBtn.disabled = false;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.customInput.disabled = true;
            this.timerId = setInterval(() => {
                this.tick();
            }, 1000);

            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.customInput.disabled = false;
            clearInterval(this.timerId);
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
        }
    }

    reset() {
        this.pause();
        this.timeLeft = this.duration;
        this.updateDisplay();
        this.setProgress(100);
        this.pauseBtn.disabled = true;
        this.startBtn.disabled = false;
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            const percent = (this.timeLeft / this.duration) * 100;
            this.setProgress(percent);
        } else {
            this.complete();
        }
    }

    complete() {
        this.pause();
        this.playAlarm();
        this.timeDisplay.innerText = "Done!";
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.title = `${this.timeDisplay.innerText} - Focus`;
    }

    setProgress(percent) {
        const offset = this.circumference - (percent / 100) * this.circumference;
        this.circle.style.strokeDashoffset = offset;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer(25);
});

class PomodoroTimer {
    constructor(durationMinutes = 25) {
        this.duration = durationMinutes * 60;
        this.timeLeft = this.duration;
        this.timerId = null;
        this.isRunning = false;

        this.timeDisplay = document.getElementById('time-display');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.circle = document.querySelector('.progress-ring__circle');
        const radius = this.circle.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;
        
        this.init();
    }

    init() {
        this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.circle.style.strokeDashoffset = this.circumference;

        this.updateDisplay();
        this.setProgress(100); // Start full

        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
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
        // Optional: Play sound
        this.timeDisplay.innerText = "Done!";
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.title = `${this.timeDisplay.innerText} - Focus`;
    }

    setProgress(percent) {
        // Calculate the offset. 
        // 100% means NO offset (0), but we initialized it to start "full".
        // Wait, standard SVG circle stroke logic:
        // strokeDasharray = circumference
        // strokeDashoffset = circumference - (percent / 100) * circumference
        
        const offset = this.circumference - (percent / 100) * this.circumference;
        this.circle.style.strokeDashoffset = offset;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer(25);
});

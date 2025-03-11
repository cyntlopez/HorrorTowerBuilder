class Settings {
    constructor(game, player, enemySpawner) {
        this.game = game;
        this.active = false;
        this.showAudio = false;
        this.enemySpawner = enemySpawner;
        this.width = 400;
        this.height = 500;
        this.player = player;

        this.soundEffectStates = {
            'walking': true,
            'enemySpawn': true,
            'enemySlash': true,
        };

        // Get existing audio controls
        this.audioControls = document.querySelector('#musicControls');
        if (this.audioControls) {
            this.audioControls.style.cssText = `
                position: fixed;
                top: 50px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                padding: 15px;
                border-radius: 8px;
                width: 200px;
                display: none;
            `;
        }

        // Create pause icon button
        this.pauseButton = document.createElement('button');
        this.pauseButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"> 
    <path d="M10 18V6M14 18V6" /> 
</svg>
        `;
        this.pauseButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            cursor: pointer;
            color: white;
            padding: 8px;
            border-radius: 50%;
            transition: background-color 0.3s;
            z-index: 1000;
        `;

        // Create music note button
        this.musicButton = document.createElement('button');
        this.musicButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
            </svg>
        `;
        this.musicButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 50px;
            background: none;
            border: none;
            cursor: pointer;
            color: white;
            padding: 8px;
            border-radius: 50%;
            transition: background-color 0.3s;
            z-index: 1000;
        `;

        this.hud = document.createElement('div');
        this.hud.id = 'hud';
        this.hud.style.cssText = `
            position: fixed;
            top: 60px; // Adjusted top position
            left: 10px;
            color: white;
            font-family: regularFont;
            z-index: 1000;
            pointer-events: none;
            background-color: rgba(0, 0, 0, 0.5); // Added background
            padding: 10px; // Added padding
            border-radius: 5px; // Added border radius
        `;



        this.updateHUD()

        this.startTime = 0;
        this.elapsedSeconds = 0;
        this.timerPaused = false;
        this.timerInterval = null;
        this.timeOffset = 0;

        // Add hover effects
        [this.pauseButton, this.musicButton].forEach(button => {
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });

            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'transparent';
            });
        });

        this.pauseButton.addEventListener('click', () => {
            this.toggleSettings();
            if (this.showAudio) this.toggleAudio(); // Close audio if open
            this.game.timer.paused = this.active; // Pause when settings are open
        });

        this.musicButton.addEventListener('click', () => {
            this.toggleAudio();
            if (this.active) this.toggleSettings(); // Close settings if open
            this.game.timer.paused = this.active || this.showAudio;  // Check both states
        });



        document.body.appendChild(this.pauseButton);
        document.body.appendChild(this.musicButton);
        document.body.appendChild(this.hud);
    }

    startTimer() {
        if (!this.timerInterval && !this.timerPaused) {
            if (this.startTime === 0) { // Only set initial startTime once
                this.startTime = Date.now();
            } else {
                this.startTime = Date.now() - this.timeOffset; // Adjust for paused time
            }
            this.timerInterval = setInterval(() => {
                if (!this.timerPaused) {
                    this.updateTime();
                }
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.timeOffset = Date.now() - this.startTime; // Store paused time
        }
    }

    updateTime() {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(this.elapsedSeconds / 60);
        const seconds = this.elapsedSeconds % 60;
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Add leading zero

        const timeSpan = document.getElementById('time');
        if (timeSpan) {
            timeSpan.textContent = formattedTime;
        }
    }

    toggleSettings() {

        this.active = !this.active;
        this.game.timer.paused = this.active || this.showAudio;
        if (this.active) {
            this.stopTimer(); // Stop when settings are open
            ASSET_MANAGER.stopAllSoundEffects();
        } else if (!this.showAudio) { //Restart only if audio is not open
            this.startTimer();   // Start only if settings are closed
        }
    }

    toggleAudio() {
        this.showAudio = !this.showAudio;
        if (this.audioControls) {
            this.audioControls.style.display = this.showAudio ? 'block' : 'none';
        }
        this.game.timer.paused = this.active || this.showAudio;
        if (this.showAudio) {
            this.stopTimer(); // Stop when audio is open
            ASSET_MANAGER.stopAllSoundEffects();
        } else if (!this.active) { // Restart timer when audio is closed and settings are closed
            this.startTimer();
        }
    }

    toggleSoundEffect(effectName) {
        if (effectName in this.soundEffectStates) {
            this.soundEffectStates[effectName] = !this.soundEffectStates[effectName];
        }
    }

    isSoundEffectEnabled(effectName) {
        return this.soundEffectStates[effectName] ?? true; // Default to true if not found
    }

    updateHUD() {
        const currentHealth = Math.max(0, this.player.health);
        const currentWave = this.enemySpawner.waveNumber - 1;

        this.hud.innerHTML = `
            Health: <span id="health"> ${currentHealth}</span><br>
            Wave: <span id="resources">${currentWave}</span><br>
            Time: <span id="time">0:00</span>
        `;
    }


    update() {
        if (!this.active) {
            this.updateHUD();
            this.updateTime();
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        this.game.camera.resetTransformations(ctx);

        // === Black transparent overlay ===
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // === Settings Panel ===
        const panelX = (ctx.canvas.width - this.width) / 2;
        const panelY = (ctx.canvas.height - this.height) / 2;

        ctx.fillStyle = 'rgb(20, 40, 20)';
        ctx.fillRect(panelX - 20, panelY - 20, this.width + 40, this.height + 40);

        // === Settings Title ===
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        // === Controls Title ===
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Pause', panelX + this.width / 2, panelY + 80);

        // === Controls List ===
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        const controls = [
        ];

        controls.forEach((control, index) => {
            ctx.fillText(control, panelX + 30, panelY + 120 + (index * 35));
        });

        ctx.restore();
    }


}
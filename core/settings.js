class Settings {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.showAudio = false;
        this.width = 400;
        this.height = 500;

        // Get existing audio controls
        this.audioControls = document.querySelector('div:not(#gameWorld)');
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

        // Create gear icon button
        this.gearButton = document.createElement('button');
        this.gearButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        `;
        this.gearButton.style.cssText = `
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

        // Add hover effects
        [this.gearButton, this.musicButton].forEach(button => {
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });

            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'transparent';
            });
        });

        this.gearButton.addEventListener('click', () => {
            this.toggleSettings();
            if (this.showAudio) this.toggleAudio(); // Close audio if open
            this.game.timer.paused = this.active; // Pause when settings are open
        });

        this.musicButton.addEventListener('click', () => {
            this.toggleAudio();
            if (this.active) this.toggleSettings(); // Close settings if open
            this.game.timer.paused = this.active || this.showAudio;  // Check both states
        });

        document.body.appendChild(this.gearButton);
        document.body.appendChild(this.musicButton);
    }

    toggleSettings() {
        this.active = !this.active;
        this.game.timer.paused = this.active || this.showAudio; // Pause for either menu
    }

    toggleAudio() {
        this.showAudio = !this.showAudio;
        if (this.audioControls) {
            this.audioControls.style.display = this.showAudio ? 'block' : 'none';
        }
        this.game.timer.paused = this.active || this.showAudio; // Pause for either menu
    }

    update() {
        // Update logic if needed
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        this.game.camera.resetTransformations(ctx);

        // Black background
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Settings panel
        const panelX = (ctx.canvas.width - this.width) / 2;
        const panelY = (ctx.canvas.height - this.height) / 2;

        // Draw a solid color rectangle first to completely cover grid lines
        ctx.fillStyle = 'rgb(20, 40, 20)';
        // Make the background rectangle larger to cover all the text
        ctx.fillRect(panelX - 20, panelY - 20, this.width + 40, this.height + 40);

        // White text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Settings', panelX + this.width/2, panelY + 40);

        ctx.font = 'bold 20px Arial';
        ctx.fillText('CONTROLS', panelX + this.width/2, panelY + 80);

        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        const controls = [
            'Movement: WASD',
            'Build Mode: B',
            'Quick Heal: F',
            'Attack: Space',
            'Pause: ESC'
        ];

        controls.forEach((control, index) => {
            ctx.fillText(control, panelX + 30, panelY + 120 + (index * 35));
        });

        ctx.restore();
    }
}
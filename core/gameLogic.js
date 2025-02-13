class GameLogic {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.width = 200;
        this.height = 250;

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
                width: ${this.width}px;
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

        this.gearButton.addEventListener('mouseover', () => {
            this.gearButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        this.gearButton.addEventListener('mouseout', () => {
            this.gearButton.style.backgroundColor = 'transparent';
        });

        this.gearButton.addEventListener('click', () => {
            this.toggleMenu();
        });

        document.body.appendChild(this.gearButton);
    }

    toggleMenu() {
        this.active = !this.active;
        if (this.audioControls) {
            this.audioControls.style.display = this.active ? 'block' : 'none';
        }
    }

    update() {
        // Update logic if needed
    }

    draw(ctx) {
        // We'll position based on the canvas size when we actually draw
        if (ctx && !this.positioned) {
            this.x = ctx.canvas.width - this.width - 10;
            this.y = 10;
            this.positioned = true;
        }
    }
}
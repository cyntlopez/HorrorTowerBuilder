import { Game } from './game.js';

export class MenuScreen {
    constructor() {
        this.menuDiv = document.createElement('div');
        this.setupMenuStyles();
        this.createTitle();
        this.createButtons();
        this.addBackgroundMusic();
    }

    setupMenuStyles() {
        this.menuDiv.style.cssText = `
            position: absolute;
            width: 800px;
            height: 800px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 20px;
            background: black;
            border: 1px solid #333;
        `;
    }

    createTitle() {
        const title = document.createElement('h1'); 
        title.textContent = 'Horror Tower Builder'; 
        title.style.cssText = `
            font-size: 36px;
            color: red;
            margin-bottom: 20px;
        `;
        this.menuDiv.appendChild(title);
    }

    createButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 30px;
        `;

        for (let i = 1; i <= 3; i++) {
            const button = document.createElement('button');
            button.textContent = `Level ${i}`;
            button.style.cssText = `
                padding: 15px 30px;
                width: 200px;
                font-size: 18px;
                background: #333;
                color: white;
                border: none;
                cursor: pointer;
                transition: background 0.3s;
            `;

            button.onmouseover = () => button.style.background = '#444';
            button.onmouseout = () => button.style.background = '#333';

            button.onclick = () => {
                this.startLevel(i);
            };

            buttonContainer.appendChild(button);
        }

        this.menuDiv.appendChild(buttonContainer);
    }

    addBackgroundMusic() {
        this.backgroundMusic = new Audio('audio/title-screen-music.wav');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5;

        const musicButton = document.createElement('button');
        musicButton.textContent = 'Listen to Music';
        musicButton.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #333;
            color: white;
            border: none;
            cursor: pointer;
        `;

    musicButton.onmouseover = () => (musicButton.style.background = '#444');
    musicButton.onmouseout = () => (musicButton.style.background = '#333');

    musicButton.onclick = () => {
        this.backgroundMusic
            .play()
            .then(() => {
                console.log('Music is playing');
                musicButton.textContent = 'Music is Playing';
                musicButton.disabled = true;
                musicButton.style.cursor = 'not-allowed';
                musicButton.style.opacity = '0.7';
            })
            .catch((error) => {
                console.error('Failed to play music:', error);
            });
    };

        this.menuDiv.appendChild(musicButton);
    }


    show() {
        document.body.appendChild(this.menuDiv);
    }

    hide() {
        this.menuDiv.remove();
    }

    startLevel(level) {
        this.hide();
        const game = new Game(level);
        game.start();
    }
}
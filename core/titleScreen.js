class TitleScreen {
    constructor(game, gameSetting, ctx, camera, enemySpawner) {
        Object.assign(this, {game, ctx, camera, enemySpawner});
        this.setting = gameSetting;
        this.menuDiv = document.createElement('div');
        this.setupMenuStyles();
        this.createTitle();
        this.createButtons();
        this.show();


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
            border: 1px solid #333;
        `;
    }

    createTitle() {
        const title = document.createElement('img');
        title.src = "assets/sprites/resources/title.png";

        title.width = 550;
        title.height = 150;

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

            const button = document.createElement('button');
            button.textContent = `Play`;
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
                this.startLevel();
            };

            buttonContainer.appendChild(button);

        this.menuDiv.appendChild(buttonContainer);
    }

    show() {
        document.body.appendChild(this.menuDiv);
    }

    hide() {
        this.menuDiv.remove();
    }

    startLevel() {
        this.hide();
        this.game.init(this.ctx, this.camera, this.enemySpawner);
        this.game.start();
        this.game.settings.timerPaused = false;
        this.setting.startTimer();
        setTimeout(() => document.getElementById("gameWorld").focus(), 0);
        ASSET_MANAGER.playAsset("assets/audio/music/level-2-music.wav");
    }
}
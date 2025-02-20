

const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("assets/sprites/hero/hero_walking.png");
ASSET_MANAGER.queueDownload("assets/sprites/hero/hero_dying.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/cabin.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/tree.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/campfire.png")
ASSET_MANAGER.queueDownload("assets/sprites/pumpkin_head/killer_walk.png");
ASSET_MANAGER.queueDownload("assets/sprites/pumpkin_head/killer_attack.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/grass.png");

ASSET_MANAGER.queueDownload("assets/audio/music/title-screen-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/music/title-screen-music2.wav");
ASSET_MANAGER.queueDownload("assets/audio/music/level-1-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/music/level-2-music.wav");

ASSET_MANAGER.queueDownload("assets/audio/effects/Grass_walk5.wav");


ASSET_MANAGER.downloadAll(() => {

    const canvas = document.getElementById("gameWorld");

    // Helps refocus the camera after iterating with audio.
    function refocusCanvas() {
        setTimeout(() => canvas.focus(), 50);
    }

    document.getElementById("playMusic").addEventListener("click", () => {
        const selectedTrack = document.getElementById("trackSelector").value;
        ASSET_MANAGER.playAsset(selectedTrack);
        refocusCanvas();
    });

    document.getElementById("stopMusic").addEventListener("click", () => {
        ASSET_MANAGER.stopMusic();
        refocusCanvas();
    });

    document.getElementById("muteMusic").addEventListener("click", () => {
        const selectedTrack = document.getElementById("trackSelector").value;
        ASSET_MANAGER.muteAudio(selectedTrack);
        refocusCanvas();
    });

    document.getElementById("volume").addEventListener("input", (event) => {
        const volumeLevel = event.target.value;
        ASSET_MANAGER.adjustVolume(volumeLevel);
        refocusCanvas();
    });

    document.getElementById("trackSelector").addEventListener("change", refocusCanvas);

    const loseScreen = new LoseScreen(gameEngine);
    gameEngine.loseScreen = loseScreen;

    canvas.setAttribute("tabindex","0");
    const ctx = canvas.getContext("2d");

    const grass = ASSET_MANAGER.getAsset("assets/sprites/landscape/grass.png");
    const tilemap = new TileMap(20, 20, 40, gameEngine, grass);

    const heroWalking = ASSET_MANAGER.getAsset("assets/sprites/hero/hero_walking.png");
    const player = new Hero(gameEngine, 50, 50, heroWalking, tilemap);

    const camera = new Camera(gameEngine, player, canvas.width, canvas.height);

    const enemyWalking = ASSET_MANAGER.getAsset("assets/sprites/pumpkin_head/killer_walk.png");
    const enemySpawner = new EnemySpawner(gameEngine, tilemap, player, enemyWalking);

    const cabin = ASSET_MANAGER.getAsset("assets/sprites/landscape/cabin.png");
    const cabinBase = new Cabin(gameEngine, 100, 100, cabin);

    const gameSetting = new Settings(gameEngine)
    const minimap = new Minimap(gameEngine);
    const resourceBar = new ResourceBar(gameEngine);

    const originalDraw = gameEngine.draw.bind(gameEngine);
    gameEngine.draw = function () {
        tilemap.draw(ctx, this.mouse, player.validPlacementTiles);
        originalDraw();

        if (loseScreen.active) {
            loseScreen.draw(ctx);
        }
    };

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        camera.adjustZoom(e.deltaY > 0 ? -0.1 : 0.1);
    });

    gameEngine.addEntity(cabinBase);
    gameEngine.addEntity(tilemap);
    gameEngine.addEntity(gameSetting);
    gameEngine.addEntity(player);
    gameEngine.addEntity(tilemap);
    gameEngine.addEntity(resourceBar);
    gameEngine.addEntity(minimap);

    const menuScreen = new MenuScreen();
    menuScreen.show();

    menuScreen.startLevel = function() {
        menuScreen.hide();
        gameEngine.init(ctx, camera, enemySpawner);
        gameEngine.start();
        setTimeout(() => canvas.focus(), 0);
    }
});
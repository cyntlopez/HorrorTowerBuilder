const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("assets/sprites/hero/hero_walking.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/cabin.png");

ASSET_MANAGER.queueDownload("assets/audio/title-screen-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/title-screen-music2.wav");


ASSET_MANAGER.downloadAll(() => {

    document.getElementById("playMusic").addEventListener("click", () => {
        const selectedTrack = document.getElementById("trackSelector").value;
        ASSET_MANAGER.playAsset(selectedTrack);
    });

    document.getElementById("stopMusic").addEventListener("click", () => {
        ASSET_MANAGER.stopMusic();
    });

    document.getElementById("muteMusic").addEventListener("click", () => {
        const selectedTrack = document.getElementById("trackSelector").value;
        ASSET_MANAGER.muteAudio(selectedTrack);
    });

    document.getElementById("volume").addEventListener("input", (event) => {
        const volumeLevel = event.target.value;
        ASSET_MANAGER.adjustVolume(volumeLevel);
    });

    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    const tilemap = new TileMap(20, 20, 40);

    const heroWalking = ASSET_MANAGER.getAsset("assets/sprites/hero/hero_walking.png");
    const player = new Hero(gameEngine, 50, 50, heroWalking, tilemap);

    const camera = new Camera(gameEngine, player, canvas.width, canvas.height);

    const enemySpawner = new EnemySpawner(gameEngine, tilemap, player);

    gameEngine.addEntity(player);
    gameEngine.addEntity(tilemap);

    const originalDraw = gameEngine.draw.bind(gameEngine);
    gameEngine.draw = function () {
        tilemap.draw(ctx, this.mouse, player.validPlacementTiles); // Pass valid tiles
        originalDraw();
    };

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        camera.adjustZoom(e.deltaY > 0 ? -0.1 : 0.1);
    });

    const cabin = ASSET_MANAGER.getAsset("assets/sprites/landscape/cabin.png");
    gameEngine.addEntity(new Cabin(gameEngine, 300, 250, cabin));

    gameEngine.init(ctx, camera, enemySpawner);

    gameEngine.start();
});
const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("assets/sprites/hero/hero_walking.png");
ASSET_MANAGER.queueDownload("assets/sprites/hero/hero_dying.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/cabin.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/tree.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/campfire.png")
ASSET_MANAGER.queueDownload("assets/sprites/pumpkin_head/killer_walk.png");
ASSET_MANAGER.queueDownload("assets/sprites/pumpkin_head/killer_attack.png");


ASSET_MANAGER.queueDownload("assets/audio/title-screen-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/title-screen-music2.wav");
ASSET_MANAGER.queueDownload("assets/audio/level-1-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/level-2-music.wav");


ASSET_MANAGER.downloadAll(() => {

    const canvas = document.getElementById("gameWorld");

    const startMusic = () => {
        const defaultTrack = "assets/audio/title-screen-music.wav";
        ASSET_MANAGER.playAsset(defaultTrack);
        ASSET_MANAGER.adjustVolume(0.1);
        // Remove the listener after first interaction
        document.removeEventListener('click', startMusic);
        document.removeEventListener('keydown', startMusic);
    };
    // Helps refocus the camera after interating with audio.
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
    gameEngine.addEntity(loseScreen);

    canvas.setAttribute("tabindex","0");
    const ctx = canvas.getContext("2d");

    const tilemap = new TileMap(20, 20, 40, gameEngine);

    const heroWalking = ASSET_MANAGER.getAsset("assets/sprites/hero/hero_walking.png");
    const player = new Hero(gameEngine, 50, 50, heroWalking, tilemap);

    const camera = new Camera(gameEngine, player, canvas.width, canvas.height);

    const enemyWalking = ASSET_MANAGER.getAsset("assets/sprites/pumpkin_head/killer_walk.png");
    const enemySpawner = new EnemySpawner(gameEngine, tilemap, player, enemyWalking);
    gameEngine.addEntity(tilemap);

    const gameSetting = new Settings(gameEngine)
    const minimap = new Minimap(gameEngine);
    const resourceBar = new ResourceBar(gameEngine);

    gameEngine.addEntity(resourceBar);
    gameEngine.addEntity(gameSetting)
    gameEngine.addEntity(minimap);

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
    gameEngine.addEntity(new Cabin(gameEngine, 600, 10, cabin));


    gameEngine.init(ctx, camera, enemySpawner);
    gameEngine.start();
});
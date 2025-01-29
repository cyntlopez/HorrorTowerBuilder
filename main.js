const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("assets/hero/hero_walking.png");
ASSET_MANAGER.queueDownload("assets/landscape/cabin.png");

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    const tilemap = new TileMap(20, 20, 40);

    const heroWalking = ASSET_MANAGER.getAsset("assets/hero/hero_walking.png");
    const player = new Hero(gameEngine, 50, 50, heroWalking, tilemap);

    const camera = new Camera(gameEngine, player, canvas.width, canvas.height);

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

    const cabin = ASSET_MANAGER.getAsset("assets/landscape/cabin.png");
    gameEngine.addEntity(new Cabin(gameEngine, 300, 250, cabin));

    gameEngine.init(ctx, camera);

    gameEngine.start();
});
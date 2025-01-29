const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("assets/hero/hero_walking.png");
ASSET_MANAGER.queueDownload("assets/landscape/cabin.png");

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    const heroWalking = ASSET_MANAGER.getAsset("assets/hero/hero_walking.png");
    gameEngine.addEntity(new Hero(gameEngine, 50, 50, heroWalking));

    const cabin = ASSET_MANAGER.getAsset("assets/landscape/cabin.png");
    gameEngine.addEntity(new Cabin(gameEngine, 200, 500, cabin));

    gameEngine.init(ctx);

    gameEngine.start();
});
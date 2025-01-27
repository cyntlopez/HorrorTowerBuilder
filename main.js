const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("assets/hero/hero_walking.png");

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    const heroSpritesheet = ASSET_MANAGER.getAsset("assets/hero/hero_walking.png");
    gameEngine.addEntity(new Hero(gameEngine, 10, 10, heroSpritesheet));

    gameEngine.init(ctx);

    gameEngine.start();
});
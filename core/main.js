const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// Sprites
ASSET_MANAGER.queueDownload("assets/sprites/hero/hero_walking.png");
ASSET_MANAGER.queueDownload("assets/sprites/hero/hero_running.png");
ASSET_MANAGER.queueDownload("assets/sprites/hero/hero_dying.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/cabin.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/tree.png");
ASSET_MANAGER.queueDownload("assets/sprites/pumpkin_head/killer_walk.png");
ASSET_MANAGER.queueDownload("assets/sprites/pumpkin_head/killer_attack.png");
ASSET_MANAGER.queueDownload("assets/sprites/landscape/grass.png");
ASSET_MANAGER.queueDownload("assets/sprites/pig_boss/pig_running.png");

// Resources
ASSET_MANAGER.queueDownload("assets/sprites/resources/wood.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/campfire.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/energy_drink_static.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/stone.png");

// Buildings
ASSET_MANAGER.queueDownload("assets/sprites/resources/totem.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/campfire.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/mage.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/ghost.png");
ASSET_MANAGER.queueDownload("assets/sprites/resources/grave.png");

// Music
ASSET_MANAGER.queueDownload("assets/audio/music/title-screen-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/music/title-screen-music2.wav");
ASSET_MANAGER.queueDownload("assets/audio/music/level-1-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/music/level-2-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/music/Track-5-music.wav");
ASSET_MANAGER.queueDownload("assets/audio/music/Track-6-music.wav");

// Effects
ASSET_MANAGER.queueDownload("assets/audio/effects/Grass_walk5.wav");
ASSET_MANAGER.queueDownload("assets/audio/effects/killer-slash.wav");
ASSET_MANAGER.queueDownload("assets/audio/effects/enemySpawn.wav");
ASSET_MANAGER.queueDownload("assets/audio/effects/enemy_entrance.wav");

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");

    // Auto-start music function from left snippet
    const startMusic = () => {
        const defaultTrack = "assets/audio/music/title-screen-music.wav";
        ASSET_MANAGER.playAsset(defaultTrack);
        ASSET_MANAGER.adjustVolume(0.1);
        document.removeEventListener('click', startMusic);
        document.removeEventListener('keydown', startMusic);
    };

    // Helps refocus the canvas after interacting with audio
    function refocusCanvas() {
        setTimeout(() => canvas.focus(), 50);
    }

    // Audio control event listeners (combining both)
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

    // Effect volume control from right snippet
    document.getElementById("effectVolume").addEventListener("input", (event) => {
        const effectLevel = event.target.value;
        ASSET_MANAGER.adjustEffect(effectLevel);
        refocusCanvas();
    });

    document.getElementById("trackSelector").addEventListener("change", refocusCanvas);

    document.getElementById("enemySpawnToggle").addEventListener("change", (event) => {
        gameSetting.toggleSoundEffect('enemySpawn');
        refocusCanvas();
    });
    
    document.getElementById("enemySlashToggle").addEventListener("change", (event) => {
        gameSetting.toggleSoundEffect('enemySlash');
        refocusCanvas();
    });

    document.getElementById("walkingToggle").addEventListener("change", (event) => {
        gameSetting.toggleSoundEffect('walking');
        // If turning off walking sound, stop it if it's currently playing
        if (!event.target.checked && player.currentWalkSound) {
            player.currentWalkSound.pause();
            player.currentWalkSound.currentTime = 0;
            player.isWalking = false;
        }
        refocusCanvas();
    });

    // Game setup
    const loseScreen = new LoseScreen(gameEngine);
    gameEngine.loseScreen = loseScreen;

    canvas.setAttribute("tabindex", "0");
    const ctx = canvas.getContext("2d");

    // Important: Fix the TileMap creation by providing the grass spritesheet
    const grass = ASSET_MANAGER.getAsset("assets/sprites/landscape/grass.png");
    const tree = ASSET_MANAGER.getAsset("assets/sprites/landscape/tree.png")
    const tilemap = new TileMap(20, 20, 40, gameEngine, grass, tree);

    const heroWalking = ASSET_MANAGER.getAsset("assets/sprites/hero/hero_walking.png");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const player = new Hero(gameEngine, centerX, centerY, heroWalking, tilemap);

    const camera = new Camera(gameEngine, player, canvas.width, canvas.height);

    const enemyWalking = ASSET_MANAGER.getAsset("assets/sprites/pumpkin_head/killer_walk.png");
    const enemySpawner = new EnemySpawner(gameEngine, tilemap, player, enemyWalking);

    const cabin = ASSET_MANAGER.getAsset("assets/sprites/landscape/cabin.png");
    const gameSetting = new Settings(gameEngine);
    gameEngine.settings = gameSetting;
    ASSET_MANAGER.setSettings(gameSetting);
    const minimap = new Minimap(gameEngine);
    const resourceBar = new ResourceBar(gameEngine);

    // Draw override
    const originalDraw = gameEngine.draw.bind(gameEngine);
    gameEngine.draw = function() {
        tilemap.draw(ctx, this.mouse, player.validPlacementTiles);
        originalDraw();

        if (loseScreen.active) {
            loseScreen.draw(ctx);
        }
    };

    // Zoom event listener
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        camera.adjustZoom(e.deltaY > 0 ? -0.1 : 0.1);
    });

    // Add entities - ensuring no duplicates
    gameEngine.addEntity(tilemap);  // Only add tilemap once!
    gameEngine.addEntity(new Cabin(gameEngine, 350, 300, cabin));
    gameEngine.addEntity(gameSetting);
    gameEngine.addEntity(player);
    gameEngine.addEntity(resourceBar);
    gameEngine.addEntity(minimap);

    // Create title screen
    new TitleScreen(gameEngine, ctx, camera, enemySpawner);
});
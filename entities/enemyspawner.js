
class EnemySpawner {
    constructor(game, tilemap, player, spritesheet) {
        this.game = game;
        this.tileMap = tilemap;
        this.player = player;
        this.spritesheet = spritesheet;

        this.spawnInterval = 5;
        this.lastSpawnTime = 0;

        //this.isSoundPlaying = false;
        this.enemySpawnPath = "assets/audio/effects/enemy_entrance.wav";
        this.spawnSoundPool = ASSET_MANAGER.createAudioPool(this.enemySpawnPath, 3);
    }

    update() {
        if (this.game.timer.gameTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnEnemy();
            this.lastSpawnTime = this.game.timer.gameTime;
        }
    }

    spawnEnemy() {
        const edge = Math.floor(Math.random() * 4); // spawn enemies at random edge
        let x, y;
        const mapSize = this.tileMap.rows * this.tileMap.tileSize;

        switch (edge) {
            case 0: // top edge
                x = Math.random() * mapSize;
                y = -20;
                break;
            case 1: // bottom edge
                x = Math.random() * mapSize;
                y = mapSize + 20;
                break;
            case 2: // left edge
                x = -20;
                y = Math.random() * mapSize;
                break;
            case 3: // right edge
                x = mapSize + 20;
                y = Math.random() * mapSize;
                break;
        }

        const targetX = this.tileMap.cols * this.tileMap.tileSize / 2;
        const targetY = this.tileMap.rows * this.tileMap.tileSize / 2;

        const enemy = new Enemy(this.game, x, y, targetX, targetY, this.tileMap, this.player, this.spritesheet);
        this.game.addEntity(enemy);
        console.log("Spawned enemy at (${x}, ${y}) targeting (${targetX}, ${targetY})")

        //  // Only play sound if it's not already playing
        //  if (!this.isSoundPlaying) {
        //     // Make sure to get the sound before going to the if statement.
        //     const sound = ASSET_MANAGER.getAsset(this.enemySpawnPath);
        //     if (sound) {
        //         sound.loop = false;
        //         this.isSoundPlaying = true;
                
        //         // Set up the ended event listener
        //         const onSoundEnd = () => {
        //             this.isSoundPlaying = false;
        //             sound.removeEventListener('ended', onSoundEnd);
        //         };
                
        //         sound.addEventListener('ended', onSoundEnd);
        //         ASSET_MANAGER.playSoundEffect(this.enemySpawnPath);
        //     }
        // }

        ASSET_MANAGER.playFromPool(this.spawnSoundPool);
    }
}


class EnemySpawner {
    constructor(game, tileMap, player, spritesheet) {
        this.game = game;
        this.tileMap = tileMap;
        this.player = player;
        this.spritesheet = spritesheet;
      
        this.spawnInterval = 5;
        this.lastSpawnTime = 0;

        //this.isSoundPlaying = false;
        this.enemySpawnPath = "assets/audio/effects/enemy_entrance.wav";
        this.spawnSoundPool = ASSET_MANAGER.createAudioPool(this.enemySpawnPath, 4);
        this.waveNumber = 1;
        this.enemiesRemaining = 0;
        this.timeBetweenWaves = 10; // Seconds
        this.lastWaveEndTime = 0;
        this.spawning = false;
    }

    update() {
        const currentTime = this.game.timer.gameTime;

        // If all enemies are dead, start the next wave after delay
        if (this.enemiesRemaining <= 0 && !this.spawning) {
            if (currentTime - this.lastWaveEndTime >= this.timeBetweenWaves) {
                this.startNextWave();
            }
        }
    }

    startNextWave() {
        console.log(`Starting Wave ${this.waveNumber}`);

        this.spawning = true;
        const enemiesToSpawn = 5 + this.waveNumber * 2; // Increase enemies per wave

        this.enemiesRemaining = enemiesToSpawn;
        let enemiesSpawned = 0;

        // Spawn enemies gradually
        const spawnInterval = setInterval(() => {
            if (enemiesSpawned < enemiesToSpawn) {
                this.spawnEnemy();
                enemiesSpawned++;
            } else {
                clearInterval(spawnInterval);
                this.spawning = false;
                this.lastWaveEndTime = this.game.timer.gameTime;
                this.waveNumber++;
                console.log(`Wave ${this.waveNumber - 1} Complete!`);
            }
        }, 1000); // Spawn every second
    }

    spawnEnemy() {
        const edge = Math.floor(Math.random() * 4); // Random edge
        let x, y;
        const mapSize = this.tileMap.rows * this.tileMap.tileSize;

        switch (edge) {
            case 0: x = Math.random() * mapSize; y = -20; break;      // Top edge
            case 1: x = Math.random() * mapSize; y = mapSize + 20; break; // Bottom edge
            case 2: x = -20; y = Math.random() * mapSize; break;      // Left edge
            case 3: x = mapSize + 20; y = Math.random() * mapSize; break; // Right edge
        }

        const enemy = new Enemy(
            this.game,
            x,
            y,
            this.tileMap.cols * this.tileMap.tileSize / 2,
            this.tileMap.rows * this.tileMap.tileSize / 2,
            this.tileMap,
            this.player,
            this.spritesheet
        );

        // Scale health and speed with wave
        enemy.health = 100 + this.waveNumber * 10;
        enemy.speed = 50 + this.waveNumber * 2;

        this.game.addEntity(enemy);

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

        if (ASSET_MANAGER.settings.isSoundEffectEnabled('enemySpawn')) {
            ASSET_MANAGER.playFromPool(this.spawnSoundPool, 'enemySpawn');
        }
        console.log(`Spawned enemy at (${x}, ${y}) with ${enemy.health} HP.`);
    }

    enemyDefeated() {
        this.enemiesRemaining--;
        console.log(`Enemy defeated! ${this.enemiesRemaining} remaining.`);
    }

    draw(ctx) {
    }
}

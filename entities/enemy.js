class Enemy {
    constructor(game, x, y, targetX, targetY, tilemap, player, spritesheet) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.tileMap = tilemap;
        this.player = player;
        this.spritesheet = spritesheet;
        this.facing = 0; // 0 = down, 1 = up, 2 = left, 3 = right
        this.state = 0; // 0 = walking, 1 = attacking

        this.speed = 50;
        this.health = 100;
        this.attackPower = 10;
        this.attackRange = 20;
        this.attackCooldown = 1;
        this.lastAttackTime = 0;
        this.separationDistance = 25;

        this.removeFromWorld = false;

        this.animation = [];
        this.loadAnimation();
    }

    loadAnimation() {
        for (let i = 0; i < 2; i++) { // 2 states
            this.animation.push([]);
            for (let j = 0; j < 4; j++) { // 4 facing directions
                this.animation[i].push([]);
            }
        }

        // walking animation for state = 0
        // facing down = 0
        this.animation[0][0] = new Animator(this.spritesheet, 0, 129, 64, 64.5, 9, 0.1, 0, false, true);

        // facing up = 1
        this.animation[0][1] = new Animator(this.spritesheet, 1, 1, 64, 64.5, 9, 0.1, 0, false, true);

        // facing left = 2
        this.animation[0][2] = new Animator(this.spritesheet, 0, 71, 64, 64.5, 9, 0.1, 0, false, true);

        // facing right = 3
        this.animation[0][3] = new Animator(this.spritesheet, 0, 195, 64, 64.5, 9, 0.1, 0, false, true);


        // attacking animation for state = 1
        // facing down = 0
        const attackSpriteSheet = ASSET_MANAGER.getAsset("assets/sprites/pumpkin_head/killer_attack.png");

        this.animation[1][0] = new Animator(attackSpriteSheet, 0, 138, 64, 64.5, 6, 0.1, 0,false, true);

            // facing up = 1
        this.animation[1][1] = new Animator(attackSpriteSheet, 1, 1, 64, 64.5, 6, 0.1, 0,false, true);

            // facing left = 2
        this.animation[1][2] = new Animator(attackSpriteSheet, 0, 69, 64, 64.5, 6, 0.1, 0,false, true);

            // facing right = 3
        this.animation[1][3] = new Animator(attackSpriteSheet, 0, 200, 64, 64.5, 6, 0.1, 0,false, true);

    }

    update() {
        if (this.health <= 0) {
            this.removeFromWorld = true;
            return;
        }

        const nearestBuilding = this.findNearestBuilding();
        if (nearestBuilding) {
            const dx = (nearestBuilding.col * this.tileMap.tileSize + this.tileMap.tileSize / 2) - this.x;
            const dy = (nearestBuilding.row * this.tileMap.tileSize + this.tileMap.tileSize / 2) - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.attackRange) {
                // Move towards the building
                this.state = 0;
                this.x += (dx / distance) * this.speed * this.game.clockTick;
                this.y += (dy / distance) * this.speed * this.game.clockTick;

            } else {
                // Attack the building if in range
                this.state = 1;
                this.attack(nearestBuilding);
            }
        } else {
            this.state = 0;
            this.moveToward(this.player.x, this.player.y);

            if (this.isInAttackRange(this.player.x, this.player.y)) {
                this.state = 1;
                this.attackPlayer();
            }
        }
        this.avoidOtherEnemies();
    }

    findNearestBuilding() {
        let closestBuilding = null;
        let closestDistance = Infinity;

        for (let row = 0; row < this.tileMap.rows; row++) {
            for (let col = 0; col < this.tileMap.cols; col++) {
                const building = this.tileMap.grid[row][col];
                if (building) {
                    const dx = (col * this.tileMap.tileSize + this.tileMap.tileSize / 2) - this.x;
                    const dy = (row * this.tileMap.tileSize + this.tileMap.tileSize / 2) - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < closestDistance) {
                        closestBuilding = building;
                        closestDistance = distance;
                    }
                }
            }
        }
        return closestBuilding;
    }

    moveToward(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.attackRange) {
            this.x += (dx / distance) * this.speed * this.game.clockTick;
            this.y += (dy / distance) * this.speed * this.game.clockTick;

            if (Math.abs(dx) > Math.abs(dy)) { // handles facing
                if (dx > 0) {
                    this.facing = 3; // right
                } else {
                    this.facing = 2; // left
                }
            } else {
                if (dy > 0) {
                    this.facing = 0; // down
                } else {
                    this.facing = 1; // up
                }
            }
        }
    }

    isInAttackRange(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.attackRange;
    }

    avoidOtherEnemies() {
        let moveX = 0, moveY = 0;
        let count = 0;

        for (let entity of this.game.entities) {
            if (entity instanceof Enemy && entity !== this) {
                const dx = this.x - entity.x;
                const dy = this.y - entity.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.separationDistance) {
                    moveX += dx / distance;
                    moveY += dy / distance;
                    count++;
                }
            }
        }
        if (count > 0) {
            this.x += (moveX / count) * this.speed * this.game.clockTick * 0.5; // Move away slightly
            this.y += (moveY / count) * this.speed * this.game.clockTick * 0.5;
        }
    }

    attack(building) {
        if (this.game.timer.gameTime - this.lastAttackTime >= this.attackCooldown) {
            building.health -= this.attackPower;
            console.log(`Enemy attacked building at (${building.row}, ${building.col}). Health: ${building.health}`);

            if (building.health <= 0) {
                this.tileMap.grid[building.row][building.col] = null; // Remove destroyed building
                console.log("Building destroyed!");
            }

            this.lastAttackTime = this.game.timer.gameTime;
        }
    }

    attackPlayer() {
        if (this.game.timer.gameTime - this.lastAttackTime >= this.attackCooldown) {
            this.player.health -= this.attackPower;
            console.log(`Enemy attacked the player! Player health: ${this.player.health}`);

            if (this.player.health <= 0) {
                console.log("Player is dead!");
            }

            this.lastAttackTime = this.game.timer.gameTime;
        }
    }

    takeDamage(damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        const enemyWidth = 64;
        const enemyHeight = 64;

        const offsetX = enemyWidth / 2;
        const offsetY = enemyHeight / 2;

        const drawX = this.x - offsetX;
        const drawY = this.y - offsetY;

        this.animation[this.state][this.facing].drawFrame(this.game.clockTick, ctx, drawX, drawY, 1);

        // Draw health bar
        ctx.fillStyle = "rgba(57, 255, 20, 1)";
        ctx.fillRect(this.x - 10, this.y - 25, (20 * this.health) / 100, 4);
    }
}
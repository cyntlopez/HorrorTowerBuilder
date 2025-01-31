class Enemy {
    constructor(game, x, y, targetX, targetY, tilemap, player) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.tileMap = tilemap;
        this.player = player;

        this.speed = 50;
        this.health = 100;
        this.attackPower = 10;
        this.attackRange = 20;
        this.attackCooldown = 1;
        this.lastAttackTime = 0;
        this.separationDistance = 25;

        this.removeFromWorld = false;
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
                this.x += (dx / distance) * this.speed * this.game.clockTick;
                this.y += (dy / distance) * this.speed * this.game.clockTick;
            } else {
                // Attack the building if in range
                this.attack(nearestBuilding);
            }
        } else {
            this.moveToward(this.player.x, this.player.y);

            if (this.isInAttackRange(this.player.x, this.player.y)) {
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
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar
        ctx.fillStyle = "green";
        ctx.fillRect(this.x - 10, this.y - 15, (20 * this.health) / 100, 3);

    }
}
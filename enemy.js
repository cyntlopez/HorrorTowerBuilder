class Enemy {
    constructor(game, x, y, targetX, targetY, tilemap) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.tileMap = tilemap;

        this.speed = 50;
        this.health = 100;
        this.attackPower = 10;
        this.attackRange = 20;
        this.attackCooldown = 1;
        this.lastAttackTime = 0;

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
        }
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

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}
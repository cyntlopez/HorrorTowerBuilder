class Building {
    constructor(row, col, tileMap, tileSize) {
        this.row = row;
        this.col = col;
        this.tileMap = tileMap;
        this.width = tileSize;
        this.height = tileSize;

        this.removeFromWorld = false;

        this.health = 100;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.tileMap.grid[this.row][this.col] = null;
        this.removeFromWorld = true;
    }

    draw(ctx) {
        const x = this.col * this.width;
        const y = this.row * this.height;

        ctx.fillStyle = 'orange';
        ctx.fillRect(x, y, this.width, this.height);

        // Optional: Draw outline
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, this.width, this.height);

    }

    update() {

    }
}

class Wall extends Building {
    constructor(row, col, tileMap, tileSize) {
        super(row, col, tileMap, tileSize);
        this.health = 200;
    }

    draw(ctx) {
        const x = this.col * this.width;
        const y = this.row * this.height;

        ctx.fillStyle = "gray";
        ctx.fillRect(x, y, this.width, this.height);

        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, this.width, this.height);
    }
}

class ArcherTower extends Building {
    constructor(row, col, tileMap, tileSize) {
        super(row, col, tileMap, tileSize);
        this.range = 200;
        this.fireRate = 1.5;
        this.lastShotTime = 0;
    }

    update() {
        if (gameEngine.timer.gameTime - this.lastShotTime >= this.fireRate) {
            const target = this.findNearestEnemy();
            if (target) {
                this.shootArrow(target);
                this.lastShotTime = gameEngine.timer.gameTime;
            }
        }
    }

    findNearestEnemy() {
        let closestEnemy = null;
        let closestDistance = this.range;

        if (!gameEngine || !gameEngine.entities) {
            console.error("ArcherTower Error: gameEngine or entities undefined");
            return null;
        }

        for (let entity of gameEngine.entities) {
            if (entity instanceof Enemy) {
                const dx = entity.x - (this.col * this.width + this.width / 2);
                const dy = entity.y - (this.row * this.height + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < closestDistance) {
                    closestEnemy = entity;
                    closestDistance = distance;
                }
            }
        }
        return closestEnemy;
    }

    shootArrow(target) {
        console.log("Archer Tower fires an arrow!");

        const arrow = new Arrow(
            this.col * this.width + this.width / 2,
            this.row * this.height + this.height / 2,
            target
        );
        gameEngine.addEntity(arrow);
    }

    draw(ctx) {
        const x = this.col * this.width;
        const y = this.row * this.height;

        ctx.fillStyle = "brown";
        ctx.fillRect(x, y, this.width, this.height);

        ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
        ctx.beginPath();
        ctx.arc(x + this.width / 2, y + this.height / 2, this.range, 0, Math.PI * 2);
        ctx.stroke();
    }
}

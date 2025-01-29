class Hero {
    constructor(game, x, y, spritesheet, tileMap) {
        Object.assign(this, {game, x, y, spritesheet, tileMap});

        // hero's state variables
        this.facing = 0; // 0 = down, 1 = up, 2 = left, 3 = right
        this.state = 0; // 0 = idle, 1 = walking, 2 = running, 3 = throwing, 4 = dying
        this.speed = 85;
        this.dead = false;
        this.health = 100;
        this.removeFromWorld = false;

        // hero's animations
        this.animation = [];
        this.loadAnimation();

        // Building placement mode
        this.placementMode = false;
        this.placementRadius = 3; //Radius in tiles
        this.validPlacementTile = []; // List of tiles that can be highlighted

    }

    loadAnimation() {
        for (let i = 0; i < 5; i++) { // 4 states
            this.animation.push([]);
            for (let j = 0; j < 4; j++) { // 4 facing directions
                this.animation[i].push([]);
            }
        }

        // idle animation for state = 0
        // facing down = 0
        this.animation[0][0] = new Animator(this.spritesheet, 0, 129, 64, 64.5, 1, 0.1, 0,false, true);

        // facing up = 1
        this.animation[0][1] = new Animator(this.spritesheet, 0, 0, 64, 64.5, 1, 0.1, 0,false, true);

        // facing left = 2
        this.animation[0][2] = new Animator(this.spritesheet, 0, 68, 64, 64.5, 1, 0.1, 0,false, true);

        // facing right = 3
        this.animation[0][3] = new Animator(this.spritesheet, 0, 195, 64, 64.5, 1, 0.1, 0,false, true);

        // walk animation for state = 1
        // facing down = 0
        this.animation[1][0] = new Animator(this.spritesheet, 0, 129, 64, 64.5, 9, 0.1, 0,false, true);

        // facing up = 1
        this.animation[1][1] = new Animator(this.spritesheet, 0, 0, 64, 64.5, 9, 0.1, 0,false, true);

        // facing left = 2
        this.animation[1][2] = new Animator(this.spritesheet, 0, 68, 64, 64.5, 9, 0.1, 0,false, true);

        // facing right = 3
        this.animation[1][3] = new Animator(this.spritesheet, 0, 195, 64, 64.5, 9, 0.1, 0,false, true);

    }

    update() {
        if (this.health <= 0) {
            this.dead = true;
            console.log("Player died");
            return;
        }

        this.handleMovement();

        this.handlePlacementMode();

        /**
        if (this.game.up) {
            this.y -= this.speed * this.game.clockTick; // walk up
            this.facing = 1;
            this.state = 1;
        } else if (this.game.down) {
            this.y += this.speed * this.game.clockTick; // walk down
            this.facing = 0;
            this.state = 1;
        } else if (this.game.left) {
            this.x -= this.speed * this.game.clockTick; // walk left
            this.facing = 2;
            this.state = 1;
        } else if (this.game.right) {
            this.x += this.speed * this.game.clockTick; // walk right
            this.facing = 3;
            this.state = 1;
        } else {
            this.state = 0; // idle
        }
         */
    }

    handleMovement() {
        // Handle movement input
        const movementDeltas = {x : 0, y : 0};

        if (this.game.keys["w"] || this.game.keys["ArrowUp"]) movementDeltas.y -= 1;
        if (this.game.keys["a"] || this.game.keys["ArrowLeft"]) movementDeltas.x -= 1;
        if (this.game.keys["s"] || this.game.keys["ArrowDown"]) movementDeltas.y += 1;
        if (this.game.keys["d"] || this.game.keys["ArrowRight"]) movementDeltas.x += 1;

        // Normalize diagonal movement
        const magnitude = Math.sqrt(movementDeltas.x ** 2 + movementDeltas.y ** 2);
        if (magnitude > 0) {
            movementDeltas.x /= magnitude;
            movementDeltas.y /= magnitude;
        }

        // Update position
        this.x += movementDeltas.x * this.speed * this.game.clockTick;
        this.y += movementDeltas.y * this.speed * this.game.clockTick;

        // Update facing direction
        if (movementDeltas.y < 0) {
            this.facing = 1;
            this.state = 1;
        } else if (movementDeltas.y > 0) {
            this.facing = 0;
            this.state = 1;
        } else if (movementDeltas.x < 0) {
            this.facing = 2;
            this.state = 1;
        } else if (movementDeltas.x > 0) {
            this.facing = 3;
            this.state = 1;
        } else {
            this.state = 0;
        }

        // Handle canvas bounds
        this.x = Math.max(0, Math.min(this.x, this.game.ctx.canvas.width));
        this.y = Math.max(0, Math.min(this.y, this.game.ctx.canvas.height));
    }

    handlePlacementMode() {
        // Toggle building placement mode
        if (this.game.keys["b"]) {
            this.placementMode = !this.placementMode;
            this.game.keys["b"] = false; // Prevent toggling multiple times on a single press

            if (this.placementMode) {
                this.game.click = null; // resets click to maintain building bound
            }
        }

        // If in placement mode, calculate valid tiles
        if (this.placementMode) {
            this.calculateValidPlacementTiles();
        }

        // Handle building placement
        if (this.placementMode && this.game.click) {
            //Convert screen coordinates to world coordinates
            const camera = this.game.camera;
            const worldX = (this.game.click.x / camera.zoomLevel) + camera.x;
            const worldY = (this.game.click.y / camera.zoomLevel) + camera.y;

            const { row, col } = this.tileMap.screenToGrid(worldX, worldY);

            // Check if the clicked tile is valid
            if (this.validPlacementTiles.some(tile => tile.row === row && tile.col === col)) {
                const building = new Building(row, col, this.tileMap.tileSize);
                this.tileMap.placeBuilding(row, col, building);
                this.game.click = null; // Clear the click after placing the building
            }

            this.game.click = null;
        }
    }

    calculateValidPlacementTiles() {
        const playerTile = this.tileMap.screenToGrid(this.x, this.y);
        this.validPlacementTiles = [];

        // Iterate through tiles within the placement radius
        for (let r = playerTile.row - this.placementRadius; r <= playerTile.row + this.placementRadius; r++) {
            for (let c = playerTile.col - this.placementRadius; c <= playerTile.col + this.placementRadius; c++) {
                const distance = Math.sqrt(Math.pow(r - playerTile.row, 2) + Math.pow(c - playerTile.col, 2));

                if (distance <= this.placementRadius && this.tileMap.isCellEmpty(r, c)) {
                    this.validPlacementTiles.push({ row: r, col: c });
                }
            }
        }
    }

    draw(ctx) {
        const spriteWidth = 64;
        const spriteHeight = 64;

        const offsetX = spriteWidth / 2;
        const offsetY = spriteHeight / 2;

        const drawX = this.x - offsetX;
        const drawY = this.y - offsetY;

        this.animation[this.state][this.facing].drawFrame(this.game.clockTick, ctx, drawX, drawY, 1);

        // Draw the placement radius if in placement mode
        if (this.placementMode) {
            ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.placementRadius * this.tileMap.tileSize, 0, Math.PI * 2);
            ctx.stroke();
        }
    };
}
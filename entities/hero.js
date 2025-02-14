class Hero {
    constructor(game, x, y, spritesheet, tileMap) {
        Object.assign(this, {game, x, y, spritesheet, tileMap});

        // hero's state variables
        this.facing = 0; // 0 = down, 1 = up, 2 = left, 3 = right
        this.state = 0; // 0 = idle, 1 = walking, 2 = throwing, 3 = dying
        this.speed = 85;
        this.dead = false;
        this.health = 100;
        this.removeFromWorld = false;

        // Attack properties
        this.isAttacking = false;
        this.attackCooldown = 0.5;
        this.lastAttackTime = 0;
        this.attackRange = 40;
        this.attackDamage = 20;

        this.setupControls();

        // hero's animations
        this.animation = [];
        this.loadAnimation();

        // Building placement mode
        this.placementMode = false;
        this.placementRadius = 3; //Radius in tiles
        this.validPlacementTile = []; // List of tiles that can be highlighted

        this.walkingSoundPath = "assets/audio/effects/Grass_walk5.wav";
        this.isWalking = false;
    }

    setupControls() {
        window.addEventListener("load", () => {
            const canvas = this.game.ctx?.canvas;
            if (!canvas) {
                console.error("Error: Game canvas is not available!");
                return;
            }

            canvas.addEventListener("mousedown", () => {
                if (!this.placementMode) {
                    this.isAttacking = true;
                }
            });

            canvas.addEventListener("mouseup", () => {
                this.isAttacking = false;
            });

            console.log("Attack controls set up successfully.");
        });
    }

    loadAnimation() {
        for (let i = 0; i < 4; i++) { // 4 states
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

        // dying animation for state = 3
        // facing down = 0
        const dyingSheet = ASSET_MANAGER.getAsset("assets/sprites/hero/hero_dying.png");
        this.animation[3][0] = new Animator(dyingSheet, 0, 0, 64, 64.5, 6, 0.5, 0,false, false);

        // facing up = 1
        this.animation[3][1] = new Animator(dyingSheet, 0, 0, 64, 64.5, 6, 0.5, 0,false, false);

        // facing left = 2
        this.animation[3][2] = new Animator(dyingSheet, 0, 0, 64, 64.5, 6, 0.5, 0,false, false);

        // facing right = 3
        this.animation[3][3] = new Animator(dyingSheet, 0, 0, 64, 64.5, 6, 0.5, 0,false, false);

    }

    update() {
        if (this.health <= 0) {
            this.dead = true;
            this.state = 3;
            console.log("Player died");

            this.game.loseScreen.activate();

            return;
        }

        this.handleMovement();

        this.handlePlacementMode();

        if (this.isAttacking && (this.game.timer.gameTime - this.lastAttackTime) >= this.attackCooldown) {
            this.attack();
            this.lastAttackTime = this.game.timer.gameTime;
        }
    }

    handleMovement() {
        // Movement direction tracking
        const movementDeltas = { x: 0, y: 0 };
        let newFacing = this.facing; // Keep current facing direction by default

        const movingUp = this.game.keys["w"] || this.game.keys["ArrowUp"];
        const movingDown = this.game.keys["s"] || this.game.keys["ArrowDown"];
        const movingLeft = this.game.keys["a"] || this.game.keys["ArrowLeft"];
        const movingRight = this.game.keys["d"] || this.game.keys["ArrowRight"];

        // Apply movement but don't change facing if diagonal
        if (movingUp) movementDeltas.y -= 1;
        if (movingDown) movementDeltas.y += 1;
        if (movingLeft) movementDeltas.x -= 1;
        if (movingRight) movementDeltas.x += 1;

        // Normalize diagonal movement
        const magnitude = Math.sqrt(movementDeltas.x ** 2 + movementDeltas.y ** 2);
        if (magnitude > 0) {
            movementDeltas.x /= magnitude;
            movementDeltas.y /= magnitude;
        }

        // Apply movement
        this.x += movementDeltas.x * this.speed * this.game.clockTick;
        this.y += movementDeltas.y * this.speed * this.game.clockTick;

        // Update facing direction ONLY if moving in a single direction
        if ((movingUp || movingDown) && !(movingLeft || movingRight)) {
            newFacing = movingUp ? 1 : 0; // 1 = Up, 0 = Down
        } else if ((movingLeft || movingRight) && !(movingUp || movingDown)) {
            newFacing = movingLeft ? 2 : 3; // 2 = Left, 3 = Right
        }

        this.facing = newFacing;

        // Set animation state (1 = walking, 0 = idle)
        this.state = (magnitude > 0) ? 1 : 0;
        
        if (this.state == 1) {
            if (!this.isWalking) {
                ASSET_MANAGER.playSoundEffect(this.walkingSoundPath);
                this.isWalking = true;
            }
        } else {
            if (this.isWalking) {
                const sound = ASSET_MANAGER.getAsset(this.walkingSoundPath);
                if (sound) {
                    sound.pause();
                    sound.currentTime = 0;
                }
                this.isWalking = false;
            }
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
                const building = BuildingFactory.createBuilding(gameEngine.selectedBuilding, row, col, this.tileMap, this.tileMap.tileSize);

                if (building) {
                    this.tileMap.placeBuilding(row, col, building);
                    this.game.addEntity(building);
                    console.log(`${gameEngine.selectedBuilding} placed at (${row}, ${col})`);
                }
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

    attack() {
        console.log("Player attacking");

        let attackX = this.x;
        let attackY = this.y;

        if (this.facing === 0) attackY += this.attackRange; // Down
        else if (this.facing === 1) attackY -= this.attackRange; // Up
        else if (this.facing === 2) attackX -= this.attackRange; // Left
        else if (this.facing === 3) attackX += this.attackRange; // Right

        for (let entity of this.game.entities) {
            if (entity instanceof Enemy) {
                const dx = entity.x - attackX;
                const dy = entity.y - attackY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.attackRange) {
                    entity.takeDamage(this.attackDamage);
                    console.log("Enemy hit!");
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

        if (this.isAttacking) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            let attackX = this.x, attackY = this.y;
            if (this.facing === 0) attackY += this.attackRange;
            else if (this.facing === 1) attackY -= this.attackRange;
            else if (this.facing === 2) attackX -= this.attackRange;
            else if (this.facing === 3) attackX += this.attackRange;

            ctx.beginPath();
            ctx.arc(attackX, attackY, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        // Health bar
        if (this.health >= 0) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x - 20, this.y - 25, (40 * this.health) / 100, 5);
        }
    };
}
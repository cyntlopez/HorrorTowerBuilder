class Hero {
    constructor(game, x, y, spritesheet, tileMap, resourceBar) {
        Object.assign(this, {game, x, y, spritesheet, tileMap,resourceBar});

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
        this.currentWalkSound = null;
        this.visionRadius = 5;

        this.cabinFlag = false;
    }

    setupControls() {
        const trySetupControls = () => {
            const canvas = this.game.ctx?.canvas;
            if (!canvas) {
                setTimeout(trySetupControls, 100); // Retry the setupControls function itself after a delay
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
        };

        window.addEventListener("load", trySetupControls);
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
            ASSET_MANAGER.stopAllSoundEffects();
            this.game.loseScreen.activateLose();
            return;
        }

        this.handleMovement();

        this.handlePlacementMode();

        if (this.isAttacking && (this.game.timer.gameTime - this.lastAttackTime) >= this.attackCooldown) {
            this.attack();
            this.lastAttackTime = this.game.timer.gameTime;
        }

        this.updateFogOfWar();
    }

    updateFogOfWar() {
        const playerTile = this.tileMap.screenToGrid(this.x, this.y);
        this.tileMap.fogOfWarGrid = this.tileMap.fogOfWarGrid.map((row, rowIndex) =>
            row.map((visibility, colIndex) => {
                const distance = Math.sqrt(Math.pow(rowIndex - playerTile.row, 2) + Math.pow(colIndex - playerTile.col, 2));
                return distance <= this.visionRadius;
            })
        );
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

        if(this.x > 360 && this.x < 440 && this.y > 290 && this.y < 400){

            this.x -= movementDeltas.x * this.speed * this.game.clockTick;

            this.y -= movementDeltas.y * this.speed * this.game.clockTick;

        }

        // --- Tree and Stone Collision Check ---
        const entitiesToCheck = this.game.entities.filter(entity => entity instanceof Tree || entity instanceof Stone);

        for (let entity of entitiesToCheck) {
            const entityX = entity.x;
            const entityY = entity.y;
            const entityWidth = 40;
            const entityHeight = 40;

            // Calculate entity boundaries
            const entityLeft = entityX - entityWidth / 2;
            const entityRight = entityX + entityWidth / 2;
            const entityTop = entityY - entityHeight / 2;
            const entityBottom = entityY + entityHeight / 2;

            // Calculate player boundaries
            const playerLeft = this.x - 32; // Adjust 32 based on player size
            const playerRight = this.x + 32;
            const playerTop = this.y - 32;
            const playerBottom = this.y + 32;

            if (
                playerLeft < entityRight &&
                playerRight > entityLeft &&
                playerTop < entityBottom &&
                playerBottom > entityTop
            ) {
                // Collision detected, revert movement
                this.x -= movementDeltas.x * this.speed * this.game.clockTick;
                this.y -= movementDeltas.y * this.speed * this.game.clockTick;
            }
        }


        // Update facing direction ONLY if moving in a single direction
        if ((movingUp || movingDown) && !(movingLeft || movingRight)) {
            newFacing = movingUp ? 1 : 0; // 1 = Up, 0 = Down
        } else if ((movingLeft || movingRight) && !(movingUp || movingDown)) {
            newFacing = movingLeft ? 2 : 3; // 2 = Left, 3 = Right
        }

        this.facing = newFacing;

        // Set animation state (1 = walking, 0 = idle)
        this.state = (magnitude > 0) ? 1 : 0;
        
        // if (this.state === 1) {
        //     if (!this.isWalking) {
        //         ASSET_MANAGER.playSoundEffect(this.walkingSoundPath);
        //         this.isWalking = true;
        //     }
        // } else {
        //     if (this.isWalking) {
        //         const sound = ASSET_MANAGER.getAsset(this.walkingSoundPath);
        //         if (sound) {
        //             sound.pause();
        //             sound.currentTime = 0;
        //         }
        //         this.isWalking = false;
        //     }
        // }

        if (this.state === 1) {
            if (!this.isWalking && ASSET_MANAGER.settings.isSoundEffectEnabled('walking')) {
                this.currentWalkSound = ASSET_MANAGER.playSoundEffect(this.walkingSoundPath);
                this.isWalking = true;
            }
        } else {
            if (this.isWalking) {
                if (this.currentWalkSound) {
                    this.currentWalkSound.pause();
                    this.currentWalkSound.currentTime = 0;
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
            if (this.validPlacementTiles.some(tile => tile.row === row && tile.col === col) &&
                !this.isTileOnCabin(row, col)  &&
                !this.isTileOnResource(row, col)) {

                const building = BuildingFactory.createBuilding(gameEngine.selectedBuilding, row, col, this.tileMap, this.tileMap.tileSize);

                if (building && this.checkResources(gameEngine.selectedBuilding)) {
                    this.tileMap.placeBuilding(row, col, building);
                    this.game.addEntity(building);
                    this.consumeResources(building);
                }
            }

            this.game.click = null;
        }
    }

    checkResources() {
        let woodCost = 0;
        let stoneCost = 0;
        console.log(gameEngine.selectedBuilding);
        switch (gameEngine.selectedBuilding) {
            case "ArcherTower":
                woodCost = 1;
                stoneCost = 1;
                break;
            case "Wall":
                stoneCost = 2;
                break;
            case "Campfire":
                woodCost = 2;
                break;
            case "MageTower":
                woodCost = 2;
                stoneCost = 2;
                break;
            case "Totem":
                woodCost = 3;
                stoneCost = 3;
                break;
        }


        if (this.resourceBar.getResourceAmount(0) >= woodCost &&
            this.resourceBar.getResourceAmount(1) >= stoneCost) {
            return true;
        } else {
            return false;
        }
    }

    consumeResources() {
        let woodCost = 0;
        let stoneCost = 0;

        switch (gameEngine.selectedBuilding) {
            case "ArcherTower":
                woodCost = 1;
                stoneCost = 1;
                break;
            case "Wall":
                stoneCost = 2;
                break;
            case "Campfire":
                woodCost = 2;
                break;
            case "MageTower":
                woodCost = 2;
                stoneCost = 2;
                break;
            case "BombTower":
                woodCost = 3;
                stoneCost = 3;
                break;
        }

        this.resourceBar.setResourceAmount(0, this.resourceBar.getResourceAmount(0) - woodCost);
        this.resourceBar.setResourceAmount(1, this.resourceBar.getResourceAmount(1) - stoneCost);
    }

    isTileOnCabin(row, col) {
        if(row >= 7 && row <= 10 && col >= 9 && col <= 10) return true;
        return false; // No cabin found, so the tile is not on the cabin
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

    isTileOnResource(row, col) {
        const resources = this.game.entities.filter(entity => entity instanceof Tree || entity instanceof Stone);
        for (let resource of resources) {
            const resourceTile = this.tileMap.screenToGrid(resource.x, resource.y);

            // Check the 3x3 area around the resource tile
            for (let r = resourceTile.row - 1; r <= resourceTile.row + 1; r++) {
                for (let c = resourceTile.col - 1; c <= resourceTile.col + 1; c++) {
                    if (row === r && col === c) {
                        return true;
                    }
                }
            }
        }
        return false; // No resource found on this tile
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
            const dx = entity.x - attackX;
            const dy = entity.y - attackY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (entity instanceof Enemy) {
                if (distance < this.attackRange) {
                    entity.takeDamage(this.attackDamage);
                    console.log("Enemy hit!");
                }
            } else if (entity instanceof Tree) {
                if (distance < this.attackRange) {
                    this.resourceBar.incrementAmount(0);
                }
            } else if (entity instanceof Stone) {
                if (distance < this.attackRange) {
                    this.resourceBar.incrementAmount(1);
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

    nearCabin(){
        const cabinX = 350; // Use the provided cabinX
        const cabinY = 300; // Use the provided cabinY
        const cabinWidth = 95; // Use the provided cabinWidth
        const cabinHeight = 120; // Use the provided cabinHeight

        const cabinLeft = cabinX;
        const cabinRight = cabinX + cabinWidth;
        const cabinTop = cabinY;
        const cabinBottom = cabinY + cabinHeight;

        const playerLeft = this.x - 32; // Adjust 32 based on player size
        const playerRight = this.x + 32;
        const playerTop = this.y - 32;
        const playerBottom = this.y + 32;

        if (
            playerLeft < cabinRight &&
            playerRight > cabinLeft &&
            playerTop < cabinBottom &&
            playerBottom > cabinTop
        ) {
            this.cabinFlag = true;
        } else {
            this.cabinFlag = false;
        }
    }
}
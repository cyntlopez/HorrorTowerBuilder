class TileMap {
    constructor(rows, cols, tileSize, game, spritesheet) {
        this.rows = rows;
        this.spritesheet = spritesheet;
        this.cols = cols;
        this.tileSize = tileSize;
        this.state = 0; // 0 = lit fire, 1 = dying fire
        this.game = game;
        this.player = null;
        this.grid = Array.from({ length: rows }, () => Array(cols).fill(null));

        this.visibilityRadius = 5;
        this.fogOfWarGrid = Array.from({ length: rows }, () => Array(cols).fill(false));

        this.animation = [];
        this.loadAnimation();
    }

    loadAnimation() {
        for (let i = 0; i < 2; i++) { // 2 states
            this.animation.push([]);
        }

        // TODO: Change campfire image
        const campfireSpriteSheet = ASSET_MANAGER.getAsset("assets/sprites/resources/campfire.png");

        this.animation[0] = new Animator(campfireSpriteSheet, 2, 2, 64.1, 63, 6, 0.5, 0,false, true);

    }

    update() {

    }

    draw(ctx, mousePos, validPlacementTiles) {
        // Save the current context state
        ctx.save();

        // Get player position - assuming player is the camera target
        const canvas = document.getElementById("gameWorld");
        let centerX = (canvas.width / 2) + 250;
        let centerY = (canvas.height / 2) - 250;
        let visRadiusInPixels = this.visibilityRadius * this.tileSize;

        if (this.game.camera && this.game.camera.target) {
            const player = this.game.camera.target;
            centerX = player.x;
            centerY = player.y;
        }

        // First draw all tiles and objects across the entire map
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const building = this.grid[r][c];
                const x = c * this.tileSize;
                const y = r * this.tileSize;

                // Draw the grass tile
                ctx.drawImage(this.spritesheet, x, y, this.tileSize, this.tileSize);

                // Draw building if exists
                if (building) {
                    building.draw(ctx);
                }

                // Draw campfire animation if applicable
                if (this.grid[r][c] !== null && this.state === 0) {
                    this.animation[this.state].drawFrame(this.game.clockTick, ctx, x, y, 1);
                }

                // Highlight valid placement tiles if applicable
                if (mousePos && validPlacementTiles &&
                    validPlacementTiles.some(tile => tile.row === r && tile.col === c)) {
                    ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                }
            }
        }

        // Create a circular gradient mask for visibility
        ctx.globalCompositeOperation = 'destination-in';
        const gradient = ctx.createRadialGradient(
            centerX,centerY, 0,
            centerX, centerY, visRadiusInPixels
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, visRadiusInPixels, 0, Math.PI * 2);
        ctx.fill();

        // Restore the normal drawing mode
        ctx.globalCompositeOperation = 'source-over';

        // Draw the red circle visibility indicator
        ctx.beginPath();
        ctx.arc(centerX,centerY, visRadiusInPixels, 0, Math.PI * 2);
        // ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        // ctx.lineWidth = 2;
        // ctx.stroke();

        // Draw the red circle visibility indicator (centered on player)
        ctx.beginPath();
        ctx.arc(centerX, centerY, visRadiusInPixels, 0, Math.PI * 2);

        // Calculate the second circle's position (fixed to camera center)
        const secondCircleX = this.game.camera.x + (this.game.ctx.canvas.width / 2) / this.game.camera.zoomLevel;
        const secondCircleY = this.game.camera.y + (this.game.ctx.canvas.height / 2) / this.game.camera.zoomLevel;
        const secondCircleRadius = visRadiusInPixels / 2; // Example: half the size

        // Draw the grass tiles within the second circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(secondCircleX, secondCircleY, secondCircleRadius, 0, Math.PI * 2);
        ctx.clip(); // Clip the drawing area to the second circle

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * this.tileSize;
                const y = r * this.tileSize;
                ctx.drawImage(this.spritesheet, x, y, this.tileSize, this.tileSize);
            }
        }

        ctx.restore(); // Restore the clipping region

        // Draw the second circle (invisible line)
        ctx.beginPath();
        ctx.arc(secondCircleX, secondCircleY, secondCircleRadius, 0, Math.PI * 2);

        // Restore the original context state
        ctx.restore();
    }

    screenToGrid(mouseX, mouseY) {
        const col = Math.floor(mouseX / this.tileSize);
        const row = Math.floor(mouseY / this.tileSize);
        return { row, col };
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    isCellEmpty(row, col) {
        return this.isValidCell(row, col) && this.grid[row][col] === null;
    }

    placeBuilding(row, col, building) {
        if (this.isCellEmpty(row, col)) {
            this.grid[row][col] = building;
            return true;
        }
        return false;
    }
}
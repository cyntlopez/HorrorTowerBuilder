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

        this.animation = [];
        this.loadAnimation();
    }

    loadAnimation() {
        for (let i = 0; i < 2; i++) { // 2 states
            this.animation.push([]);
        }

        // TODO: Change campfire image
        const campfireSpriteSheet = ASSET_MANAGER.getAsset("assets/sprites/resources/campfire.png");

        this.animation[0] = new Animator(campfireSpriteSheet, 2, 2, 64.1, 63, 6, 0.5, 0, false, true);
    }

    update() {
        // Update logic if needed.
    }

    draw(ctx) {
        // Only draw if the player is in placement mode.
        if (!this.player) return;
        if (!this.player.placementMode) return;
      
        const radius = this.player.placementRadius; // Tile-based radius
        const playerTile = this.screenToGrid(this.player.x, this.player.y);

        for (let r = Math.max(0, playerTile.row - radius); r <= Math.min(this.rows - 1, playerTile.row + radius); r++) {
            for (let c = Math.max(0, playerTile.col - radius); c <= Math.min(this.cols - 1, playerTile.col + radius); c++) {
                const x = c * this.tileSize;
                const y = r * this.tileSize;

                // Draw the grid tile outline.
                ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
                ctx.strokeRect(x, y, this.tileSize, this.tileSize);

                // If there is a building, draw it.
                const building = this.grid[r][c];
                if (building) {
                    building.draw(ctx);
                }

                // Optional: Draw campfire animation if a campfire exists.
                if (this.grid[r][c] !== null && this.grid[r][c] instanceof Campfire) {
                    this.animation[this.state].drawFrame(this.game.clockTick, ctx, x, y, 1);
                }
            }
        }
    }

    screenToGrid(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
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
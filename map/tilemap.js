class TileMap {
    constructor(rows, cols, tileSize, game, spritesheet) {
        this.rows = rows;
        this.spritesheet = spritesheet;
        this.cols = cols;
        this.tileSize = tileSize;
        this.game = game;
        this.player = null;

        this.grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    update() {
        // Update logic if needed.
    }


    draw(ctx) {
        // Only draw if the player is in placement mode.
        if (!this.player) return;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                ctx.drawImage(this.spritesheet, c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
            }
        }

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
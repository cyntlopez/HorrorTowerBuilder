class TileMap {
    constructor(rows, cols, tileSize) {
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;

        this.grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    update() {

    }

    draw(ctx) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const building = this.grid[r][c];

                if (!building) {
                    ctx.strokeStyle = "gray";
                    ctx.strokeRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                } else {
                    building.draw(ctx);

                }
            }
        }
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

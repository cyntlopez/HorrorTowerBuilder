class TileMap {
    constructor(rows, cols, tileSize) {
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;

        this.grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    update() {

    }

    draw(ctx, mouse, validTiles = []) {
        let hoveredTile = null;
        if (mouse) {
            hoveredTile = this.screenToGrid(mouse.x, mouse.y);
        }

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let fillColor = this.grid[r][c] ? 'lightblue' : 'white';

                // Highlight valid placement tiles
                if (validTiles.some(tile => tile.row === r && tile.col === c)) {
                    fillColor = 'rgba(0, 255, 0, 0.3)';
                }

                // Highlight hovered tile
                if (hoveredTile && r === hoveredTile.row && c === hoveredTile.col) {
                    fillColor = 'yellow';
                }

                const x = c * this.tileSize;
                const y = r * this.tileSize;
                ctx.fillStyle = 'blue';
                if (this.grid[r][c] !== null) ctx.fillRect(x, y, this.tileSize, this.tileSize);

                ctx.strokeStyle = 'gray';
                ctx.strokeRect(x, y, this.tileSize, this.tileSize);
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

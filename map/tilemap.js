class TileMap {
    constructor(rows, cols, tileSize, game, spritesheet) {
        this.rows = rows;
        this.spritesheet = spritesheet;
        this.cols = cols;
        this.tileSize = tileSize;
        this.state = 0; // 0 = lit fire, 1 = dying fire
        this.game = game;

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

        this.animation[0] = new Animator(campfireSpriteSheet, 2, 2, 64.1, 63, 6, 0.5, 0,false, true);

    }

    update() {

    }

    draw(ctx) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const building = this.grid[r][c];

                if (!building) {
                    ctx.strokeStyle = rgba(0,0,0,0)
                    ctx.strokeRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                } else {
                    building.draw(ctx);

                }

                const x = c * this.tileSize;
                const y = r * this.tileSize;

                if (this.grid[r][c] !== null) {
                    this.animation[this.state].drawFrame(this.game.clockTick, ctx, x, y, 1);
                }
                ctx.drawImage(this.spritesheet, x, y, this.tileSize, this.tileSize);
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
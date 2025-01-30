class Building {
    constructor(row, col, tileSize) {
        this.row = row;
        this.col = col;
        this.width = tileSize;
        this.height = tileSize;

        this.health = 100;
    }

    draw(ctx) {
        const x = this.col * this.width;
        const y = this.row * this.height;

        ctx.fillStyle = 'brown';
        ctx.fillRect(x, y, this.width, this.height);

        // Optional: Draw outline
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, this.width, this.height);

    }

    update() {

    }
}

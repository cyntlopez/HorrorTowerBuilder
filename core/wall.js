class Wall extends Building {
    constructor(game, row, col, tileSize) {
        super(game, row, col, tileSize);
        this.health = 200;
    }

    draw(ctx) {
        const x = this.col * this.width;
        const y = this.row * this.height;

        ctx.fillStyle = "gray";
        ctx.fillRect(x, y, this.width, this.height);

        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, this.width, this.height);
    }
}
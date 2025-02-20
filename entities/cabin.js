class Cabin {
    constructor(game, x, y, spritesheet) {
        Object.assign(this, {game, x, y, spritesheet});
    }
     update() {}

    draw(ctx) {
        ctx.drawImage(this.spritesheet, this.x, this.y, 95, 120);
    }
}
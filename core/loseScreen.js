class LoseScreen {
    constructor(game) {
        this.game = game;
        this.active = false;
    }

    update() {

    }

    draw(ctx) {
        if (!this.active) {
            return;
        }

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, this.game.ctx.canvas.width, this.game.ctx.canvas.height);
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("You Died", this.game.ctx.canvas.width / 2, this.game.ctx.canvas.height / 2);
        ctx.restore();
    }

    activate() {
        this.active = true;
        this.game.settings.stopTimer();
    }
}
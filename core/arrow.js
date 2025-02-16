class Arrow {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = 200;
        this.damage = 25;
        this.removeFromWorld = false;
    }

    update() {
        if (!this.target || this.target.health <= 0) {
            this.removeFromWorld = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            this.target.takeDamage(this.damage);
            this.removeFromWorld = true;
            console.log("Arrow hit enemy!");
        } else {
            this.x += (dx / distance) * this.speed * gameEngine.clockTick;
            this.y += (dy / distance) * this.speed * gameEngine.clockTick;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

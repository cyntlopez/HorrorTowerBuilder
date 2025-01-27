class Hero {
    constructor(game, x, y, spritesheet) {
        Object.assign(this, {game, x, y, spritesheet});

        // hero's state variables
        this.facing = 0; // 0 = down, 1 = up, 2 = left, 3 = right
        this.state = 0; // 0 = idle, 1 = walking, 2 = running, 3 = throwing, 4 = dying
        this.speed = 85;
        this.dead = false;

        // hero's animations
        this.animation = [];
        this.loadAnimation();
    }

    loadAnimation() {
        for (let i = 0; i < 5; i++) { // 4 states
            this.animation.push([]);
            for (let j = 0; j < 4; j++) { // 4 facing directions
                this.animation[i].push([]);
            }
        }

        // idle animation for state = 0
        // facing down = 0
        this.animation[0][0] = new Animator(this.spritesheet, 0, 129, 64, 64.5, 1, 0.1, 0,false, true);

        // facing up = 1
        this.animation[0][1] = new Animator(this.spritesheet, 0, 0, 64, 64.5, 1, 0.1, 0,false, true);

        // facing left = 2
        this.animation[0][2] = new Animator(this.spritesheet, 0, 68, 64, 64.5, 1, 0.1, 0,false, true);

        // facing right = 3
        this.animation[0][3] = new Animator(this.spritesheet, 0, 195, 64, 64.5, 1, 0.1, 0,false, true);

        // walk animation for state = 1
        // facing down = 0
        this.animation[1][0] = new Animator(this.spritesheet, 0, 129, 64, 64.5, 9, 0.1, 0,false, true);

        // facing up = 1
        this.animation[1][1] = new Animator(this.spritesheet, 0, 0, 64, 64.5, 9, 0.1, 0,false, true);

        // facing left = 2
        this.animation[1][2] = new Animator(this.spritesheet, 0, 68, 64, 64.5, 9, 0.1, 0,false, true);

        // facing right = 3
        this.animation[1][3] = new Animator(this.spritesheet, 0, 195, 64, 64.5, 9, 0.1, 0,false, true);

    }

    update() {
        if (this.game.up) {
            this.y -= this.speed * this.game.clockTick; // walk up
            this.facing = 1;
            this.state = 1;
        } else if (this.game.down) {
            this.y += this.speed * this.game.clockTick; // walk down
            this.facing = 0;
            this.state = 1;
        } else if (this.game.left) {
            this.x -= this.speed * this.game.clockTick; // walk left
            this.facing = 2;
            this.state = 1;
        } else if (this.game.right) {
            this.x += this.speed * this.game.clockTick; // walk right
            this.facing = 3;
            this.state = 1;
        } else {
            this.state = 0; // idle
        }
    }

    draw(ctx) {
        this.animation[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    };
}
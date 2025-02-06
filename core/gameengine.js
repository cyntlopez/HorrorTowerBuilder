class GameEngine {
    constructor(options) {
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        this.selectedBuilding = "ArcherTower";

        // // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};
        this.camera = null;
        this.enemySpawner = null;

        // initialize the keys for the character
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
    };

    init(ctx, camera, enemySpawner) {
        this.ctx = ctx;
        this.camera = camera;
        this.startInput();
        this.timer = new Timer();
        this.enemySpawner = enemySpawner;
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("keydown", (event) => {
            this.keys[event.key] = true

            switch (event.key) {
                case '1':
                    this.selectedBuilding = "ArcherTower";
                    console.log("Selected: Archer Tower");
                    break;
                case '2':
                    this.selectedBuilding = "Wall";
                    console.log("Selected: Wall");
                    break;
            }
        });
        this.ctx.canvas.addEventListener("keyup", event => this.keys[event.key] = false);

    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        if (this.camera) this.camera.applyTransformations(this.ctx);

        // Draw latest things first
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }

        if (this.camera) this.camera.resetTransformations(this.ctx);
    };

    update() {
        this.camera.update();

        if (this.enemySpawner) {
            this.enemySpawner.update();
        }

        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

}
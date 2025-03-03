class Minimap {
    constructor(game, size = 150) {
        this.game = game;
        this.mapSize = size;
        this.padding = 20;
        this.scale = null;
    }

    update() {
        if (!this.scale) {
            const tilemap = this.game.entities.find(entity => entity instanceof TileMap);
            if (tilemap) {
                this.scale = this.mapSize / Math.max(tilemap.rows, tilemap.cols);
            }
        }

    }

    draw(ctx) {
        if (!this.scale) return;

        this.game.camera.resetTransformations(ctx);

        const canvasHeight = ctx.canvas.height;
        const canvasWidth = ctx.canvas.width;

        // Resource bar position reference
        const resourceBarHeight = 80;
        const resourceBarY = canvasHeight - resourceBarHeight - 20;

        // Adjust minimap position - further left and up
        const minimapX = 50;  // Move to far left with small padding
        const minimapY = resourceBarY - 50; // Move up by 50px from resource bar

        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            minimapX - 1,
            minimapY - 1,
            this.mapSize + 2,
            this.mapSize + 2
        );

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(
            minimapX,
            minimapY,
            this.mapSize,
            this.mapSize
        );

        const tilemap = this.game.entities.find(entity => entity instanceof TileMap);
        if (tilemap) {
            for (let y = 0; y < tilemap.rows; y++) {
                for (let x = 0; x < tilemap.cols; x++) {
                    const miniX = minimapX + (x * this.scale);
                    const miniY = minimapY + (y * this.scale);

                    ctx.fillStyle = '#333';
                    ctx.fillRect(miniX, miniY, this.scale, this.scale);
                }
            }
        }

        const player = this.game.entities.find(entity => entity instanceof Hero);
        if (player && tilemap) {
            const playerX = minimapX + ((player.x / tilemap.tileSize) * this.scale);
            const playerY = minimapY + ((player.y / tilemap.tileSize) * this.scale);
            ctx.fillStyle = 'blue';
            ctx.fillRect(playerX, playerY, this.scale, this.scale);
        }

        this.game.camera.applyTransformations(ctx);
    }

    cleanup() {
        const minimapCanvas = document.getElementById('minimapCanvas');
        if (minimapCanvas) {
            minimapCanvas.remove();
        }
    }
}
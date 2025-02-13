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

        // Get the canvas element
        const canvas = ctx.canvas;
        // Get canvas bounding rectangle
        const canvasRect = canvas.getBoundingClientRect();

        // Calculate position - keep x the same but move y to bottom
        const rightPosition = canvasRect.right + 20; // 20px from the right edge of canvas
        const bottomPosition = canvasRect.bottom - this.mapSize - 20; // 20px from bottom

        // Create a separate canvas for the minimap
        let minimapCanvas = document.getElementById('minimapCanvas');
        if (!minimapCanvas) {
            minimapCanvas = document.createElement('canvas');
            minimapCanvas.id = 'minimapCanvas';
            minimapCanvas.width = this.mapSize + 2;
            minimapCanvas.height = this.mapSize + 2;
            minimapCanvas.style.position = 'fixed';
            minimapCanvas.style.left = rightPosition + 'px';
            minimapCanvas.style.top = bottomPosition + 'px';
            minimapCanvas.style.zIndex = '1000';
            document.body.appendChild(minimapCanvas);
        } else {
            // Update position in case window is resized
            minimapCanvas.style.left = rightPosition + 'px';
            minimapCanvas.style.top = bottomPosition + 'px';
        }

        // Get minimap context
        const minimapCtx = minimapCanvas.getContext('2d');
        minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);

        // Draw border
        minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        minimapCtx.lineWidth = 2;
        minimapCtx.strokeRect(0, 0, this.mapSize + 2, this.mapSize + 2);

        // Draw background
        minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        minimapCtx.fillRect(1, 1, this.mapSize, this.mapSize);

        const tilemap = this.game.entities.find(entity => entity instanceof TileMap);
        if (tilemap) {
            for (let y = 0; y < tilemap.rows; y++) {
                for (let x = 0; x < tilemap.cols; x++) {
                    const miniX = 1 + (x * this.scale);
                    const miniY = 1 + (y * this.scale);
                    minimapCtx.fillStyle = '#333';
                    minimapCtx.fillRect(miniX, miniY, this.scale, this.scale);
                }
            }
        }

        const player = this.game.entities.find(entity => entity instanceof Hero);
        if (player && tilemap) {
            const playerX = 1 + ((player.x / tilemap.tileSize) * this.scale);
            const playerY = 1 + ((player.y / tilemap.tileSize) * this.scale);
            minimapCtx.fillStyle = 'blue';
            minimapCtx.fillRect(playerX, playerY, this.scale, this.scale);
        }
    }

    cleanup() {
        const minimapCanvas = document.getElementById('minimapCanvas');
        if (minimapCanvas) {
            minimapCanvas.remove();
        }
    }
}
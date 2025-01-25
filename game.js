export class Game {
    constructor(level) {
        this.level = level;
        this.screen = document.createElement('canvas');
        this.paint = this.screen.getContext('2d');

        this.screenSize = 800;

        switch(this.level) {
            case 1:
                this.gridSize = 20;
                this.moveMemory = 7;
                this.visibleRange = 2;
                break;
            case 2:
                this.gridSize = 40;
                this.moveMemory = 5;
                this.visibleRange = 1;
                break;
            case 3:
                this.gridSize = 60;
                this.moveMemory = 3;
                this.visibleRange = 1;
                this.screenSize = 780;
                break;
            default:
                this.gridSize = 40;
                this.moveMemory = 5;
                this.visibleRange = 1;
        }

        this.cellSize = this.screenSize / this.gridSize;
        this.setupCanvas();
        this.initializeGameState();
        this.initializeResources();
    }

    initializeGameState() {
        this.gameState = {
            player: {
                x: Math.floor(this.gridSize / 2),
                y: Math.floor(this.gridSize / 2)
            },
            flare: {
                active: false,
                x: 0,
                y: 0,
                path: new Set(),
                grayPath: new Set(),
                direction: { x: 0, y: 0 },
                steps: 0
            },
            moveHistory: [],
            exploredCells: new Set()
        };
        this.hiddenGrids = new Map();
    }


    setupCanvas() {
        this.screen.height = this.screen.width = this.screenSize;
        this.screen.tabIndex = 1;
    }

    initializeResources() {
        const resources = [
            { type: 1, color: '#800080' },
            { type: 2, color: '#FF4500' },
            { type: 3, color: '#20B2AA' }
        ];

        for (const resource of resources) {
            let placed = 0;
            while (placed < 3) {
                const x = Math.floor(Math.random() * (this.gridSize - 1));
                const y = Math.floor(Math.random() * (this.gridSize - 1));

                let isOccupied = false;
                for (let dy = 0; dy < 2 && !isOccupied; dy++) {
                    for (let dx = 0; dx < 2; dx++) {
                        if (this.hiddenGrids.has(`${x + dx},${y + dy}`)) {
                            isOccupied = true;
                            break;
                        }
                    }
                }

                if (!isOccupied) {
                    for (let dy = 0; dy < 2; dy++) {
                        for (let dx = 0; dx < 2; dx++) {
                            this.hiddenGrids.set(`${x + dx},${y + dy}`, resource);
                        }
                    }
                    placed++;
                }
            }
        }
    }

    updateFlare() {
        if (!this.gameState.flare.active) return;

        this.gameState.flare.path.add(`${this.gameState.flare.x},${this.gameState.flare.y}`);

        let newX = this.gameState.flare.x + this.gameState.flare.direction.x;
        let newY = this.gameState.flare.y + this.gameState.flare.direction.y;

        if (this.gameState.flare.steps >= 5 ||
            newX < 0 || newX >= this.gridSize ||
            newY < 0 || newY >= this.gridSize) {
            this.gameState.flare.active = false;
            return;
        }

        this.gameState.flare.x = newX;
        this.gameState.flare.y = newY;
        this.gameState.flare.steps++;
    }

    updateExploredCells() {
        this.gameState.exploredCells.clear();

        for (let position of this.gameState.moveHistory) {
            for (let y = -this.visibleRange; y <= this.visibleRange; y++) {
                for (let x = -this.visibleRange; x <= this.visibleRange; x++) {
                    const cellX = position.x + x;
                    const cellY = position.y + y;

                    if (cellX >= 0 && cellX < this.gridSize && cellY >= 0 && cellY < this.gridSize) {
                        this.gameState.exploredCells.add(`${cellX},${cellY}`);
                    }
                }
            }
        }

        for (let y = -this.visibleRange; y <= this.visibleRange; y++) {
            for (let x = -this.visibleRange; x <= this.visibleRange; x++) {
                const cellX = this.gameState.player.x + x;
                const cellY = this.gameState.player.y + y;

                if (cellX >= 0 && cellX < this.gridSize && cellY >= 0 && cellY < this.gridSize) {
                    this.gameState.exploredCells.add(`${cellX},${cellY}`);
                }
            }
        }
    }

    draw() {
        const viewOffsetX = this.screen.width/2 - (this.gameState.player.x * this.cellSize);
        const viewOffsetY = this.screen.height/2 - (this.gameState.player.y * this.cellSize);

        this.paint.fillStyle = 'black';
        this.paint.fillRect(0, 0, this.screen.width + 1, this.screen.height + 1);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const isPlayer = this.gameState.player.x === x && this.gameState.player.y === y;
                const isVisible = Math.abs(this.gameState.player.x - x) <= this.visibleRange &&
                    Math.abs(this.gameState.player.y - y) <= this.visibleRange;
                const isExplored = this.gameState.exploredCells.has(`${x},${y}`);
                const isFlare = this.gameState.flare.active && this.gameState.flare.x === x && this.gameState.flare.y === y;
                const isFlareTrail = this.gameState.flare.path.has(`${x},${y}`);
                const isGrayFlareTrail = this.gameState.flare.grayPath.has(`${x},${y}`);
                const resource = this.hiddenGrids.get(`${x},${y}`);

                const cellX = Math.floor(x * this.cellSize + viewOffsetX);
                const cellY = Math.floor(y * this.cellSize + viewOffsetY);
                const cellWidth = Math.ceil(this.cellSize + 0.5);
                const cellHeight = Math.ceil(this.cellSize + 0.5);

                if (cellX + cellWidth < 0 || cellX > this.screen.width ||
                    cellY + cellHeight < 0 || cellY > this.screen.height) {
                    continue;
                }

                if (resource && isVisible) {
                    this.paint.fillStyle = resource.color;
                } else if (isVisible) {
                    this.paint.fillStyle = 'green';
                } else if (isExplored || isGrayFlareTrail) {
                    if (resource) {
                        this.paint.fillStyle = resource.color;
                    } else {
                        this.paint.fillStyle = '#333';
                    }
                } else {
                    this.paint.fillStyle = 'black';
                }
                this.paint.fillRect(cellX, cellY, cellWidth, cellHeight);

                if (isPlayer) {
                    this.paint.fillStyle = 'blue';
                    this.paint.fillRect(cellX, cellY, cellWidth, cellHeight);
                } else if ((isFlare || isFlareTrail) && !resource) {
                    this.paint.fillStyle = 'yellow';
                    this.paint.fillRect(cellX, cellY, cellWidth, cellHeight);
                } else if (resource && isVisible) {
                    this.paint.fillStyle = resource.color;
                    this.paint.fillRect(cellX, cellY, cellWidth, cellHeight);
                }
            }
        }

        if (!this.gameState.flare.active) {
            for (let cell of this.gameState.flare.path) {
                this.gameState.flare.grayPath.add(cell);
            }
            this.gameState.flare.path.clear();
        }

        this.drawResourceBar();
        this.drawMinimap();

        if (this.gameState.flare.active) {
            this.updateFlare();
            requestAnimationFrame(() => this.draw());
        }
    }

    drawResourceBar() {
        const barHeight = 80;
        const barWidth = 300; // Fixed width
        const barY = this.screen.height - barHeight - 20;
        const barX = (this.screen.width - barWidth) / 2;
        const boxSize = 60;
        const spacing = 20;

        this.paint.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.paint.fillRect(barX, barY, barWidth, barHeight);

        const resources = [
            { color: '#800080', amount: 0 },
            { color: '#FF4500', amount: 0 },
            { color: '#20B2AA', amount: 0 }
        ];

        resources.forEach((resource, i) => {
            const x = barX + spacing + (boxSize + spacing) * i;

            this.paint.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.paint.fillRect(x, barY + 10, boxSize, boxSize);

            this.paint.fillStyle = resource.color;
            this.paint.fillRect(x + 15, barY + 25, 30, 30);

            this.paint.fillStyle = 'white';
            this.paint.font = '16px Arial';
            this.paint.textAlign = 'center';
            this.paint.fillText(resource.amount, x + boxSize/2, barY + boxSize + 5);
        });
    }

    drawMinimap() {
        const mapSize = 150; // Size of minimap
        const padding = 20;
        const scale = mapSize / this.gridSize;

        this.paint.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.paint.lineWidth = 2;
        this.paint.strokeRect(padding - 1, this.screen.height - mapSize - padding - 1, mapSize + 2, mapSize + 2);

        this.paint.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.paint.fillRect(padding, this.screen.height - mapSize - padding, mapSize, mapSize);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const isExplored = this.gameState.exploredCells.has(`${x},${y}`);
                const resource = this.hiddenGrids.get(`${x},${y}`);
                const miniX = padding + (x * scale);
                const miniY = this.screen.height - mapSize - padding + (y * scale);

                if (isExplored) {
                    if (resource) {
                        this.paint.fillStyle = resource.color;
                    } else {
                        this.paint.fillStyle = '#333';
                    }
                    this.paint.fillRect(miniX, miniY, scale, scale);
                }
            }
        }

        const playerX = padding + (this.gameState.player.x * scale);
        const playerY = this.screen.height - mapSize - padding + (this.gameState.player.y * scale);
        this.paint.fillStyle = 'blue';
        this.paint.fillRect(playerX, playerY, scale, scale);
    }

    setupEventListeners() {
        this.screen.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.key);
            e.preventDefault();

            const key = e.key.toLowerCase();
            let newX = this.gameState.player.x;
            let newY = this.gameState.player.y;

            if (key === 'f' && !this.gameState.flare.active) {
                this.gameState.flare.active = true;
                this.gameState.flare.x = this.gameState.player.x;
                this.gameState.flare.y = this.gameState.player.y;
                this.gameState.flare.path.clear();
                this.gameState.flare.grayPath.clear();
                this.gameState.flare.steps = 0;

                if (this.gameState.moveHistory.length > 0) {
                    const lastMove = this.gameState.moveHistory[this.gameState.moveHistory.length - 1];
                    this.gameState.flare.direction = {
                        x: this.gameState.player.x - lastMove.x,
                        y: this.gameState.player.y - lastMove.y
                    };
                } else {
                    this.gameState.flare.direction = { x: 0, y: -1 };
                }

                requestAnimationFrame(() => this.draw());
                return;
            }

            switch (key) {
                case 'w':
                case 'arrowup':
                    newY = Math.max(0, this.gameState.player.y - 1);
                    break;
                case 's':
                case 'arrowdown':
                    newY = Math.min(this.gridSize - 1, this.gameState.player.y + 1);
                    break;
                case 'a':
                case 'arrowleft':
                    newX = Math.max(0, this.gameState.player.x - 1);
                    break;
                case 'd':
                case 'arrowright':
                    newX = Math.min(this.gridSize - 1, this.gameState.player.x + 1);
                    break;
                default:
                    return;
            }

            if (this.hiddenGrids.has(`${newX},${newY}`)) {
                return;
            }

            if (newX !== this.gameState.player.x || newY !== this.gameState.player.y) {
                this.gameState.moveHistory.push({x: this.gameState.player.x, y: this.gameState.player.y});

                if (this.gameState.moveHistory.length > this.moveMemory) {
                    this.gameState.moveHistory.shift();
                }

                this.gameState.player.x = newX;
                this.gameState.player.y = newY;

                this.updateExploredCells();
                this.draw();
            }
        });
    }

    start() {
        document.body.appendChild(this.screen);
        this.setupEventListeners();
        this.gameState.moveHistory.push({x: this.gameState.player.x, y: this.gameState.player.y});
        this.updateExploredCells();
        this.draw();
        this.screen.focus();
    }
}
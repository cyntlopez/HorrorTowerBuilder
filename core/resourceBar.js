class ResourceBar {
    constructor(game) {
        this.game = game;
        this.barHeight = 80;
        this.barWidth = 300;
        this.boxSize = 60;
        this.spacing = 20;

        this.treeImage = ASSET_MANAGER.getAsset("assets/sprites/resources/tree.png");

        this.resources = [
            { isImage: true, image: this.treeImage, amount: 0 },
            { color: '#FF4500', amount: 0 },
            { color: '#20B2AA', amount: 0 }
        ];
    }


    update() {
        // Update resource amounts if needed
    }

    draw(ctx) {
        this.game.camera.resetTransformations(ctx);

        const canvasHeight = ctx.canvas.height;
        const canvasWidth = ctx.canvas.width;

        const barY = canvasHeight - this.barHeight - 20;
        const barX = (canvasWidth - this.barWidth) / 2;

        // Semi-transparent black background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, this.barWidth, this.barHeight);

        // Draw resource boxes
        this.resources.forEach((resource, i) => {
            const x = barX + this.spacing + (this.boxSize + this.spacing) * i;

            // Box background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x, barY + 10, this.boxSize, this.boxSize);

            // Resource icon
            ctx.fillStyle = resource.color;
            ctx.fillRect(x + 15, barY + 25, 30, 30);

            // Resource amount
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(resource.amount, x + this.boxSize/2, barY + this.boxSize + 5);
        });

        this.game.camera.applyTransformations(ctx);
    }

    setResourceAmount(index, amount) {
        if (index >= 0 && index < this.resources.length) {
            this.resources[index].amount = amount;
        }
    }
}
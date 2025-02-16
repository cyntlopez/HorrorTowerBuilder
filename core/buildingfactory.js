class BuildingFactory {
    static createBuilding(type, row, col, tileMap, tileSize) {
        switch (type) {
            case "ArcherTower":
                return new ArcherTower(row, col, tileMap, tileSize);
            case "Wall":
                return new Wall(row, col, tileMap, tileSize);
            default:
                console.error(`Unknown building type: ${type}`);
                return null;
        }
    }
}

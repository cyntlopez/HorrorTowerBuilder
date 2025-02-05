class BuildingFactory {
    static createBuilding(type, row, col, tileSize) {
        switch (type) {
            case "ArcherTower":
                return new ArcherTower(row, col, tileSize);
            case "Wall":
                return new Wall(row, col, tileSize);
            default:
                console.error("Unknown type " + type);
                return null;
        }
    }
}
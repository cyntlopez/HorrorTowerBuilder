class Building {

    constructor(health) {
        this.health = health;
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    upgrade(health) {
        this.health = health;
    }

    fix(amount) {
        this.health += amount;
    }

    //Blank until grid system is in place.
    place() {

    }
}
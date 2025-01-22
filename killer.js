class Killer extends Character {

    //I was thinking the killers can be more aggresive throughout the game
    constructor(health, speed, aggresiveness, damage) {
        super(health, speed);
        this.aggresiveness = aggresiveness;
        this.damage = damage;
    }

    attackPlayer(character, amount) {
        super.attack(character, this.damage * this.aggresiveness)
    }

    attackBuilding(b) {
        b

    }
}
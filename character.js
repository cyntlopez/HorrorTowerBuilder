class Character {
    constructor(health, speed) {
        if (health > 0 && speed > 0) {
            Object.assign(this, {health, speed});
        }
    }

    attack(character, amount) {
        if (amount > 0) {
            character.health -= amount;
        }
        
    }
}
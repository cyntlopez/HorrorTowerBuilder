class Player extends Character {

    constructor(health, speed) {
        super(health, speed);
    }

    //Blank for now
    useItem(Item) {

    }

    recoverHealth(amount) {
        this.health += amount;
    }

    increaseSpeed(amount) {
        this.speed += amount;
    }

    //Blank until I finish the videos for movement input
    move() {

    }


}
const maxHealth = 20;
let deckid = 0;
let cardsLeft = 0;
let health = 0;

let cards = [];

let activeWeapon = {};
let activeEnemy = {};

let runCards = [];

let values = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
    "JACK": 11, "QUEEN": 12, "KING": 13, "ACE": 14
};

let runTimer = 0;



function newGame() {
    loadGame();
    health = maxHealth;
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
}

async function loadGame() {
    document.getElementById("healthElement").innerHTML = "Current Health: " + maxHealth
    let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?cards=AS,2S,3S,4S,5S,6S,7S,8S,9S,10S,JS,QS,KS,AC,2C,3C,4C,5C,6C,7C,8C,9C,10C,JC,QC,KC,2H,3H,4H,5H,6H,7H,8H,9H,10H,2D,3D,4D,5D,6D,7D,8D,9D,10D");
    let data = await response.json();
    deckid = data.deck_id;
    cardsLeft = data.remaining;
    response = await fetch("https://deckofcardsapi.com/api/deck/" + deckid + "/draw/?count=1");
    let carddata = await response.json();
    cards[0] = carddata.cards[0];

    drawCards();
}

function updateBoard() {
    const cardElements = document.getElementsByClassName("cards");
    let weaponElement = document.getElementById("activeWeapon");
    let enemyElement = document.getElementById("attackedEnemy");
    for (let i = 1; i <= cardElements.length; i++) {
       // document.getElementById("card" + i).style.display = "none";
       document.getElementById("card" + i).src = "https://deckofcardsapi.com/static/img/back.png";
    }
    for (let i = 1; i <= cards.length; i++)
    {
        document.getElementById("card" + i).src = cards[i-1].image;
       // document.getElementById("card" + i).style.display = "block";
    }
    weaponElement.style.display = "none";
    enemyElement.style.display = "none";
    if(activeWeapon != null) {
        weaponElement.style.display = "block";
        weaponElement.src = activeWeapon.image;
    }
    if(activeEnemy != null) {
        enemyElement.style.display = "block";
        enemyElement.src = activeEnemy.image;
    }

}
function checkRemaining() {
    alert("Cards remaining: " + (cardsLeft+runCards.length));
}

async function drawCards() {

    if(cardsLeft < 3) {
        if (cardsLeft === 0) {
            cards[1] = runCards[0];
            cards[2] = runCards[1];
            cards[3] = runCards[2];
            runCards.splice(0,3);
            cardsLeft = 0;
        }
        if (cardsLeft === 1) {
            let response = await fetch("https://deckofcardsapi.com/api/deck/" + deckid + "/draw/?count=1");
            let data = await response.json();
            cards[1] = data.cards[0];
            cards[2] = runCards[0];
            cards[3] = runCards[1];
            runCards.splice(0,2);
            cardsLeft = data.remaining;
        }
        if (cardsLeft === 2) {
            let response = await fetch("https://deckofcardsapi.com/api/deck/" + deckid + "/draw/?count=2");
            let data = await response.json();
            cards[1] = data.cards[0];
            cards[2] = data.cards[1];
            cards[3] = runCards[0];
            runCards.splice(0,1);
            cardsLeft = data.remaining;
        }
    }
    else{
    // Draw three cards from the deck to fill the game board.
        let response = await fetch("https://deckofcardsapi.com/api/deck/" + deckid + "/draw/?count=3");
        let data = await response.json();

        cards[1] = data.cards[0];
        cards[2] = data.cards[1];
        cards[3] = data.cards[2];
        cardsLeft = data.remaining;
    }
    if (runTimer > 0) {
        runTimer--;
        if (runTimer === 0) {
            document.getElementById("run").style.display = "block";
        }
    }
    updateBoard();
}


function selectCard(self) {
    if (cards.length === 1 && cardsLeft) {
        return;
    } 
    let cardnr = 0;
    switch (self.id) {
        case "card1":
            cardnr = 0;
            break;

        case "card2":
            cardnr = 1;
            break;

        case "card3":
            cardnr = 2;
            break;

        case "card4":
            cardnr = 3;
            break;
    }
    switch (cards[cardnr].suit){
        case "HEARTS":
            health += values[cards[cardnr].value];
            if (health > 20) {
                health = 20;
            }
            cards.splice(cardnr,1)
            break;

        case "DIAMONDS":
            document.getElementById("weapon").checked = true;
            activeWeapon = cards[cardnr];
            cards.splice(cardnr,1);
            activeEnemy = {};
            break;

        case "SPADES":
            attacked(cards[cardnr]);
            cards.splice(cardnr,1);
            break;

        case "CLUBS":
            attacked(cards[cardnr]);
            cards.splice(cardnr,1);
            break;
    }
    document.getElementById("healthElement").innerHTML = "Current Health: " + health;
    if(cards.length <= 1) {
        drawCards();
    }
    updateBoard();
}

function attacked(nummer) {
    console.log(activeWeapon);
    if (!document.getElementById("weapon").checked || values[nummer.value] > values[activeEnemy.value] && activeWeapon != null || activeWeapon == " ") {
        health -= values[nummer.value];
    } 
    else {
        activeEnemy = nummer;
        if (values[activeEnemy.value] > values[activeWeapon.value]) {
            health -= values[activeEnemy.value]-values[activeWeapon.value];
        }
    }
    if (health <= 0) {
        gameOver();
    }
}
if (localStorage.highScore == null) {
    localStorage.highScore = 0;
}
function win() {
    localStorage.highScore = health;
}
function gameOver() {
    console.log("Game Over")
    alert("You lost\nHighScore: " + localStorage.highScore);
    location.reload(); 
}

async function run() {
    document.getElementById("run").style.display = "none";
       
    let lengde = cards.length;
    for (let i = 0; i<lengde; i++) {
        runCards.push(cards[cards.length - 1]);
        cards.splice(cards.length - 1, 1);            
    }

    if (cardsLeft < 1) {
        cards[0] = runCards[0];
        runCards.slice(0,1);
    }
    else{
        response = await fetch("https://deckofcardsapi.com/api/deck/" + deckid + "/draw/?count=1");
        let carddata = await response.json();
        cardsLeft = carddata.remaining;
        cards[0] = carddata.cards[0];
    }   
    drawCards();
    runTimer = 2;
    updateBoard();
    
}

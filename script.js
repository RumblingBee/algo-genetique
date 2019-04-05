var population;

//Durée de vie d'une roquette
var lifespan = 200;

//Variable qui indique quel vecteur du tableau d'ADN lire
var count = 0;

var target;


/**
 * VARIABLES D AFFICHAGE
 */

var lifeParagraph;


function setup() {
    createCanvas(800, 600);
    population = new Population();
    target = createVector(width/2,50);
    
}

function draw() {
    background(0);
    population.run();
    count++;

    ellipse(target.x,target.y,32,32);

    if(count === lifespan){
        population = new Population();
        count = 0;
    }

}
/**
 * L'ADN est un tableau de vecteur qui sera lu
 * par la fusée.
 */
function DNA() {

    this.genes = [];
    for (var i = 0; i < lifespan; i++) {
        this.genes[i] = p5.Vector.random2D();
        //Force appliquée
        this.genes[i].setMag(0.4);
    }

}

function Population() {
    this.rockets = [];
    this.populationSize = 25;

    for (var i = 0; i < this.populationSize; i++) {
        this.rockets[i] = new Rocket();
    }

    this.run = function () {
        for (var i = 0; i < this.populationSize; i++) {
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }
}

function Rocket() {
    this.position = createVector(width / 2, height);
    //Vecteur aléatoire
    this.velocity = createVector();
    this.acceleration = createVector();

    this.dna = new DNA();

    this.applyForce = function (force) {
        this.acceleration.add(force);
    }

    this.update = function () {
        this.applyForce(this.dna.genes[count]);
    

        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.mult(0);

    }

    this.show = function () {

        //On englobe par push et pop pour que les caractéristiques
        // n'influent pas sur l'environnement
        push();
        noStroke();
        //opacité
        fill(250, 150);
        // Rotation vers la direction où la fusée se dirige
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading());
        rectMode(CENTER);
        rect(0, 0, 50, 10);
        pop();
    }
}
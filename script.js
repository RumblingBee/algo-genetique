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
    target = createVector(width / 2, 50);

}

function draw() {
    background(0);
    population.run();
    count++;

    ellipse(target.x, target.y, 32, 32);

    if (count === lifespan) {
       population.evaluate();
       population.selection();

        count = 0;
    }

}
/**
 * L'ADN est un tableau de vecteur qui sera lu
 * par la fusée.
 */
function DNA(genes) {
    if (genes) {
        this.genes = genes;
    } else {

        this.genes = [];
        for (var i = 0; i < lifespan; i++) {
            this.genes[i] = p5.Vector.random2D();
            //Force appliquée
            this.genes[i].setMag(0.4);
        }
    }


    this.crossover = function (partner) {
        var newgenes = [];
        var mid = floor(random(this.genes.length));
        for (var i = 0; i < this.genes.length; i++) {
            if (i > mid) {
                newgenes[i] = this.genes[i];
            } else {
                newgenes[i] = partner.genes[i];

            }
        }
        return new DNA(newgenes);
    }

}

function Population() {
    this.rockets = [];
    this.populationSize = 25;

    // Liste des parents potentiels
    this.matingPool = [];

    for (var i = 0; i < this.populationSize; i++) {
        this.rockets[i] = new Rocket();
    }

    // Evalue quelles Roquettes vont être parents de la prochaine génération
    this.evaluate = function () {
        var maxFit = 0;

        for (var i = 0; i < this.populationSize; i++) {
            this.rockets[i].calculateFitness();
            if (this.rockets[i].fitness > maxFit) {
                maxFit = this.rockets[i].fitness;
            }
        }
        //On  normalise les valeurs pour les rendres plus lisibles
        for (var i = 0; i < this.populationSize; i++) {
            this.rockets[i].fitness /= maxFit;
        }
        this.matingPool = [];

        for (var i = 0; i < this.populationSize; i++) {
            var n = this.rockets[i].fitness * 100;
            for (var j = 0; j < n; j++) {
                this.matingPool.push(this.rockets[i]);
            }
        }

        this.selection = function () {
            var newRockets = [];
            for (var i = 0; i < this.rockets.length; i++) {

                var parentA = random(this.matingPool).dna;
                var parentB = random(this.matingPool).dna;
                var child = parentA.crossover(parentB);
                newRockets[i] = new Rocket(child);
            }
            this.rockets = newRockets;
        }

    }
    this.run = function () {
        for (var i = 0; i < this.populationSize; i++) {
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }
}

function Rocket(dna) {
    this.position = createVector(width / 2, height);
    //Vecteur aléatoire
    this.velocity = createVector();
    this.acceleration = createVector();
    this.fitness = 0;
    if (dna) {
        this.dna = dna;
    } else {

        this.dna = new DNA();
    }

    this.applyForce = function (force) {
        this.acceleration.add(force);
    }

    this.calculateFitness = function () {
        var distanceFromTarget = dist(this.position.x, this.position.y, target.x, target.y);
        this.fitness = map(distanceFromTarget,0,width,width,0);
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
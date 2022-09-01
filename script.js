var population;

//Durée de vie d'une roquette
var lifespan = 50;

//Variable qui indique quel vecteur du tableau d'ADN lire
var count = 0;

var target;

var generation = 1;
var randomMutation = 0;
var maxFit = 0;
var globalFit = 0;

/**
 * VARIABLES D AFFICHAGE
 */

var lifeP;
var generationP;
var mutationP;
var maxFitP;
var globalFitP;
var percentP;
var averageDistanceFromTargetAtDeath;
var minDistanceFromTarget = 1000000;
var maxProximity;
var elit;
var lastGenMinDistance = 10000000;


function printResult() {
    alert("Le plus proche a atteint une distance de \n\n" + minDistanceFromTarget);
    alert(population.rockets[0].dna.genes.toString());
}

function setup() {
    createCanvas(800, 600);
    population = new Population();
    target = createVector(width / 2, 50);

    var libelleLifeP = createP("Temps avant mort");
    libelleLifeP.position(900, 225);
    lifeP = createP();
    lifeP.position(900, 250);

    var libelleGenerationP = createP("Génération");
    libelleGenerationP.position(900, 325);
    generationP = createP();
    generationP.position(900, 350);

    var libelleMutationP = createP("Nombre de mutation aléatoire");
    libelleMutationP.position(900, 400);
    mutationP = createP();
    mutationP.position(900, 425);

    var libelleDistanceMin = createP("Distance minimale de l'objectif");
    libelleDistanceMin.position(900, 475);
    maxFitP = createP();
    maxFitP.position(900, 500);

    var pourcentageReussite = createP("Proximité maximale de l'objectif");
    pourcentageReussite.position(900, 575);
    percentP = createP();
    percentP.position(900, 600);

    var libelleGlobalFitP = createP("Distance moyenne de l'objectif");
    libelleGlobalFitP.position(900, 650);
    globalFitP = createP();
    globalFitP.position(900, 675);

    button = createButton('Stop');
    button.position(950, 750);
    button.mousePressed(printResult);
}

function draw() {
    background(0);
    population.run();
    count++;
    lifeP.html(lifespan - count);
    generationP.html(generation);
    mutationP.html(randomMutation);
    maxFitP.html(minDistanceFromTarget);
    globalFitP.html(averageDistanceFromTargetAtDeath);
    percentP.html(maxProximity * 100 + " % ");


    ellipse(target.x, target.y, 32, 32);

    if (count === lifespan) {
        lastGenMinDistance = minDistanceFromTarget;
        population.evaluate();
        population.selection();
        generation++;
        count = 0;
    }

}

/**
 * L'ADN est un tableau de vecteur qui sera lu
 * par la fusée, si elle n'a pas d'ADN, on le crée
 * en renseignant des vecteurs aléatoires.
 */
function DNA(genes) {
    if (genes) {
        this.genes = genes;
    } else {

        this.genes = [];
        for (var i = 0; i < lifespan; i++) {
            this.genes[i] = p5.Vector.random2D();
            //Force appliquée
            this.genes[i].setMag(0.8);
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
    this.populationSize = 200;

    // Liste des parents potentiels
    this.matingPool = [];

    for (var i = 0; i < this.populationSize; i++) {
        this.rockets[i] = new Rocket();
    }

    // Evalue quelles Roquettes vont être parents de la prochaine génération
    this.evaluate = function () {
        maxFit = 0;
        globalFit = 0;

        let sumDistanceFromTargetAtDeath = 0;

        for (var i = 0; i < this.populationSize; i++) {
            this.rockets[i].calculateFitness();
            const distance = getDistanceFromTarget.call(this.rockets[i]);
            sumDistanceFromTargetAtDeath += distance;
            if (this.rockets[i].fitness > maxFit) {
                maxFit = this.rockets[i].fitness;
                minDistanceFromTarget = distance;
                elit = Object.assign({}, this.rockets[i]);
            }
            globalFit += this.rockets[i].fitness;
        }

        averageDistanceFromTargetAtDeath = sumDistanceFromTargetAtDeath / this.rockets.length;
        maxProximity = (dist(0, 0, target.x, target.y) - minDistanceFromTarget) / dist(0, 0, target.x, target.y);

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

                var parentA = random(this.matingPool);
                var parentB = random(this.matingPool);
                var child = parentA.dna.crossover(parentB.dna);

                //Mutation aléatoire
                var rand = Math.floor((Math.random() * 5000));
                let mutated = false;
                if (rand >= 4500) {
                    var positionOfMutation = Math.floor((Math.random() * (child.genes.length - 1)));
                    child.genes[positionOfMutation] = p5.Vector.random2D();
                    randomMutation++;
                    mutated = true;
                }

                newRockets[i] = new Rocket(child);

                if (mutated) {
                    newRockets[i].color = color("green");
                }
            }

            this.rockets = newRockets;

            this.rockets[0].color = (elit.color);
            if (lastGenMinDistance > getDistanceFromTarget.call(elit)) {
                this.rockets[0].color = $.xcolor.random().getHex();
            }
            this.rockets[0].dna = (elit.dna);
            this.rockets[0].isElit = true;
        }


    }
    this.run = function () {
        for (var i = 0; i < this.populationSize; i++) {
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }
}

function getDistanceFromTarget() {
    return dist(this.position.x, this.position.y, target.x, target.y);
}

function Rocket(dna) {
    this.position = createVector(width / 2, height);
    //Vecteur aléatoire
    this.velocity = createVector();
    this.acceleration = createVector();
    this.fitness = 0;
    this.color = color("white");
    this.isElit = false;
    if (dna) {
        this.dna = dna;
    } else {

        this.dna = new DNA();
    }

    this.applyForce = function (force) {
        this.acceleration.add(force);
    }

    this.calculateFitness = function () {
        var distanceFromTarget = getDistanceFromTarget.call(this);
        this.fitness = map(distanceFromTarget, 0, width, width, 0);
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
        fill(this.color);

        if (this.isElit) {
            circle(0, 0, 40);

        } else {
            rect(0, 0, 50, 10);

        }
        pop();
    }
}

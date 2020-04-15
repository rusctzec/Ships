import { SimplePhysicsEngine, GameEngine, TwoVector } from 'lance-gg';
import Ship from '../common/Ship';
import Barricade from '../common/Barricade';
import Projectile from '../common/Projectile';
export default class ExGameEngine extends GameEngine {
    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({
            gameEngine: this,
            collisions: {
                type: 'brute',
                autoResolve: false,
            }
        });

        Math.lerp = function(from,to,weight=0.10) { // linear interpolation
            if (Math.abs(to-from) < 0.001) return to;
            return from+((to-from)*weight)
        }

        Math.vectorDistance = function(vec1, vec2) { // distance formula for 2d vectors
            if (!vec1 || !vec2) return NaN;
            if (isNaN(vec1.x) || isNaN(vec1.y) || isNaN(vec2.x) || isNaN(vec2.y)) return NaN;
            return Math.sqrt(Math.pow(vec2.x - vec1.x, 2) + Math.pow(vec2.y - vec1.y, 2) * 1.0);
        }

        Math.dot = function(vec1, vec2) {
            if (!vec1 || !vec2) return NaN;
            if (isNaN(vec1.x) || isNaN(vec1.y) || isNaN(vec2.x) || isNaN(vec2.y)) return NaN;
            return vec1.x * vec2.x + vec1.y * vec2.y;
        }

        Math.angleToUnit = function(angle, targetVec={}) {
            targetVec.x = Math.cos(angle*Math.PI/180); targetVec.y = Math.sin(angle*Math.PI/180);
            return targetVec;
        }
        Math.unitToAngle = function(vec) {
            return Math.atan2(vec.y, vec.x)*180/Math.PI;
        };

        this.initWorld();
    }

    registerClasses(serializer) {
        serializer.registerClass(Barricade);
        serializer.registerClass(Ship);
        serializer.registerClass(Projectile);
    }

    initWorld() {
        super.initWorld({
            worldWrap: false,
            width: 100,
            height: 100
        });
    }


    start() {
        super.start();
        console.log("game engine started!");

        // collision handler
        this.on('collisionStart', e => {
            console.log(e);
            let collisionObjects = Object.keys(e).map(k => e[k])
            let ships = collisionObjects.filter(e => e instanceof Ship);
            let projectiles = collisionObjects.filter(e => e instanceof Projectile);
            let barricades = collisionObjects.filter(e => e instanceof Barricade);
            for (let ship of ships) {
                if (isNaN(ship.position.x) || isNaN(ship.position.y)) return;
            }
            if (ships[0] && projectiles[0]) { // ship hit by projectile

                if (projectiles[0].playerId == ships[0].playerId) return; // ignore own projectiles
                console.log("ship hit by projectile")

                ships[0].takeDamage("projectile", projectiles[0].damage)
                console.log(ships[0].health);
                this.removeObjectFromWorld(projectiles[0]);
            } else if (ships[0] && ships[1]) { // ship hit by other ship
                console.log("ship hit by ship")
                return
                console.log("POSITION: ",ships[0].position)
                let newVelocity = new TwoVector(0, 0)
                newVelocity.copy(ships[0].position) // copy vector
                .subtract(ships[1].position) // subtract other vector to get direction to
                .normalize() // normalize

                ships[0].velocity.copy(newVelocity).multiplyScalar(-1);
                ships[1].velocity.copy(newVelocity);
            } else if (ships[0] && barricades[0]) { // ship bumps into barricade
                let direction = (new TwoVector).copy(barricades[0].position).subtract(ships[0].position).normalize();
                let angle = Math.unitToAngle(direction);
                let angleDiff = barricades[0].angle - angle;
                let unitDiff = Math.angleToUnit(angleDiff, new TwoVector());
                console.log(angleDiff);
                //ships[0].velocity = unitDiff.multiplyScalar(2);
            } else if (projectiles[0] && barricades[0]) { // bullet hits barricade
                barricades[0].takeDamage("projectile", projectiles[0].damage)
                this.removeObjectFromWorld(projectiles[0]);
            }
        });
        this.on('postStep', this.gameLogic.bind(this));
    }

    gameLogic() {
        let ships = this.world.queryObjects({instanceType: Ship});
        let barricades = this.world.queryObjects({instanceType: Barricade});

        // limit position within world boundaries
        for (let i in this.world.objects) {
            let obj = this.world.objects[i];
            if (obj.position && obj.velocity) {
                let didCollide = false;
                if (obj.position.x > this.worldSettings.width) {
                    didCollide = true;
                    obj.position.x = this.worldSettings.width;
                    obj.velocity.x += 0.4; obj.velocity.x *= -1.2;
                } else if (obj.position.x < -this.worldSettings.width) {
                    didCollide = true;
                    obj.position.x = -this.worldSettings.width;
                    obj.velocity.x -= 0.4; obj.velocity.x *= -1.2;
                } else if (obj.position.y > this.worldSettings.height) {
                    didCollide = true;
                    obj.position.y = this.worldSettings.height;
                    obj.velocity.y += 0.4; obj.velocity.y *= -1.2;
                } else if (obj.position.y < -this.worldSettings.height) {
                    didCollide = true;
                    obj.position.y = -this.worldSettings.height;
                    obj.velocity.y -= 0.4; obj.velocity.y *= -1.2;
                }

                if (didCollide && this.renderer) {
                    if (obj instanceof Ship) {
                        this.renderer.sounds.collide.play();
                        if (obj == this.renderer.playerShip) this.renderer.cameraShake += 4;
                    } else {
                        this.renderer.sounds.smallCollide.play();
                    }
                }

            }
        }



        if (typeof testf == "function") testf(this) //debug
    }

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);

        let playerShip = this.world.queryObject({
            playerId, instanceType: Ship
        });
        if (playerShip) {
            if (inputData.input == 'up') {
                playerShip.accelerate(0.03)
            } else if (inputData.input == 'down'){
                playerShip.accelerate(-0.02);
            } else if (inputData.input == 'right') {
                playerShip.turnRight(2.5);
            } else if (inputData.input == 'left') {
                playerShip.turnLeft(2.5)
            } else if (inputData.input == 'fire') {
                // use a timer for shoot cooldown
                if (playerShip.cooldown && this.timer.currentTime - playerShip.cooldown.startOffset < playerShip.cooldown.time) {
                    return
                } else {
                    this.makeProjectile(playerShip);
                    playerShip.cooldown = this.timer.add(60*(1/playerShip.fireRate), ()=>{});
                }
            }
        } else {
            if (inputData.input == 'enter') {
                if (this.clientEngine) { // CLIENTS ONLY
                    this.clientEngine.socket.emit('requestRestart');
                    this.renderer.announcement.text = '';
                }
            }
        }
    }

    randomizeSpawnPosition(avoidObjs=[], idealDistance=80, worldMargin=0.90, iterations=30) {
        let spawnPosition;
        for (let i = 0; i < iterations; i++) {
            spawnPosition = {
                x: (Math.random()-0.5) * this.worldSettings.width*worldMargin,
                y: (Math.random()-0.5) * this.worldSettings.height*worldMargin
            }
            if (avoidObjs.every(obj => Math.abs(Math.vectorDistance(spawnPosition, obj.position)) > idealDistance)) break;
        }
        return spawnPosition
    }

    makeBarricade() {
        let barricades = this.world.queryObjects({instanceType: Barricade});

        let spawnPosition = this.randomizeSpawnPosition(barricades);

        let barricade = new Barricade(this, null, {
            position: new TwoVector(spawnPosition.x, spawnPosition.y)
        });

        this.addObjectToWorld(barricade);
        return barricade;

    }

    makeShip(playerId, username) { // instance a new ship in the world, assigned to a player
        this.makeBarricade();
        console.log("makeShip")
        // try to find a good empty space for the ship to spawn
        let ships = this.world.queryObjects({instanceType: Ship});

        let spawnPosition = this.randomizeSpawnPosition(ships);

        let ship = new Ship(this, null, {
            position: new TwoVector(spawnPosition.x, spawnPosition.y),
            username: username.toString()
        });
        ship.height = 6;
        ship.width = 5;
        ship.playerId = playerId;
        this.addObjectToWorld(ship);
        console.log("ship added for",playerId)
        return ship;
    }

    makeProjectile(playerShip) {
        console.log("makeProjectile");
        let projectile = new Projectile(this);
        projectile.width = 1;
        projectile.height = 1;
        projectile.position.copy(playerShip.position);
        projectile.velocity.copy(playerShip.velocity);
        projectile.angle = playerShip.angle;
        projectile.playerId = playerShip.playerId;
        projectile.ownerId = playerShip.id;
        projectile.velocity.x += Math.cos(projectile.angle * (Math.PI / 180)) * 2;
        projectile.velocity.y += Math.sin(projectile.angle * (Math.PI / 180)) * 2;

        if (this.renderer) {
            if(playerShip == this.renderer.playerShip) {
            this.renderer.cameraShake = projectile.damage;
            }
        }

        let obj = this.addObjectToWorld(projectile, ()=>{});


        if (obj) this.timer.add(100, (projectileId) => {
            if (this.world.objects[projectileId]) this.removeObjectFromWorld(projectileId);
        }, this, [obj.id]);
    }

    spawnPickup(chance=0.5, type) {

    }
}
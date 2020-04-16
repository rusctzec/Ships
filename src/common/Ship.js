import { BaseTypes, DynamicObject, Renderer, TwoVector } from 'lance-gg';
import ExplosionEmitterConfig from '../client/ExplosionEmitter.js';
import SpawnEmitterConfig from '../client/SpawnEmitter.js';
let PixiParticles;
export default class Ship extends DynamicObject {
    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.maxHealth = this.startingHealth = 4;
        this.health = this.maxHealth
        this.friction = new TwoVector(0.98,0.98);
        this.fireRate = 1;
        this.shield = 0;
        this.points = 30;
        this.damage = 1;
        this.maxShield = this.startingShield = 20;

        if (props) this.username = props.username || "";
        if (typeof window != "undefined") {
            PixiParticles = require('pixi-particles');
        }

        /*
        this.sounds = {
            pickup: new Howl({
                src: "assets/audio/pickup.wav"
            }),
            spawn: new Howl({
                src: "assets/audio/spawn.wav"
            }),
            takeDamage: new Howl({
                src: "assets/audio/takeDamage.wav"
            }),
            collide: new Howl({
                src: "assets/audio/collide.wav"
            }),
            shipDestroyed: new Howl({
                src: "assets/audio/shipDestroyed.wav"
            }),
            playerHurt: new Howl({
                src: "assets/audio/playerHurt.wav"
            }),
        }
        */
    }

    static get bending() {
        return {
            position: { percent: 1.0 },
            angle: {percent: 1.0},
            health: { percent: 1.0 }
        }
    }

    static get netScheme() {
        return Object.assign({
            username: {type: BaseTypes.TYPES.STRING},
            health: {type: BaseTypes.TYPES.INT8},
            maxHealth: {type: BaseTypes.TYPES.INT8},
            fireRate: {type: BaseTypes.TYPES.INT8},
            shield: {type: BaseTypes.TYPES.INT16},
            maxShield: {type: BaseTypes.TYPES.INT16},
            points: {type: BaseTypes.TYPES.INT16},
            damage: {type: BaseTypes.TYPES.INT16},
        }, super.netScheme);
    }

    syncTo(other) {
        super.syncTo(other);
        /*
        if (Renderer) {
            let renderer = Renderer.getInstance();
            if (this.health != other.health || this.maxHealth != other.maxHealth) {
                renderer.View.updateHealth(other.health, other.maxHealth);
            }
            if (this.shield != other.shield || this.maxHealth != other.maxHealth) {
                renderer.View.updateArmor(other.shield, other.maxHealth);
            }

        }
        */
        this.health = other.health;
        this.maxHealth = other.maxHealth;
        this.fireRate = other.fireRate;
        this.shield = other.shield;
        this.maxShield = other.maxShield;
        this.points = other.points;
        this.damage = other.damage;

    }

    draw() {
        if (this.playerShip) {
        }
        this.sprite.position.set(this.position.x+this.width/2, this.position.y+this.height/2);
        this.shipSprite.angle = this.angle+90;
        for (let i in this.sounds) {
            //this.sounds[i].pos(this.position.x, this.position.y, 0);
        }
    }

    collectPickup(type) {
        switch (type) {
            case 0: // give 1 point
                this.points += 1;
            break;
            case 1: // give 2 points of health (1 heart)
                this.health = Math.min(this.health + 2, this.maxHealth);
            break;
            case 2: // give 20 points of shield
                this.shield = Math.min(this.shield + 20, this.maxShield);
            break;
        }
        if (Renderer) {
            let renderer = Renderer.getInstance();
            if (this == renderer.playerShip) renderer.sounds.pickup.play();
            renderer.updatePoints(this.points);
            renderer.View.updateHealth(this.health, this.maxHealth);
            renderer.View.updateArmor(this.shield, this.maxShield);
        }
    }

    buyUpgrade(type) { // should only run for playership
        let success = false;
        let cost = this.getUpgradeCost(type);
        switch(type) {
            case 1:
                if (this.points >= cost) {
                    success = true;
                    this.points -= cost;
                    this.maxHealth += 2;
                    this.health += 2;
                    console.log("Newhealth", this.health)
                }
                break;
            case 2:
                if (this.points >= cost) {
                    success = true;
                    this.points -= cost;
                    this.maxShield += 20;
                }
                break;
            case 3:
                if (this.points >= cost) {
                    success = true;
                    this.points -= cost;
                    this.fireRate += 1;
                }
                break;
        }

        if (success && this.gameEngine.serverEngine) {
            this.gameEngine.serverEngine.io.sockets.emit('shipUpgraded', this.playerId);
        }

        if (Renderer) {
            let renderer = Renderer.getInstance()

            if (success) {
                renderer.sounds.powerup.play();
            } else {
                renderer.sounds.deny.play();
                renderer.skillBox.position.x += (Math.random()-0.5)*5;
                renderer.skillBox.position.y += Math.random()*5;
            }
            renderer.updateSkills(this);
            renderer.updatePoints(this.points);
        }
    }

    getUpgradeCost(type) {
        switch (type) {
            case 1:
                return Math.max(Math.floor((this.maxHealth-this.startingHealth)), 1);
            case 2:
                return Math.max(Math.floor((this.maxShield-this.startingShield)/40), 1);
            case 3:
                return this.fireRate;
        }
    }

    takeDamage(damageType, amount) {
        if (this.shield > 0) {
            this.shield -= amount*10;
        } else {
            this.health -= amount;
        }
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.playSound("takeDamage", this.position);
            this.shipSprite.tint = 0xff0000;
            this.gameEngine.timer.add(3, () => {
                if (this.gameEngine.isOwnedByPlayer(this)) {
                    this.shipSprite.tint = 0x4153AF;
                } else {
                    this.shipSprite.tint = renderer.fgColor;
                }
            }, this);
            if (this == renderer.playerShip) {
                renderer.View.updateHealth(this.health, this.maxHealth);
                renderer.View.updateArmor(this.shield, this.maxShield);
                renderer.playSound("playerHurt", this.position);
                renderer.cameraShake = 4 + amount;
                if (this.health <= 0) {
                    renderer.announcement.text = "you died\npress enter to respawn";
                }
            }
        }
        if (this.health <= 0 && !Renderer) {
            this.gameEngine.removeObjectFromWorld(this);
        }
    }

    onAddToWorld(gameEngine) {
        console.log("ship added to world", this.width, this.height)
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.playSound("spawn", this.position);
            // assume PIXI has been set globally on the window;
            let sprite = this.sprite = new PIXI.Container();
            this.shipSprite = sprite.shipSprite = new PIXI.Sprite(PIXI.Loader.shared.resources.ship.texture)
            renderer.sprites[this.id] = sprite;
            sprite.shipSprite.anchor.set(0.5, 0.5);
            sprite.position.set(this.position.x, this.position.y);
            sprite.addChild(sprite.shipSprite);
            renderer.layer2.addChild(sprite);


            this.shipText = new PIXI.Text(this.username, Object.assign({},renderer.msgTextStyle,{align: "center"}));
            this.shipText.position.y = -10;
            this.shipText.anchor.set(0.5,0.5);
            sprite.addChild(this.shipText);

            this.spawnEmitter = new PixiParticles.Emitter(
                sprite,
                [PIXI.Loader.shared.resources.pointsorb.texture],
                SpawnEmitterConfig
            );
            this.spawnEmitter.autoUpdate = true;

            this.explosionEmitter = new PixiParticles.Emitter(
                sprite,
                [PIXI.Loader.shared.resources.ship.texture],
                ExplosionEmitterConfig
            );


            if (gameEngine.isOwnedByPlayer(this)) {
                renderer.playerShip = this;
                console.log("fgDSKJHGFDJKHGFDIU")
                renderer.updateSkills(this);
                renderer.updatePoints(this.points);
                renderer.View.updateHealth(this.health, this.maxHealth);
                renderer.View.updateArmor(this.shield, this.maxShield);
                this.shipSprite.tint = 0x4153AF;
            } else {
                this.shipSprite.tint = renderer.fgColor;
            }

        }
    }

    onRemoveFromWorld(gameEngine) {
        this.gameEngine.spawnPickup(this.position, 1, 0)
        this.gameEngine.spawnPickup(this.position, 0.25, Math.round(Math.random())+1)

        if (Renderer) {
            let renderer = Renderer.getInstance();
            console.log("ship removed from scene");
            renderer.sounds.shipDestroyed.play();
            let sprite = renderer.sprites[this.id];
            sprite.shipSprite.destroy();
            this.shipText.destroy();
            delete renderer.sprites[this.id];


            this.explosionEmitter.autoUpdate = true;
            this.explosionEmitter.playOnceAndDestroy();
            this.spawnEmitter.destroy();
            this.gameEngine.timer.add(Math.round(this.explosionEmitter.maxLifetime*60), ()=>{
                this.sprite.destroy()
                for (let i in this.sounds) {
                    this.sounds[i].unload();
                }
            }, this)

            if (this == renderer.playerShip) {
                if (renderer.announcement.text == '') renderer.announcement.text = 'press enter to respawn';
                delete renderer.playerShip;
            }


        }
    }
}
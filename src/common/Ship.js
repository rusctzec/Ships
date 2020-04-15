import { BaseTypes, DynamicObject, Renderer, TwoVector } from 'lance-gg';
import ExplosionEmitterConfig from '../client/ExplosionEmitter.js';
import SpawnEmitterConfig from '../client/SpawnEmitter.js';
let PixiParticles;
export default class Ship extends DynamicObject {
    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.health = 6;
        this.maxHealth = 6;
        this.friction = new TwoVector(0.98,0.98);
        this.fireRate = 2;
        this.shield = 0;
        this.maxShield = 20;

        if (props) this.username = props.username || "";
        if (typeof window != "undefined") {
            PixiParticles = require('pixi-particles');
        }
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
        }, super.netScheme);
    }

    syncTo(other) {
        super.syncTo(other);
        this.health = other.health;
        this.maxHealth = other.maxHealth;
        this.fireRate = other.fireRate;
        this.shield = other.shield;
        this.maxShield = other.maxShield;
    }

    takeDamage(damageType, amount) {
        this.health -= amount;
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.sounds.takeDamage.play();
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
                renderer.sounds.playerHurt.play();
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
            renderer.sounds.spawn.play();
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
                [PIXI.Loader.shared.resources.spawnparticle.texture],
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
                renderer.View.updateHealth(this.health, this.maxHealth);
                renderer.View.updateArmor(this.shield, this.maxShield);
                this.shipSprite.tint = 0x4153AF;
            } else {
                this.shipSprite.tint = renderer.fgColor;
            }

        }
    }

    onRemoveFromWorld(gameEngine) {
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
            this.gameEngine.timer.add(Math.round(this.explosionEmitter.maxLifetime*60), ()=>{this.sprite.destroy()}, this)

            if (this == renderer.playerShip) {
                if (renderer.announcement.text == '') renderer.announcement.text = 'press enter to respawn';
                delete renderer.playerShip;
            }

        }
    }
}
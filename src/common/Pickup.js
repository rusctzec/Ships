import { BaseTypes, DynamicObject, Renderer, TwoVector } from 'lance-gg';
import ExplosionEmitterConfig from '../client/ExplosionEmitter.js';
import SpawnEmitterConfig from '../client/SpawnEmitter.js';
let PixiParticles;
export default class Pickup extends DynamicObject {
    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.health = 5;
        this.friction = new TwoVector(0.95, 0.95);

        this.type = 0
        if (props) this.type = this.props.type || 0;

        this.height = 28; this.width = 28;

        if (typeof window != "undefined") {
            PixiParticles = require('pixi-particles');
        }
    }

    static get bending() {
        return {
            health: { percent: 1.0 },
            position: { percent: 1.0 },
            angle: {percent: 1.0},
        }
    }

    static get netScheme() {
        return Object.assign({
            type: {type: BaseTypes.TYPES.INT8}
        }, super.netScheme);
    }

    syncTo(other) {
        super.syncTo(other);
        this.health = other.health;
    }

    draw() {
        this.container.position.set(this.position.x, this.position.y);
        this.sprite.angle = this.angle+90;
    }

    takeDamage(damageType, amount) {
        this.health -= amount;
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.sounds.takeDamage.play();
            this.sprite.tint = 0xff0000;
            this.gameEngine.timer.add(3, () => {
                this.sprite.tint = renderer.fgColor;
            }, this);
        }
        if (this.health <= 0 && !Renderer) {
            this.gameEngine.removeObjectFromWorld(this);
        }
    }

    onAddToWorld(gameEngine) {
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.sounds.spawn.play();
            // assume PIXI has been set globally on the window;
            this.container = new PIXI.Container();
            this.container.position.set(this.position.x, this.position.y);
            renderer.layer2.addChild(this.container);
            switch(this.type) {
                case 1: // health pickup
                this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources.healthpickup.texture)
                    break;
                case 2: // shield pickup
                this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources.shieldpickup.texture)
                    break;
                default: // (0) points orb
                this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources.spawnparticle.texture)
            }

            this.height = this.sprite.height;
            this.width = this.sprite.width;

            this.sprite.tint = 0x87FF95;
            renderer.sprites[this.id] = this.sprite;
            this.sprite.anchor.set(0.5, 0.5);
            this.container.addChild(this.sprite);

            this.spawnEmitter = new PixiParticles.Emitter(
                this.container,
                [PIXI.Loader.shared.resources.spawnparticle.texture],
                SpawnEmitterConfig
            );
            this.spawnEmitter.autoUpdate = true;

            this.explosionEmitter = new PixiParticles.Emitter(
                this.container,
                [PIXI.Loader.shared.resources.ship.texture],
                ExplosionEmitterConfig
            );

            this.sprite.tint = renderer.fgColor;

        }
    }

    onRemoveFromWorld(gameEngine) {
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.sounds.shipDestroyed.play();
            delete renderer.sprites[this.id];
            this.sprite.destroy();

            this.explosionEmitter.autoUpdate = true;
            this.explosionEmitter.playOnceAndDestroy();
            this.gameEngine.timer.add(Math.round(this.explosionEmitter.maxLifetime*60), ()=>{this.container.destroy()}, this)

        }
    }
}
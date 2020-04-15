import { BaseTypes, DynamicObject, Renderer, TwoVector } from 'lance-gg';
import ExplosionEmitterConfig from '../client/ExplosionEmitter.js';
import SpawnEmitterConfig from '../client/SpawnEmitter.js';
let PixiParticles;
export default class Barricade extends DynamicObject {
    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.health = 5;
        this.friction = new TwoVector(1.0, 1.0);
        this.height = 28; this.width = 28;
        //this.velocity = new TwoVector(0.1,0.1);

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
            health: {type: BaseTypes.TYPES.INT8}
        }, super.netScheme);
    }

    syncTo(other) {
        super.syncTo(other);
        this.health = other.health;
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
            let sprite = this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources.barricade.texture)
            renderer.sprites[this.id] = sprite;
            sprite.anchor.set(1, 1);
            sprite.position.set(this.position.x, this.position.y);
            renderer.layer2.addChild(sprite);

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

            this.sprite.tint = renderer.fgColor;

        }
    }

    onRemoveFromWorld(gameEngine) {
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.sounds.shipDestroyed.play();
            let sprite = renderer.sprites[this.id];
            delete renderer.sprites[this.id];


            this.explosionEmitter.autoUpdate = true;
            this.explosionEmitter.playOnceAndDestroy();
            this.gameEngine.timer.add(Math.round(this.explosionEmitter.maxLifetime*60), ()=>{this.sprite.destroy()}, this)

        }
    }
}
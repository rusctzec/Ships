import { BaseTypes, DynamicObject, Renderer, TwoVector } from 'lance-gg';
import ExplosionEmitterConfig from '../client/ExplosionEmitter.js';
import {Howl} from 'howler';
import SpawnEmitterConfig from '../client/SpawnEmitter.js';
let PixiParticles;
export default class Pickup extends DynamicObject {
    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.friction = new TwoVector(0.95, 0.95);

        this.type = 0
        if (props) this.type = props.type || 0;

        this.height = 13; this.width = 13;

        if (typeof window != "undefined") {
            PixiParticles = require('pixi-particles');

            /*
            this.sounds = {
                destroy: new Howl({
                    src: "assets/audio/pickupDestroyed.wav"
                }),
                spawn: new Howl({
                    src: "assets/audio/spawn.wav"
                }),
            };
            */
        }
    }

    static get bending() {
        return {
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
    }

    draw() {
        this.container.position.set(this.position.x+this.width/2, this.position.y+this.height/2);

        for (let i in this.sounds) {
            //this.sounds[i].pos(this.position.x, this.position.y, 0);
        }
    }


    onAddToWorld(gameEngine) {
        console.log("pickup added to world");

        this.velocity.x = (Math.random()-0.5)*5;
        this.velocity.y = (Math.random()-0.5)*5;

        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.playSound("spawn", this.position);
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
                this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources.pointsorb.texture)
            }

            this.height = this.sprite.height;

            this.sprite.tint = 0x5DAF66;
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


        }
    }

    onRemoveFromWorld(gameEngine) {
        console.log("picked up");
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.playSound("pickupDestroyed", this.position);
            delete renderer.sprites[this.id];
            this.sprite.destroy();

            this.explosionEmitter.autoUpdate = true;
            this.explosionEmitter.playOnceAndDestroy();
            this.spawnEmitter.destroy();
            this.gameEngine.timer.add(Math.round(this.explosionEmitter.maxLifetime*60), ()=>{
                this.container.destroy()
                for (let i in this.sounds) {
                    this.sounds[i].unload();
                }
            }, this)

        }
    }
}
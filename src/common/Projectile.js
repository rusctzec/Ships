import { BaseTypes, DynamicObject, Renderer } from 'lance-gg';
import {Howl} from 'howler';
export default class Projectile extends DynamicObject {

    constructor(gameEngine, options, props){
        super(gameEngine, options, props);
        this.damage = 1;

        /*
        this.sounds = {
            collide: new Howl({
                src: "assets/audio/smallCollide.wav"
            }),
            fireBullet: new Howl({
                src: "assets/audio/fireBullet.wav"
            }),
        }
        */
    }

    static get bending() {
        return {
            position: {percent: 1.0}
        }
    }

    static get netScheme() {
        return Object.assign({
            damage: { type: BaseTypes.TYPES.INT32},
            inputId: { type: BaseTypes.TYPES.INT32}
        }, super.netScheme)
    }

    // position correction if less than world width/height

    draw() {
        this.sprite.position.set(this.position.x, this.position.y);

        for (let i in this.sounds) {
            //this.sounds[i].pos(this.position.x, this.position.y, 0);
        }
    }

    onAddToWorld(gameEngine) {
        console.log("projectile shot", this.width, this.height);
        if (Renderer) {
            let renderer = Renderer.getInstance();
            this.sounds.fireBullet.play();
            let sprite = this.sprite = new PIXI.Sprite(PIXI.Loader.shared.resources.bullet.texture)
            renderer.sprites[this.id] = sprite;
            sprite.anchor.set(0.5, 0.5);
            sprite.position.set(this.position.x, this.position.y);
            renderer.layer1.addChild(sprite);
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (Renderer) {
            let renderer = Renderer.getInstance();
            if (renderer.sprites[this.id]) {
                renderer.sprites[this.id].destroy();
                delete renderer.sprites[this.id];
            }
        }

        for (let i in this.sounds) {
            this.sounds[i].unload();
        }
    }

    syncTo(other) {
        super.syncTo(other);
        this.damage = other.damage;
        this.inputId = other.inputId;
    }
}

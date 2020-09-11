import { BaseTypes, DynamicObject, Renderer } from 'lance-gg';
export default class Projectile extends DynamicObject {

    constructor(gameEngine, options, props){
        super(gameEngine, options, props);
        this.damage = 1;
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

    draw() {
        this.sprite.position.set(this.position.x, this.position.y);
    }

    onAddToWorld(gameEngine) {
        if (Renderer) {
            let renderer = Renderer.getInstance();
            renderer.playSound("fireBullet", this.position);
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
    }

    syncTo(other) {
        super.syncTo(other);
        this.damage = other.damage;
        this.inputId = other.inputId;
    }
}

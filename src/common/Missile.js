import { BaseTypes, DynamicObject, Renderer } from "lance-gg";

export default class Missile extends DynamicObject {
  constructor(gameEngine, options, props) {
    super(gameEngine, options, props);
    this.damage = 10;
  }

  static get bending() {
    return {
      position: { percent: 1.0 },
    };
  }

  static get netScheme() {
    return Object.assign(
      {
        damage: { type: BaseTypes.TYPES.INT32 },
      },
      super.netScheme
    );
  }

  // position correction if less than world width/height

  onAddToWorld(gameEngine) {
    console.log("missile shot", this.width, this.height);
    if (Renderer) {
      let renderer = Renderer.getInstance();
      renderer.sounds.fireMissile.play();
      let sprite = new PIXI.Sprite(
        PIXI.Loader.shared.resources.missile.texture
      );
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
  }
}

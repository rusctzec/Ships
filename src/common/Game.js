import {
  GameEngine,
  BaseTypes,
  DynamicObject,
  SimplePhysicsEngine,
  TwoVector,
  KeyboardControls,
} from "lance-gg";
import config from "../config-APP_TARGET";

let createjs;
if (config.createjs) {
  createjs = config.createjs;
}

console.log("APP_TARGET:", config.APP_TARGET);
// import createjs from 'createjs-cmd';
// /////////////////////////////////////////////////////////
//
// GAME OBJECTS
//
// /////////////////////////////////////////////////////////
const PADDING = 20;
const WIDTH = 400;
const HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;
// client only
let htmlCanvas, stage;
const r = {}; // to hold various render objects
//
class Paddle extends DynamicObject {
  constructor(gameEngine, options, props) {
    super(gameEngine, options, props);
  }

  static get netScheme() {
    return Object.assign(
      {
        health: { type: BaseTypes.TYPES.INT16 },
      },
      super.netScheme
    );
  }

  syncTo(other) {
    super.syncTo(other);
    this.health = other.health;
  }
}

class Ball extends DynamicObject {
  constructor(gameEngine, options, props) {
    super(gameEngine, options, props);
  }

  get bending() {
    return { velocity: { percent: 0.0 } };
  }
  syncTo(other) {
    super.syncTo(other);
  }
}

// /////////////////////////////////////////////////////////
//
// GAME ENGINE
//
// /////////////////////////////////////////////////////////
export default class Game extends GameEngine {
  constructor(options) {
    super(options);
    this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });

    // common code
    this.on("postStep", this.gameLogic.bind(this));

    // server-only code
    this.on("server__init", this.serverSideInit.bind(this));
    this.on("server__playerJoined", this.serverSidePlayerJoined.bind(this));
    this.on(
      "server__playerDisconnected",
      this.serverSidePlayerDisconnected.bind(this)
    );

    // client-only code
    this.on("client__rendererReady", this.clientSideInit.bind(this));
    this.on("client__draw", this.clientSideDraw.bind(this));
  }

  registerClasses(serializer) {
    serializer.registerClass(Paddle);
    serializer.registerClass(Ball);
  }

  gameLogic() {
    let paddles = this.world.queryObjects({ instanceType: Paddle });
    let ball = this.world.queryObject({ instanceType: Ball });
    if (!ball || paddles.length !== 2) return;

    // CHECK LEFT EDGE:
    if (
      ball.position.x <= PADDING + PADDLE_WIDTH &&
      ball.position.y >= paddles[0].y &&
      ball.position.y <= paddles[0].position.y + PADDLE_HEIGHT &&
      ball.velocity.x < 0
    ) {
      // ball moving left hit player 1 paddle
      ball.velocity.x *= -1;
      ball.position.x = PADDING + PADDLE_WIDTH + 1;
    } else if (ball.position.x <= 0) {
      // ball hit left wall
      ball.velocity.x *= -1;
      ball.position.x = 0;
      console.log(`player 2 scored`);
      paddles[0].health--;
    }

    // CHECK RIGHT EDGE:
    if (
      ball.position.x >= WIDTH - PADDING - PADDLE_WIDTH &&
      ball.position.y >= paddles[1].position.y &&
      ball.position.y <= paddles[1].position.y + PADDLE_HEIGHT &&
      ball.velocity.x > 0
    ) {
      // ball moving right hits player 2 paddle
      ball.velocity.x *= -1;
      ball.position.x = WIDTH - PADDING - PADDLE_WIDTH - 1;
    } else if (ball.position.x >= WIDTH) {
      // ball hit right wall
      ball.velocity.x *= -1;
      ball.position.x = WIDTH - 1;
      console.log(`player 1 scored`);
      paddles[1].health--;
    }

    // ball hits top or bottom edge
    if (ball.position.y <= 0) {
      ball.position.y = 1;
      ball.velocity.y *= -1;
    } else if (ball.position.y >= HEIGHT) {
      ball.position.y = HEIGHT - 1;
      ball.velocity.y *= -1;
    }
  }

  processInput(inputData, playerId) {
    super.processInput(inputData, playerId);

    // get the player paddle tied to the player socket
    let playerPaddle = this.world.queryObject({ playerId });
    if (playerPaddle) {
      if (inputData.input === "up") {
        playerPaddle.position.y -= 5;
      } else if (inputData.input === "down") {
        playerPaddle.position.y += 5;
      } else if (inputData.input === "left") {
        playerPaddle.position.x -= 5;
      } else if (inputData.input === "right") {
        playerPaddle.position.x += 5;
      }
      playerPaddle.position.y = Math.max(
        0,
        Math.min(HEIGHT, playerPaddle.position.y)
      );
    }
  }

  // /////////////////////////////////////////////////////////
  //
  // SERVER ONLY CODE
  //
  // /////////////////////////////////////////////////////////
  serverSideInit() {
    // create the paddle objects
    this.addObjectToWorld(
      new Paddle(this, null, { position: new TwoVector(PADDING, 0) })
    );
    this.addObjectToWorld(
      new Paddle(this, null, { position: new TwoVector(WIDTH - PADDING, 0) })
    );
    this.addObjectToWorld(
      new Ball(this, null, {
        position: new TwoVector(WIDTH / 2, HEIGHT / 2),
        velocity: new TwoVector(2, 2),
      })
    );
  }

  serverSidePlayerJoined(ev) {
    let paddles = this.world.queryObjects({ instanceType: Paddle });
    if (paddles[0].playerId === 0) {
      paddles[0].playerId = ev.playerId;
      console.log("Assigned to paddle 1");
    } else if (paddles[1].playerId === 0) {
      paddles[1].playerId = ev.playerId;
      console.log("Assigned to paddle 2");
    }
  }

  serverSidePlayerDisconnected(ev) {
    let paddles = this.world.queryObjects({ instanceType: Paddle });
    if (paddles[0].playerId === ev.playerId) {
      paddles[0].playerId = 0;
      console.log("Freed from paddle 1");
    } else if (paddles[1].playerId === ev.playerId) {
      paddles[1].playerId = 0;
      console.log("Freed from paddle 2");
    } else {
      console.log("No associated paddle");
      console.log(paddles[0].playerId, paddles[1].playerId, ev.playerId);
    }
  }

  // /////////////////////////////////////////////////////////
  //
  // CLIENT ONLY CODE
  //
  // /////////////////////////////////////////////////////////
  clientSideInit() {
    this.controls = new KeyboardControls(this.renderer.clientEngine);
    this.controls.bindKey("up", "up", { repeat: true });
    this.controls.bindKey("down", "down", { repeat: true });
    this.controls.bindKey("left", "left", { repeat: true });
    this.controls.bindKey("right", "right", { repeat: true });

    htmlCanvas = document.getElementById("canvas");
    stage = new createjs.Stage("canvas");

    r.paddle1 = new createjs.Shape();
    r.paddle2 = new createjs.Shape();
    r.ball = new createjs.Shape();
    r.paddle1.graphics
      .beginFill("black")
      .drawRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
    r.paddle2.graphics
      .beginFill("black")
      .drawRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
    r.ball.graphics.beginFill("black").drawRect(0, 0, 5, 5);
    stage.addChild(r.paddle1, r.paddle2, r.ball);
  }

  clientSideDraw() {
    let paddles = this.world.queryObjects({ instanceType: Paddle });
    let ball = this.world.queryObject({ instanceType: Ball });
    if (!ball || paddles.length !== 2) return;

    r.ball.x = ball.position.x;
    r.ball.y = ball.position.y;

    r.paddle1.x = paddles[0].position.x;
    r.paddle1.y = paddles[0].position.y;
    r.paddle2.x = paddles[1].position.x;
    r.paddle2.y = paddles[1].position.y;

    stage.update();
    /*
        function updateEl(el, obj) {
            let health = obj.health>0?obj.health:15;
            el.style.top = obj.position.y + 10 + 'px';
            el.style.left = obj.position.x + 'px';
            el.style.background = `#ff${health.toString(16)}f${health.toString(16)}f`;
        }

        let paddles = this.world.queryObjects({ instanceType: Paddle });
        let ball = this.world.queryObject({ instanceType: Ball });
        if (!ball || paddles.length !== 2) return;
        updateEl(document.querySelector('.ball'), ball);
        updateEl(document.querySelector('.paddle1'), paddles[0]);
        updateEl(document.querySelector('.paddle2'), paddles[1]);
        */
  }
}

import { Renderer } from 'lance-gg';
let PIXI;
import Ship from '../common/Ship';
import ExplosionEmitterConfig from './ExplosionEmitter.js'
import {Howl, Howler} from 'howler';
import View from '../common/View.js';


let fgColor = 0x50444F;
let bgColor = 0xE8D9D5;

export default class ExRenderer extends Renderer {
    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine)
        this.fgColor = fgColor;
        this.bgColor = bgColor;
        this.View = View;
        this.isReady = false;
        this.sprites = {};
        this.cameraShake = 0;
        PIXI = require('pixi.js');
        window.PIXI = PIXI;
        window.gameEngine = this.gameEngine;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;
        PIXI.Loader.shared.baseUrl = "assets/images/"; // base url for all resources loaded by the loader

        this.msgTextStyle = {fontFamily: 'serif', fontSize: 8, fill:fgColor, align: 'left'};
        this.announcementTextStyle = {fontFamily: 'serif', fontSize: 12, fill:fgColor, align: 'center'};

        this.sounds = {
            fireBullet: new Howl({
                src: 'assets/audio/fireBullet.wav'
            }),
            takeDamage: new Howl({
                src: 'assets/audio/takeDamage.wav'
            }),
            shipDestroyed: new Howl({
                src: 'assets/audio/shipDestroyed.wav'
            }),
            receiveMessage : new Howl({
                src: 'assets/audio/receiveMessage.wav'
            }),
            sendMessage: new Howl({
                src: 'assets/audio/sendMessage.wav'
            }),
            collide: new Howl({
                src: 'assets/audio/collide.wav'
            }),
            playerHurt: new Howl({
                src: 'assets/audio/playerHurt.wav'
            }),
            smallCollide: new Howl({
                src: 'assets/audio/smallCollide.wav'
            }),
            spawn: new Howl({
                src: 'assets/audio/spawn.wav'
            }),
        }
    }


    // dict of image/asset locations and titles
    get manifest() {
        return {
            ship: "ship.png",
            square: "square.png",
            bullet: "bullet.png",
            test: "test.png",
            spawnparticle: "spawnparticle.png",
            messageFont: "arial-11px.fnt",
            announcementFont: "arial-11px.fnt",
            barricade: "barricade.png"
        }
    }


    init() {
        this.viewportHeight = 135;
        this.viewportWidth = 240;

        // initialize primary stage and view layers, as well as camera layer
        this.stage = new PIXI.Container();
        this.layer1 = new PIXI.Container();
        this.layer2 = new PIXI.Container();
        this.layer3 = new PIXI.Container();
        this.stage.addChild(this.layer1, this.layer2, this.layer3);

        // run onDOMLoaded if DOM loaded
        if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') {
            this.onDOMLoaded();
        } else {
            document.addEventListener('DOMContentLoaded', ()=>{
                this.onDOMLoaded();
            });
        }


        return new Promise((resolve, reject) => {

            let borderWidth = 5;
            let worldWidth = this.gameEngine.worldSettings.width;
            let worldHeight = this.gameEngine.worldSettings.height;
            let stageBoundaries = new PIXI.Graphics();
            stageBoundaries.beginFill(fgColor);
            stageBoundaries.drawRect(-worldWidth, -worldHeight-borderWidth, worldWidth*2+borderWidth, borderWidth) // topleft to topright
            stageBoundaries.drawRect(-worldWidth-borderWidth, -worldHeight-borderWidth, borderWidth, worldHeight*2+borderWidth); // topleft to bottomleft
            stageBoundaries.drawRect(-worldWidth-borderWidth, worldHeight, worldWidth*2+borderWidth, borderWidth); // bottomleft to bottomright
            stageBoundaries.drawRect(worldWidth, -worldHeight, borderWidth, worldHeight*2+borderWidth); // topright to bottomright;
            this.layer3.addChild(stageBoundaries);

            // format manifest for pixi to preload assets
            console.log("manifest", this.manifest)
            let pixiManifest = Object.keys(this.manifest).map(o => {
                return {
                    name: o,
                    url: this.manifest[o]
                }
            })

            PIXI.Loader.shared.add(pixiManifest).load((loader, resources) => {



                this.resources = resources; // store preloaded PIXI.js resources on renderer object

                this.camera = new PIXI.Container();
                this.camera.addChild(this.layer1, this.layer2, this.layer3);

                this.paddingLayer = new PIXI.Container();
                this.stage.addChild(this.paddingLayer);

                this.stage.addChild(this.camera);

                this.hudLayer = new PIXI.Container();
                this.stage.addChild(this.hudLayer);

                this.announcement = new PIXI.Text('', this.announcementTextStyle);
                this.announcement.position.set(this.viewportWidth/2, this.viewportHeight/2);
                this.announcement.anchor.set(0.5, 0.5); this.hudLayer.addChild(this.announcement);

                this.cooldownBar = new PIXI.Graphics() // cooldown bar for firing rate
                this.cooldownBar.position.set(5, this.viewportHeight - 10);
                this.hudLayer.addChild(this.cooldownBar);


                this.chatBox = new PIXI.Container(); // main chatbox container
                this.chatBox.position.set(this.viewportWidth - this.viewportWidth*0.60 - 5, -15)

                this.chatGraphics = new PIXI.Graphics(); // group graphics elements together for toggling opacity
                this.chatGraphics.alpha = 0;
                this.chatGraphics.beginFill(fgColor, 0.05); // draw main box
                this.chatGraphics.drawRect(0, 0, this.viewportWidth*0.60, this.viewportHeight*3);
                this.chatGraphics.beginFill(fgColor, 0.6); // draw separator
                this.chatGraphics.drawRect(0, this.viewportHeight, this.viewportWidth*0.60, 1);
                this.chatBox.addChild(this.chatGraphics);
                this.hudLayer.addChild(this.chatBox);

                this.chatHistory = new PIXI.Container;
                this.chatHistory.position.set(0, -10);
                this.chatBox.addChild(this.chatHistory);
                this.msgStackHeight = 0;
                this.chatScrollOffset = 0;

                let yourMessage = new PIXI.Text('', this.msgTextStyle);
                yourMessage.position.set(0, this.viewportHeight);
                this.chatGraphics.addChild(yourMessage);

                // chatinput set by clientengine
                this.chatInput.addEventListener("blur", (e) => {
                    yourMessage.text = '';
                });
                this.chatInput.addEventListener("input", (e) => {
                    yourMessage.text = this.chatInput.value;
                });

                this.isReady = true
                resolve();
                this.gameEngine.emit('renderer.ready');
            });
        });
    }



    draw(t, dt) {
        super.draw(t, dt);
        let now = Date.now();

        if (!this.isReady) return;

        // update general properties for app sprites and their objects
        for (let objId of Object.keys(this.sprites)) {
            let objData = this.gameEngine.world.objects[objId];
            let sprite = this.sprites[objId];

            if (objData) objData.draw();
        }

        // render the main stage container (everything is parented to this)
        this.renderer.render(this.stage);

        let cameraTarget;
        // cooldown bar animation
        this.cooldownBar.clear();
        if (this.playerShip) {
            let cooldownBarLength = 60;
            if (this.playerShip.cooldown && this.gameEngine.timer.currentTime - this.playerShip.cooldown.startOffset < this.playerShip.cooldown.time) {
                let cooldownTime = this.gameEngine.timer.currentTime - this.playerShip.cooldown.startOffset;
                cooldownBarLength = Math.min(cooldownTime/this.playerShip.cooldown.time, 1) * 60;
                this.cooldownBar.alpha = 0.4;
            } else {this.cooldownBar.alpha = 0.7;}
            this.cooldownBar.beginFill(0xffdd00);
            this.cooldownBar.drawRect(0,0,cooldownBarLength,5);

            // center the camera
            cameraTarget = this.playerShip;
        }
        if (cameraTarget) {
            this.centerCamera(cameraTarget.position.x, cameraTarget.position.y);
        }
        // apply camera shake
        this.camera.position.x += (Math.random()-0.5)*this.cameraShake
        this.camera.position.y += (Math.random()-0.5)*this.cameraShake
        this.cameraShake = Math.lerp(this.cameraShake, 0, 0.10);

        this.chatHistory.position.y = Math.lerp(this.chatHistory.position.y, this.chatScrollOffset, 0.10);

    }

    centerCamera(x, y) {
        if (isNaN(x) || isNaN(y)) return;

        //this.camera.position.set(this.viewportWidth/2, this.viewportHeight/2);
        this.camera.x = Math.lerp(this.camera.x, this.viewportWidth / 2 - x, 0.10);
        this.camera.y = Math.lerp(this.camera.y, this.viewportHeight / 2 - y, 0.10);

    }

    toggleChat(enabled) { // called by clientEngine, toggles chatbox UI on and off
        this.chatHistory.children.forEach(text => {
            if (enabled) text.alpha = 1;
            else {
                text.alpha = text.offAlpha;
            }
        })
        if (enabled) {
            this.chatGraphics.alpha = 1;
        } else {
            this.chatGraphics.alpha = 0;
            this.chatScrollOffset = -this.msgStackHeight; // reset scroll position when exiting chat
        }
    }

    displayMessage(text) {
        let newMessage = new PIXI.Text(text, this.msgTextStyle);
        newMessage.offAlpha = 1 // alpha value when the chatbox is off,
        let doScroll = false;
        if (this.chatScrollOffset >= -this.msgStackHeight) doScroll = true;
        this.msgStackHeight += 10;
        newMessage.position.set(0, this.viewportHeight+this.msgStackHeight-10);
        this.chatHistory.addChild(newMessage);
        if (doScroll) this.chatScrollOffset = -this.msgStackHeight;
        this.gameEngine.timer.add(300, (newMessage) => {
            newMessage.offAlpha = 0;
            if (this.chatGraphics.alpha == 0) newMessage.alpha = newMessage.offAlpha;
        }, this, [newMessage]);
    }
    onDOMLoaded() {
        // add PIXI renderer to document when ready
        this.renderer = PIXI.autoDetectRenderer({width: this.viewportWidth, height: this.viewportHeight});
        this.renderer.backgroundColor = bgColor;
        //this.renderer.view.classList.add("nes-container", "is-rounded");
        let canvasContainer = document.getElementById("canvas-container");
        canvasContainer.appendChild(this.renderer.view);
    }
}
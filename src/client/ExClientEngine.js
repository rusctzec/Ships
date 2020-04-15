import { ClientEngine, KeyboardControls } from "lance-gg";
import ExRenderer from "../client/ExRenderer";
//import MobileControls from './MobileControls';
import Ship from "../common/Ship";
//import Utils from '../common/Utils';

export default class ExClientEngine extends ClientEngine {
  constructor(gameEngine, options) {
    super(gameEngine, options, ExRenderer);
    gameEngine.clientEngine = this; // yeah
    this.chatMode = false;
    this.chatInput = document.createElement("input"); // use hidden textinput to capture player chat
    this.chatInput.setAttribute("type", "text");
    this.chatInput.style.opacity = 0;
    this.chatInput.style.width = "0px";
    this.chatInput.style.height = "0px";
    this.gameEngine.renderer.chatInput = this.chatInput;
    document.body.appendChild(this.chatInput);
  }

  start() {
    console.log("client engine started!");

    this.gameEngine.on("objectDestroyed", (obj) => {});

    this.gameEngine.once("renderer.ready", () => {
      console.log("renderer.ready!!!");
      this.controls = new KeyboardControls(this);
      this.controls.bindKey("left", "left", { repeat: true });
      this.controls.bindKey("right", "right", { repeat: true });
      this.controls.bindKey("up", "up", { repeat: true });
      this.controls.bindKey("down", "down", { repeat: true });
      this.controls.bindKey("space", "fire", { repeat: false });
      this.controls.bindKey("enter", "enter", { repeat: false });
      this.controls.bindKey("m", "missile", { repeat: false });

      this.boundKeys = this.controls.boundKeys;

      this.chatInput.addEventListener("blur", (e) => {
        this.chatMode = false;
        this.chatInput.value = "";
        this.controls.boundKeys = this.boundKeys;
        this.renderer.toggleChat(this.chatMode);
      });

      document.addEventListener("keydown", (e) => {
        if (!this.chatMode) {
          if (e.code == "KeyT") {
            e.preventDefault();
            this.chatInput.value = "";
            this.chatInput.focus();
            this.chatMode = true;
            this.controls.boundKeys = {};
            this.renderer.toggleChat(this.chatMode);
          }
        } else {
          if (e.code == "Escape") {
            this.chatInput.blur();
          } else if (e.code == "Enter") {
            this.socket.emit("chatMessage", this.chatInput.value.trim());
            this.chatInput.blur();
          }
        }
      });
    });

    super.start();
  }

  connect() {
    console.log("connect...");
    return super.connect().then(() => {
      console.log("client engine connect function run");

      this.socket.on("disconnect", (e) => {
        this.gameEngine.renderer.announcement.text = "server disconnected";
        console.log("disconnected...");
      });

      this.socket.on("chatMessage", (message, username, playerId) => {
        this.gameEngine.renderer.displayMessage(`<${username}>: ${message}`);
        if (playerId == this.gameEngine.playerId) {
          this.gameEngine.renderer.sounds.sendMessage.play();
        } else {
          this.gameEngine.renderer.sounds.receiveMessage.play();
        }
      });

      this.socket.emit("requestRestart");
    });
  }

  sendInput(input, inputOptions) {
    if (!this.chatMode) {
      super.sendInput(input, inputOptions);
    }
  }
}

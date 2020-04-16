import { ServerEngine } from 'lance-gg';
import passport from '../config/passport';
import Barricade from '../common/Barricade';
import Ship from '../common/Ship';
export default class ExServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        gameEngine.serverEngine = this;
        this.scoreData = {};
    }


    start() {
        super.start();
        console.log("server engine started!")

        this.spawnBarricade();
    }

    spawnBarricade() {
        let barricades = this.gameEngine.world.queryObjects({
            instanceType: Barricade
        });
        let ships = this.gameEngine.world.queryObjects({
            instanceType: Ship
        });
        if (ships.length > 0) {
            this.gameEngine.makeBarricade();
        }

        let timeToNext = 60*Math.pow(1.5,barricades.length*2)/((this.gameEngine.worldSettings.width+this.gameEngine.worldSettings.height)/200);

        this.gameEngine.timer.add(timeToNext, () => {
            this.spawnBarricade();
        })
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        console.log("player connected")
        let makePlayerShip = () => {
            console.log("requestRestart: makePlayerShip")
            let ship = this.gameEngine.makeShip(socket.playerId, "player "+socket.playerId);

            this.scoreData[ship.id] = {
                kills: 0,
                name: socket.playerId
            }
        }

        socket.on('requestRestart', makePlayerShip);

        socket.on('chatMessage', (message) => {
            this.io.sockets.emit('chatMessage', message.substring(0, 280), `player ${socket.playerId}`, socket.playerId);
        });
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);

        let playerObjects = this.gameEngine.world.queryObjects({ playerId: playerId });
        playerObjects.forEach( obj => {
            this.gameEngine.removeObjectFromWorld(obj.id);

            delete this.scoreData[obj.id];
        })
    }
}
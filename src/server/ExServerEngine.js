import { ServerEngine } from 'lance-gg';

export default class ExServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.scoreData = {};
    }


    start() {
        super.start();
        console.log("server engine started!")
    }



    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        console.log("player connected d")
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
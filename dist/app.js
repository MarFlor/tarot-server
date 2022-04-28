"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const event_helper_1 = require("./helpers/event-helper");
const various_1 = require("./helpers/various");
const app = (0, express_1.default)();
let http = require("http").Server(app);
const port = 8080;
let io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
let connNicks = new Array();
let availRooms = new Array();
const roomCardReadings = new Array();
const rawdata = fs_1.default.readFileSync('src/files/cards.json');
const allCards = JSON.parse(rawdata.toString('utf-8'));
io.on("connection", function (socket) {
    return __awaiter(this, void 0, void 0, function* () {
        connNicks = yield (0, event_helper_1.SetNickToSockets)(io, connNicks);
        const temp = connNicks.find(o => o.id == socket.id);
        io.to(socket.id).emit('socketDetails', temp);
        // whenever we receive a 'message' we log it out
        socket.on("enter-room", function (roomName) {
            return __awaiter(this, void 0, void 0, function* () {
                yield socket.join(roomName);
                availRooms = yield (0, event_helper_1.GetAllRooms)(io, connNicks);
                const roomDetails = availRooms.find(o => o.roomName == roomName);
                io.to(roomName).emit('enteredRoomDetails', roomDetails);
                if (!roomCardReadings.find(o => o.roomName == roomName)) {
                    let suffleDeck = (0, various_1.ShuffleDeck)(allCards);
                    const emptyBoard = Array();
                    let reading = { roomName: roomName, roomId: roomName, remainingShuffeledCards: suffleDeck, seletectedCardsInBoard: emptyBoard };
                    roomCardReadings.push(reading);
                    console.log("Shuffeling ## room ", roomName);
                }
                io.to(roomName).emit('remainingShuffeledCards', roomCardReadings.find(o => o.roomName == roomName));
            });
        });
        socket.on("getRoomDetails", function (roomName) {
            return __awaiter(this, void 0, void 0, function* () {
                availRooms = yield (0, event_helper_1.GetAllRooms)(io, connNicks);
                const roomDetails = availRooms.find(o => o.roomName == roomName);
                io.to(roomName).emit('enteredRoomDetails', roomDetails);
                io.to(roomName).emit('toRoomMessage', "Espera un momento estamos en " + roomName);
            });
        });
        socket.on("leaveRoom", function (roomName) {
            return __awaiter(this, void 0, void 0, function* () {
                socket.leave(roomName);
                connNicks = yield (0, event_helper_1.SetNickToSockets)(io, connNicks);
                availRooms = yield (0, event_helper_1.GetAllRooms)(io, connNicks);
                const roomDetails = availRooms.find(o => o.roomName == roomName);
                if (roomDetails) {
                    io.to(roomName).emit('enteredRoomDetails', roomDetails);
                }
                else {
                    const index = roomCardReadings.findIndex(o => o.roomName == roomName);
                    roomCardReadings.splice(index);
                    console.log("roomCardReadings removed ", roomCardReadings);
                }
            });
        });
        socket.on("getShuffeledCards", function (roomName) {
            if (!roomCardReadings.find(o => o.roomName == roomName)) {
                let suffleDeck = (0, various_1.ShuffleDeck)(allCards);
                let reading = { roomName: roomName, roomId: roomName, remainingShuffeledCards: suffleDeck, seletectedCardsInBoard: null };
                roomCardReadings.push(reading);
            }
            io.to(roomName).emit('remainingShuffeledCards', roomCardReadings.find(o => o.roomName == roomName));
        });
        socket.on("selectCard", function (roomName, cardId) {
            const roomCards = roomCardReadings.find(o => o.roomName == roomName);
            let cards = roomCards.remainingShuffeledCards.filter(o => o.id !== cardId);
            roomCardReadings.find(o => o.roomName == roomName).remainingShuffeledCards = cards;
            let cardsInBoard = roomCards.seletectedCardsInBoard;
            if (cardsInBoard && cardsInBoard.length > 2) {
                cardsInBoard = [];
            }
            cardsInBoard.push(allCards.find(o => o.id == cardId));
            roomCardReadings.find(o => o.roomName == roomName).seletectedCardsInBoard = cardsInBoard;
            io.to(roomName).emit('remainingShuffeledCards', roomCardReadings.find(o => o.roomName == roomName));
        });
        socket.on("disconnect", (reason) => __awaiter(this, void 0, void 0, function* () {
            console.log(socket.id + " disconnetect ", reason);
            io.emit('message', 'desconectado ' + socket.id + ' - ' + reason);
            connNicks = yield (0, event_helper_1.SetNickToSockets)(io, connNicks);
            availRooms = yield (0, event_helper_1.GetAllRooms)(io, connNicks);
        }));
    });
});
app.get('/', (req, res) => {
    res.json({ Hello: 'World' });
});
app.get('/pepe', (req, res) => {
    res.json({ answer: 42 });
});
const server = http.listen(port, function () {
    console.log("listening on *:8080");
});
//# sourceMappingURL=app.js.map
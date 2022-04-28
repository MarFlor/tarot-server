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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomNickName = exports.SetNickToSockets = exports.GetAllRooms = void 0;
const GetAllRooms = (io, connNicks) => {
    // https://simplernerd.com/js-socketio-active-rooms/
    const arr = Array.from(io.sockets.adapter.rooms);
    // Filter rooms whose name exist in set:
    const filtered = arr.filter(room => !room[1].has(room[0]));
    let roomsTemp = new Array();
    // Return only the room name:
    for (let oneRoom of filtered.map(i => i[0])) {
        let clients = new Array();
        for (let member of io.sockets.adapter.rooms.get(oneRoom)) {
            let temp = connNicks.find(o => o.id == member);
            if (temp) {
                clients.push(temp);
            }
        }
        let room = { roomName: oneRoom, roomId: oneRoom, clients: clients };
        roomsTemp.push(room);
    }
    console.log("GetAllRooms", roomsTemp);
    return Promise.resolve(roomsTemp);
};
exports.GetAllRooms = GetAllRooms;
const SetNickToSockets = (io, connNicks) => __awaiter(void 0, void 0, void 0, function* () {
    const sockets = (yield io.fetchSockets()).map((socket) => socket.id);
    sockets.map((item) => {
        if (!connNicks.find(o => o.id == item)) {
            connNicks.push({ id: item, nick: RandomNickName() });
        }
    });
    connNicks.map((item, index) => {
        if (!sockets.find((o) => o == item.id)) {
            connNicks.splice(index);
        }
    });
    console.log("connNicks", connNicks);
    return Promise.resolve(connNicks);
});
exports.SetNickToSockets = SetNickToSockets;
const RandomNickName = () => {
    const nicks = ['Luna', 'Fobos', 'Haumea', 'Ariel', 'Titania', 'Deimos', 'Tritón', 'Miranda', 'Jápeto', 'Urano', 'Europa', 'Ganymede', 'Callisto', 'Amaltea', 'Himalia', 'Elara', 'Pasiphae', 'Sinope', 'Lysithea', 'Carme', 'Ananke'];
    const random = Math.floor(Math.random() * nicks.length);
    return nicks[random];
};
exports.RandomNickName = RandomNickName;
//# sourceMappingURL=event-helper.js.map
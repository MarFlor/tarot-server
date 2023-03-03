import express from 'express';
import fs from 'fs';
import { TarotCard, RoomDetails, RoomCardReading } from './types/tarot-card';
import { GetAllRooms, SetNickToSockets } from './helpers/event-helper';
import { ShuffleDeck } from './helpers/various';

const app = express();
let http = require("http").Server(app);

const port = 8080;

let io = require("socket.io")(http, {

    cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
});

let connNicks = new Array<ClientSocketDetails>();
let availRooms = new Array<RoomDetails>();
const roomCardReadings = new Array<RoomCardReading>();

const rawdata = fs.readFileSync('src/files/cards.json');
const allCards : TarotCard[] = JSON.parse(rawdata.toString('utf-8'));

io.on("connection", async function(socket: any) {
  
  console.log("start connection > ", socket.id); 
  
  //return all avaible connections with nick and avatar
  io.to(socket.id).emit('yourSockerId', socket.id);

  socket.on("getNickAvatar", async function(socketId: string) {
    
    const allSockets : Array<string> = (await io.fetchSockets()).map((socket : any) => socket.id);

    connNicks = await SetNickToSockets(allSockets, connNicks);
    
    const temp = connNicks.find(o => o.id == socket.id)
    
    io.to(socket.id).emit('socketDetails', temp);
  });

  // whenever we receive a 'message' we log it out
  socket.on("enter-room", async function(roomName: string) {
    
    await socket.join(roomName);

    availRooms = await GetAllRooms(io, connNicks)

    const roomDetails = availRooms.find(o => o.roomName == roomName);
    io.to(roomName).emit('enteredRoomDetails', roomDetails);

    if(!roomCardReadings.find(o => o.roomName == roomName))
    {
      let suffleDeck : TarotCard[] = ShuffleDeck(allCards);
      const emptyBoard = Array<TarotCard>();

      let reading : RoomCardReading = { roomName : roomName, roomId : roomName, remainingShuffeledCards : suffleDeck, seletectedCardsInBoard : emptyBoard }
      roomCardReadings.push(reading)

      //console.log("Shuffeling ## room ", roomName); 
    }

    io.to(roomName).emit('remainingShuffeledCards', roomCardReadings.find(o => o.roomName == roomName));

  });

  socket.on("getRoomDetails", async function(roomName: string) {
    
    availRooms = await GetAllRooms(io, connNicks)

    const roomDetails = availRooms.find(o => o.roomName == roomName);
    io.to(roomName).emit('enteredRoomDetails', roomDetails);

  });

  socket.on("leaveRoom", async function(roomName: string) {
    
    socket.leave(roomName);
    
    availRooms = await GetAllRooms(io, connNicks)

    const roomDetails = availRooms.find(o => o.roomName == roomName);

    if(roomDetails) 
    {
      io.to(roomName).emit('enteredRoomDetails', roomDetails);
    }
    else
    {
      const index = roomCardReadings.findIndex(o => o.roomName == roomName);
      roomCardReadings.splice(index)
    }

  });

  socket.on("getShuffeledCards", function(roomName: string) {
    
    if(!roomCardReadings.find(o => o.roomName == roomName))
    {
      let suffleDeck : TarotCard[] = ShuffleDeck(allCards);
      let reading : RoomCardReading = { roomName : roomName, roomId : roomName, remainingShuffeledCards : suffleDeck, seletectedCardsInBoard : null }
      roomCardReadings.push(reading)
    }

    io.to(roomName).emit('remainingShuffeledCards', roomCardReadings.find(o => o.roomName == roomName));
  });

  socket.on("selectCard", function(roomName: string, cardId : string) {
    
    const roomCards =  roomCardReadings.find(o => o.roomName == roomName)
    let cards = roomCards.remainingShuffeledCards.filter(o => o.id !== cardId)
    roomCardReadings.find(o => o.roomName == roomName).remainingShuffeledCards = cards

    let cardsInBoard = roomCards.seletectedCardsInBoard;
    if(cardsInBoard && cardsInBoard.length > 2)
    {
        cardsInBoard = [];
    }

    cardsInBoard.push(allCards.find(o => o.id == cardId));
    roomCardReadings.find(o => o.roomName == roomName).seletectedCardsInBoard = cardsInBoard

    io.to(roomName).emit('remainingShuffeledCards', roomCardReadings.find(o => o.roomName == roomName));
  });

  socket.on("disconnect", async (reason: string) => {
    console.log(socket.id + " disconnetect ", reason);
    
    io.emit('message', 'desconectado ' + socket.id + ' - ' + reason);
  });
});

app.get('/', (req, res) => {
    res.json({ Hello: 'World' });
});

app.get('/pepe', (req, res) => {
    res.json({ answer: 42 });
});

const server = http.listen(port, function() {
    console.log("listening on *:8080");
});
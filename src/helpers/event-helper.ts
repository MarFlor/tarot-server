import { RoomDetails } from "../types/tarot-card";
import fs from 'fs';

const allNicks = JSON.parse(fs.readFileSync('src/files/nicks.json').toString('utf-8'));

const GetAllRooms = (io: any, connNicks : Array<ClientSocketDetails>) : Promise<RoomDetails[]> => {

    // https://simplernerd.com/js-socketio-active-rooms/
    const arr = Array.from(io.sockets.adapter.rooms)
    
    // Filter rooms whose name exist in set:
    const filtered = arr.filter(room => !room[1].has(room[0]))
  
    let roomsTemp = new Array<RoomDetails>();
  
    // Return only the room name:
    for (let oneRoom of filtered.map(i => i[0])) 
    { 
      let clients : Array<ClientSocketDetails> = new Array<ClientSocketDetails>();
  
      for (let member of io.sockets.adapter.rooms.get(oneRoom)) 
      { 
        let temp = connNicks.find(o => o.id == member);
        
        if(temp)
        {
          clients.push(temp)
        }
      }
      
      let room : RoomDetails = { roomName : oneRoom, roomId : oneRoom, clients : clients };
      roomsTemp.push(room);
    }
  
    console.log("GetAllRooms", roomsTemp)
    return Promise.resolve(roomsTemp)
}

const SetNickToSockets = async (io : any, connNicks : ClientSocketDetails[]) : Promise<ClientSocketDetails[]> => {
  
    const sockets = (await io.fetchSockets()).map((socket : any) => socket.id);

    console.log("sockets", sockets);

    //add new sockets
    sockets.map((item : string) => {

      if(!connNicks.find(o => o.id == item))
      {
        const avatar = RandomAvatar();
        connNicks.push({ id :item, nick : RandomNickName(), avatar : avatar })
      }

    });
    
    //remove disconnected sockets
    connNicks.map((item, index) => {

      if(!sockets.find((o: string) => o == item.id))
      {
        connNicks.splice(index)
      }
    })

    console.log("connNicks", connNicks)
    return Promise.resolve(connNicks)
}

const RandomNickName = () : string => {
    const random = Math.floor(Math.random() * allNicks.length);
    return allNicks[random];
}

const RandomAvatar = () : string => {
  const avatars : Array<string> = 
  [
    'https://react.semantic-ui.com/images/avatar/large/jenny.jpg', 
    'https://semantic-ui.com/images/avatar/large/daniel.jpg', 
    'https://semantic-ui.com/images/avatar/large/helen.jpg', 
    'https://react.semantic-ui.com/images/avatar/large/matthew.png', 
    'https://react.semantic-ui.com/images/avatar/large/molly.png', 
    'https://react.semantic-ui.com/images/avatar/large/elliot.jpg'
  ]
  const random = Math.floor(Math.random() * avatars.length);

  console.log("avatars[random]", avatars[random])

  return avatars[random].toString();
}

export {GetAllRooms, SetNickToSockets, RandomNickName}
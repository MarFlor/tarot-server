import { RoomDetails } from "../types/tarot-card";
import fs from 'fs';

const allNicks = JSON.parse(fs.readFileSync('src/files/nicks.json').toString('utf-8'));

const GetAllRooms = (io: any, connNicks : Array<ClientSocketDetails>) : Promise<RoomDetails[]> => {

  // https://simplernerd.com/js-socketio-active-rooms/
    const arr = Array.from(io.sockets.adapter.rooms)
    
    // Filter rooms whose name exist in set:
    const filtered = arr.filter(room => !room[1].has(room[0]))
  
    let roomsTemp = new Array<RoomDetails>();
  
    // Return clients in the room name:
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
    
    return Promise.resolve(roomsTemp)
}

const SetNickToSockets = async (currentSockets : Array<string>, connNicks : ClientSocketDetails[]) : Promise<ClientSocketDetails[]> => {
  
    //remove disconnected sockets
    connNicks.map((item, index) => {

      if(!currentSockets.find((o: string) => o == item.id))
      {
        
        //remove only one element, not all array!
        connNicks.splice(index, 1)
      }
    })

    //add new sockets if they are not found
    currentSockets.map((item : string) => {

      if(!connNicks.find(o => o.id == item) || connNicks.length == 0)
      {
        const avatar = RandomAvatar();
        connNicks.push({ id :item, nick : RandomNickName(), avatar : avatar })
      }

    });
    
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
    'https://react.semantic-ui.com/images/avatar/large/elliot.jpg',
    'https://semantic-ui.com/images/avatar2/large/rachel.png',
    'https://semantic-ui.com/images/avatar2/large/lindsay.png',
    'https://semantic-ui.com/images/avatar/large/veronika.jpg',
    'https://semantic-ui.com/images/avatar/large/stevie.jpg',
    'https://semantic-ui.com/images/avatar/large/christian.jpg',
    'https://semantic-ui.com/images/avatar/large/tom.jpg',
    'https://semantic-ui.com/images/avatar2/large/lena.png',
    'https://semantic-ui.com/images/avatar2/large/mark.png'

  ]
  const random = Math.floor(Math.random() * avatars.length);

  return avatars[random].toString();
}

export {GetAllRooms, SetNickToSockets, RandomNickName}
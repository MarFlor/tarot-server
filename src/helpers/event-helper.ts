import { RoomDetails } from "../types/tarot-card";

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
  
    sockets.map((item : string) => {
  
      if(!connNicks.find(o => o.id == item))
      {
        connNicks.push({ id :item, nick : RandomNickName() })
      }
    });
  
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
    const nicks : Array<string> = ['Luna', 'Fobos', 'Haumea', 'Ariel', 'Titania', 'Deimos', 'Tritón', 'Miranda', 'Jápeto', 'Urano', 'Europa', 'Ganymede', 'Callisto', 'Amaltea', 'Himalia', 'Elara', 'Pasiphae', 'Sinope', 'Lysithea', 'Carme', 'Ananke' ]
    const random = Math.floor(Math.random() * nicks.length);
    return nicks[random];
}

export {GetAllRooms, SetNickToSockets, RandomNickName}
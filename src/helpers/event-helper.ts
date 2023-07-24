import { RoomDetails } from "../types/tarot-card";
import { Origin, Horoscope } from "circular-natal-horoscope-js";
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

const calculateZodiac = (year : number) : string => {

    let sign = "";
    
    switch (year % 12){
      case 0:
        sign = 'Mono (猴), Leo ♌︎, fijo 🜔';
        break;
      case 1:
        sign = 'Gallo (雞), Virgo ♍︎, Mutable ☿';
        break;
      case 2:
        sign = 'Perro (狗), Libra ♎︎, Cardinal 🜍';
        break;
      case 3:
        sign = 'Cerdo (豬), Escorpio ♏︎, fijo 🜔';
        break;
      case 4:
        sign = 'Rata (鼠), Sagitario ♐︎, Mutable ☿' ;
        break;
      case 5:
        sign = 'Búfalo (牛), Capricornio ♑︎, Cardinal 🜍';
        break;
      case 6:
        sign = 'Tigre (虎), Aquario ♒︎, fijo 🜔';
        break;
      case 7:
        sign = 'Liebre (兔), Piscis ♓︎, Mutable ☿';
        break;
      case 8:
        sign = 'Dragón (龍), Aries ♈︎, Cardinal 🜍';
        break;
      case 9:
        sign = 'Serpiente (蛇), Taurus ♉︎, fijo 🜔';
        break;
      case 10:
        sign = 'Caballo (馬), Géminis ♊︎, Mutable ☿';
        break;
      case 11:
        sign = 'Cabra (羊), Cancer ♋︎, Cardinal 🜍';
        break;
    }

    return sign;
}

const calculateElement = (yearLastNumber : number) : string => {

  console.log("calculateElement yearLastNumber", yearLastNumber);
  
  let sign = "";
  
  switch (yearLastNumber){
    case 0:
    case 1:
      sign = 'Metal (金)';
      break;
    case 2:
    case 3:
      sign = 'Agua (水)';
      break;
    case 4:
    case 5:
      sign = 'Madera (木)';
      break;
    case 6:
    case 7:
      sign = 'Fuego (火)' ;
      break;
    case 8:
    case 9:
      sign = 'Tierra (土)';
      break;
  }

  console.log("calculateElement", sign);

  return sign;
}

const RandomAvatar = () : string => {
  
  /* 
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
  */
  return "https://flores.azurewebsites.net/img/avatar-default.png"
}

const calculateBirthChart = (year : number, month : number, date : number, hour : number, minute : number, latitude : number, longitude : number) : Horoscope => {

  // December 1st, 2020 - 430pm
  const origin = new Origin({
    year: year,
    month: month, // 0 = January, 11 = December!
    date: date,
    hour: hour,
    minute: minute,
    latitude: latitude,
    longitude: longitude,
  });

  const horoscope = new Horoscope({
    origin: origin,
    houseSystem: "placidus", //whole-sign
    zodiac: "tropical",
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ["major", "minor"],
    customOrbs: {},
    language: 'es'
  });

  return horoscope;
}

export {GetAllRooms, SetNickToSockets, RandomNickName, calculateZodiac, calculateElement, calculateBirthChart}
export class TarotCard {

    constructor(
        public id : string,
        public suit : string,
        public name : string,
        public picUrl : string,
        public description : string,
    ){}
}

export interface RoomDetails {
    roomId : string;
    roomName : string;
    clients : Array<ClientSocketDetails>;
}

export interface RoomCardReading {
    remainingShuffeledCards : TarotCard[];
    seletectedCardsInBoard : TarotCard[];
    roomId : string;
    roomName : string;
}


import { MessageModel } from "../../chat/models/message";
import { SOCKET_EVENTS } from "../../consts";
import { SocketIOService } from "../service";

class SocketEventService {
  private static instance: SocketEventService;

  private socketIO: any;

  private constructor() {
    this.socketIO = SocketIOService.instance().getServer();
  }

  public static getInstance(): SocketEventService {
    if (!SocketEventService.instance) {
      SocketEventService.instance = new SocketEventService();
    }
    return SocketEventService.instance;
  }

  public fireMessageEvent(conversationId: string, message: MessageModel) {
    try {
      this.socketIO
        .to(conversationId)
        .emit(SOCKET_EVENTS.MESSAGE, message);
    } catch (e: any) {
      console.error("Error in fireMessageEvent", e.message);
    }
  }

  public fireMessageReadEvent(conversationId: string, messageId: string) {
    try {
      this.socketIO
        .to(conversationId)
        .emit(SOCKET_EVENTS.MESSAGE_READ, messageId);
    } catch (e: any) {
      console.error("Error in fireMessageReadEvent", e.message);
    }
  }
}

export default SocketEventService;

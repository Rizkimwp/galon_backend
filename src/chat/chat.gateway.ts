// src/chat/chat.gateway.ts

import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody()
    data: {
      senderId: number;
      receiverId: number;
      content: string;
    },
  ) {
    const { senderId, receiverId, content } = data;
    // Broadcast message to the receiver
    this.server.to(`user_${receiverId}`).emit('message', { senderId, content });
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: number, client: Socket) {
    client.join(`user_${userId}`);
  }
}

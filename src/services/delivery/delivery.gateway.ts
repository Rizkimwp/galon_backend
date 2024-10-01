// deliveries.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DeliveryService } from './delivery.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Atur sesuai kebutuhan Anda
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
})
export class DeliveryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly deliveriesService: DeliveryService) {}

  @SubscribeMessage('getDeliveriesToday')
  async handleGetDeliveriesToday(@MessageBody() payload: any) {
    console.log(`Received request with customerId: ${payload?.customerId}`);

    if (!payload || !payload.customerId) {
      throw new Error('No customerId provided');
    }

    try {
      const deliveries =
        await this.deliveriesService.getDeliveryByCustomerIdToday(
          payload.customerId,
        );

      console.log('Sending deliveries:', deliveries); // Debug print

      this.server.emit('deliveriesToday', deliveries);
    } catch (error) {
      console.error('Error handling getDeliveriesToday event:', error.message);
      this.server.emit('error', { message: error.message });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
}

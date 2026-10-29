import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'live',
})
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedClients = new Set<string>();
  private isFrozen = false;

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    client.emit('status', {
      connected: true,
      clientsOnline: this.connectedClients.size,
      isFrozen: this.isFrozen,
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('toggle:freeze')
  handleToggleFreeze(client: Socket, payload: { frozen: boolean }) {
    this.isFrozen = payload.frozen;
    this.server.emit('freeze:changed', { isFrozen: this.isFrozen });
    return { success: true, isFrozen: this.isFrozen };
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', timestamp: new Date().toISOString() };
  }
}

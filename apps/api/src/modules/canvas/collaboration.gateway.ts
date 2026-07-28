import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('CollaborationGateway');
  // Store connected clients: socketId -> canvasId
  private clientRooms = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const canvasId = this.clientRooms.get(client.id);
    if (canvasId) {
      this.server.to(canvasId).emit('user-left', { id: client.id });
      this.clientRooms.delete(client.id);
    }
  }

  @SubscribeMessage('join-canvas')
  handleJoinCanvas(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { canvasId: string; user: { id: string; name: string } },
  ) {
    client.join(data.canvasId);
    this.clientRooms.set(client.id, data.canvasId);
    this.logger.log(`Client ${client.id} joined canvas ${data.canvasId}`);

    // Broadcast to others in the room
    client.broadcast.to(data.canvasId).emit('user-joined', {
      id: client.id,
      user: data.user,
    });

    return { event: 'joined', data: { success: true } };
  }

  @SubscribeMessage('leave-canvas')
  handleLeaveCanvas(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { canvasId: string },
  ) {
    client.leave(data.canvasId);
    this.clientRooms.delete(client.id);
    client.broadcast.to(data.canvasId).emit('user-left', { id: client.id });
  }

  @SubscribeMessage('canvas-update')
  handleCanvasUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { canvasId: string; nodes: any[]; edges: any[] },
  ) {
    // Broadcast to all clients in the room EXCEPT the sender
    client.broadcast.to(data.canvasId).emit('canvas-updated', {
      senderId: client.id,
      nodes: data.nodes,
      edges: data.edges,
    });
  }

  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { canvasId: string; position: { x: number; y: number } },
  ) {
    client.broadcast.to(data.canvasId).emit('cursor-moved', {
      userId: client.id,
      position: data.position,
    });
  }
}

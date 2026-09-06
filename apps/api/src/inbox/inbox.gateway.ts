import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ path: '/ws' })
export class InboxGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('InboxGateway');
  // Map client socket to workspaceId
  private clientWorkspaces = new Map<WebSocket, string>();

  handleConnection(client: WebSocket) {
    this.logger.log('Client connected to WebSocket');
  }

  handleDisconnect(client: WebSocket) {
    this.clientWorkspaces.delete(client);
    this.logger.log('Client disconnected from WebSocket');
  }

  @SubscribeMessage('join_workspace')
  handleJoinWorkspace(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: { workspaceId: string }
  ) {
    if (data?.workspaceId) {
      this.clientWorkspaces.set(client, data.workspaceId);
      client.send(JSON.stringify({ event: 'joined_workspace', workspaceId: data.workspaceId }));
    }
  }

  /**
   * Broadcasts real-time events to all clients connected to a specific workspace
   */
  public broadcastToWorkspace(workspaceId: string, event: string, payload: any) {
    const message = JSON.stringify({ event, data: payload });

    for (const [client, clientWorkspaceId] of this.clientWorkspaces.entries()) {
      if (clientWorkspaceId === workspaceId && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}

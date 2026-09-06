'use client';

type MessageHandler = (data: any) => void;

class RealtimeSocketClient {
  private socket: WebSocket | null = null;
  private workspaceId: string | null = null;
  private listeners = new Map<string, Set<MessageHandler>>();
  private reconnectTimer: any = null;

  public connect(workspaceId: string) {
    this.workspaceId = workspaceId;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.socket.send(JSON.stringify({ event: 'join_workspace', data: { workspaceId } }));
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        if (this.workspaceId) {
          this.socket?.send(JSON.stringify({ event: 'join_workspace', data: { workspaceId: this.workspaceId } }));
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const handlers = this.listeners.get(parsed.event);
          if (handlers) {
            handlers.forEach((fn) => fn(parsed.data));
          }
        } catch {
          // ignore parse error
        }
      };

      this.socket.onclose = () => {
        // Automatic exponential reconnection
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          if (this.workspaceId) {
            this.connect(this.workspaceId);
          }
        }, 3000);
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };
    } catch {
      // ignore
    }
  }

  public subscribe(event: string, handler: MessageHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  public disconnect() {
    clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }
}

export const realtimeSocket = new RealtimeSocketClient();

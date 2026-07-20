import { config } from "dotenv";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

config({ path: ".env.local" });

vi.mock("server-only", () => ({}));

if (typeof globalThis.WebSocket === "undefined") {
  class NoopWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    readonly CONNECTING = NoopWebSocket.CONNECTING;
    readonly OPEN = NoopWebSocket.OPEN;
    readonly CLOSING = NoopWebSocket.CLOSING;
    readonly CLOSED = NoopWebSocket.CLOSED;
    readyState = NoopWebSocket.OPEN;
    url = "";
    protocol = "";
    binaryType: BinaryType = "blob";
    bufferedAmount = 0;
    extensions = "";
    onopen: ((this: WebSocket, ev: Event) => unknown) | null = null;
    onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null = null;
    onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null = null;
    onerror: ((this: WebSocket, ev: Event) => unknown) | null = null;

    constructor(url: string) {
      this.url = url;
    }

    close() {
      this.readyState = NoopWebSocket.CLOSED;
    }

    send() {}

    addEventListener() {}

    removeEventListener() {}

    dispatchEvent() {
      return true;
    }
  }

  Object.defineProperty(globalThis, "WebSocket", {
    value: NoopWebSocket,
    configurable: true,
    writable: true,
  });
}

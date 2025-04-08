// src/utils/socketParser.ts

/**
 * Build a TradingView WebSocket message with correct framing
 * @param msgObj Message object to send
 * @returns Formatted message string
 */
export function buildTVMessage(msgObj: any): string {
  const str = JSON.stringify(msgObj);
  return `~m~${str.length}~m~${str}`;
}

/**
 * Send a message to TradingView WebSocket
 * @param socket WebSocket connection
 * @param msgObj Message object to send
 */
export function sendTVMessage(socket: any, msgObj: any): void {
  const frame = buildTVMessage(msgObj);
  socket.send(frame);
}

/**
 * Parse a raw TradingView WebSocket message into individual message frames
 * @param raw Raw message from TradingView
 * @returns Array of parsed messages
 */
export function parseTradingViewMessage(raw: string): string[] {
  const messages = [];
  let currentIndex = 0;

  while (true) {
    const start = raw.indexOf('~m~', currentIndex);
    if (start === -1) break;

    const second = raw.indexOf('~m~', start + 3);
    if (second === -1) break;

    const lengthStr = raw.substring(start + 3, second);
    const length = parseInt(lengthStr, 10);

    if (isNaN(length)) {
      // Probably a control message (e.g. ~m~4~m~~h~1)
      currentIndex = second + 3;
      continue;
    }

    const jsonStart = second + 3;
    const jsonEnd = jsonStart + length;
    const jsonString = raw.substring(jsonStart, jsonEnd);

    messages.push(jsonString);
    currentIndex = jsonEnd;
  }

  return messages;
}

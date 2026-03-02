import { Injectable } from '@angular/core';
import { Observable, Subject, defer, finalize, shareReplay } from 'rxjs';
import type { CoinMarket } from './cryptotokens.service';

const WS_PATH = '/ws/markets';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_DELAY_MS = 30000;

function getWsUrl(): string {
  if (typeof location === 'undefined') return '';
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}${WS_PATH}`;
}

@Injectable({
  providedIn: 'root',
})
export class MarketsWsService {
  private readonly message$ = new Subject<CoinMarket[]>();
  private ws: WebSocket | null = null;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private delay = RECONNECT_DELAY_MS;

  readonly marketUpdates$ = defer(() => {
    this.connect();
    return this.message$.asObservable().pipe(
      finalize(() => this.disconnect()),
    );
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  private connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const url = getWsUrl();
    if (!url) return;

    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        const coins = Array.isArray(data) ? data : [];
        this.message$.next(coins);
      } catch {
        // ignore
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.delay = Math.min(this.delay * 1.5, MAX_RECONNECT_DELAY_MS);
      this.reconnectTimeoutId = setTimeout(() => this.connect(), this.delay);
    };
  }

  private disconnect(): void {
    if (this.reconnectTimeoutId != null) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getMarketUpdates(): Observable<CoinMarket[]> {
    return this.marketUpdates$;
  }
}

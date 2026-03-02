import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { MarketsWsService } from './markets-ws.service';

const API_BASE = '/api';

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap_rank: number | null;
  market_cap?: number | null;
  total_volume?: number | null;
  high_24h?: number | null;
  low_24h?: number | null;
  price_change_percentage_24h?: number | null;
}

export interface MarketsResult {
  coins: CoinMarket[];
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CryptotokensService {
  private readonly http = inject(HttpClient);
  private readonly marketsWs = inject(MarketsWsService);

  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

  private readonly markets$ = this.refreshTrigger$.pipe(
    switchMap(() =>
      this.http.get<CoinMarket[]>(`${API_BASE}/coins/markets`).pipe(
        map((coins) => ({ coins, error: null }) as MarketsResult),
        catchError((err) => {
          console.error('CryptotokensService.getMarkets failed', err);
          const msg =
            err?.error?.error ?? err?.message ?? 'Failed to load tokens. Try again later.';
          return of({ coins: [], error: msg });
        }),
      ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getMarkets(): Observable<MarketsResult> {
    return this.markets$;
  }

  getMarketsWithLiveUpdates(): Observable<MarketsResult> {
    return merge(
      this.markets$,
      this.marketsWs
        .getMarketUpdates()
        .pipe(map((coins) => ({ coins, error: null }) as MarketsResult)),
    );
  }

  refresh(): void {
    this.refreshTrigger$.next();
  }

  getCoinById(id: string): Observable<CoinMarket | null> {
    if (!id) return of(null);
    return this.markets$.pipe(
      map((res) => (res.error ? null : (res.coins.find((c) => c.id === id) ?? null))),
    );
  }
}

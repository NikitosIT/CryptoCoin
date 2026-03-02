import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { map, of, startWith, switchMap } from 'rxjs';
import { CryptotokensService, type CoinMarket } from '../../services/cryptotokens.service';

type CoinLoadState = { status: 'loading' } | { status: 'loaded'; data: CoinMarket | null };

@Component({
  selector: 'app-token-detail',
  standalone: true,
  imports: [DecimalPipe, UpperCasePipe],
  templateUrl: './token-detail.html',
  styleUrl: './token-detail.scss',
})
export class TokenDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly cryptotokens = inject(CryptotokensService);
  readonly coinState = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (!id) return of({ status: 'loaded' as const, data: null });
        return this.cryptotokens
          .getCoinById(id)
          .pipe(map((data) => ({ status: 'loaded' as const, data })));
      }),
      startWith({ status: 'loading' } as const),
    ),
    { initialValue: { status: 'loading' } as CoinLoadState },
  );
}

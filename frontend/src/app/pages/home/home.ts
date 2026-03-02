import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CryptotokensService, type MarketsResult } from '../../services/cryptotokens.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly cryptotokens = inject(CryptotokensService);

  readonly result = toSignal(this.cryptotokens.getMarketsWithLiveUpdates(), {
    initialValue: { coins: [], error: null } as MarketsResult,
  });

  refresh(): void {
    this.cryptotokens.refresh();
  }
}

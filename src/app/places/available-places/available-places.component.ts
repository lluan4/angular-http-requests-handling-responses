import {
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Subscription, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  places = signal<Place[] | undefined>(undefined);
  error = signal<string>('');
  status = signal<'loading' | 'success' | 'empty' | 'error'>('loading');

  ngOnInit() {
    this.status.set('loading');
    const subscription$: Subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places', {
        observe: 'response',
      })
      .pipe(
        map((response) => response.body?.places),
        catchError(({ error }) => {
          return throwError(() => new Error(error?.message));
        })
      )
      .subscribe({
        next: (places) => {
          this.places.set(places);
          this.status.set(places?.length ? 'success' : 'empty');
        },
        error: (error: Error) => {
          this.status.set('error');
          this.error.set(error.message);
        },
      });

    this.destroyRef.onDestroy(() => {
      subscription$.unsubscribe();
    });
  }
}

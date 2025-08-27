import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, Subscription, throwError } from 'rxjs';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  private readonly url: string = 'http://localhost:3000';

  places = signal<Place[] | undefined>(undefined);
  error = signal<string>('');
  status = signal<'loading' | 'success' | 'empty' | 'error'>('loading');

  ngOnInit() {
    this.status.set('loading');
    const subscription$: Subscription = this.httpClient
      .get<{ places: Place[] }>(`${this.url}/user-places`, {
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

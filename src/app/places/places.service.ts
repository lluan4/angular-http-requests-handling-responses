import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private userPlaces = signal<Place[]>([]);
  private readonly url: string = 'http://localhost:3000';

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('places', 'Could not load available places.');
  }

  loadUserPlaces(): Observable<Place[] | undefined> {
    return this.httpClient
      .get<{ places: Place[] }>(`${this.url}/user-places`, {
        observe: 'response',
      })
      .pipe(
        map((response) => response.body?.places),
        tap({
          next: (places) => places && this.userPlaces.set(places),
        }),
        catchError(({ error }) => {
          return throwError(() => new Error(error?.message));
        })
      );
  }

  addPlaceToUserPlaces(place: Place): Observable<Object> {
    this.userPlaces.update((places) => [...places, place]);
    return this.httpClient
      .put(`${this.url}/user-places`, {
        placeId: place.id,
      })
      .pipe(
        tap({
          complete: this.loadUserPlaces,
        })
      );
  }

  removeUserPlace(place: Place) {}

  private fetchPlaces(
    endpoint: string,
    errorMessage?: string
  ): Observable<Place[] | undefined> {
    return this.httpClient
      .get<{ places: Place[] }>(`${this.url}/${endpoint}`, {
        observe: 'response',
      })
      .pipe(
        map((response) => response.body?.places),
        catchError(({ error }) => {
          return throwError(() => new Error(errorMessage || error?.message));
        })
      );
  }
}

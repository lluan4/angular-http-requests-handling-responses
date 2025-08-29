import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, Subscription, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  private placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  private readonly url: string = 'http://localhost:3000';

  places = this.placesService.loadedUserPlaces;
  error = signal<string>('');
  status = signal<'loading' | 'success' | 'empty' | 'error'>('loading');

  ngOnInit() {
    this.status.set('loading');
    const subscription$: Subscription = this.placesService
      .loadUserPlaces()
      .subscribe({
        next: (places) => {
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

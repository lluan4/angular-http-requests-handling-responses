import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { catchError, map, Subscription, throwError } from 'rxjs';
import { Place } from '../place.model';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  private placesServices = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  places = signal<Place[] | undefined>(undefined);
  error = signal<string>('');
  status = signal<'loading' | 'success' | 'empty' | 'error'>('loading');

  ngOnInit() {
    this.status.set('loading');
    const subscription$: Subscription = this.placesServices
      .loadAvailablePlaces()
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

  onSelectPlace(selectedPlace: Place) {
    this.placesServices.addPlaceToUserPlaces(selectedPlace).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}

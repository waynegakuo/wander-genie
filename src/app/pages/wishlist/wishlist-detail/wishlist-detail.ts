import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { NavComponent } from '../../../components/nav/nav';
import { HeroComponent } from '../../../components/hero/hero';
import { FooterComponent } from '../../../shared/footer/footer';
import { ItineraryResultsComponent } from '../../../components/itinerary-results/itinerary-results';
import { WishlistItem } from '../../../models/travel.model';

@Component({
  selector: 'app-wishlist-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavComponent,
    HeroComponent,
    FooterComponent,
    ItineraryResultsComponent,
  ],
  templateUrl: './wishlist-detail.html',
  styleUrl: './wishlist-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistDetailPage {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);

  wishlistItem = signal<WishlistItem | null>(null);
  isLoading = signal(true);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchWishlistItem(id);
    }
  }

  async fetchWishlistItem(id: string) {
    this.isLoading.set(true);
    try {
      const docRef = doc(this.firestore, `wishlists/${id}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.wishlistItem.set({ id: docSnap.id, ...docSnap.data() } as WishlistItem);
      }
    } catch (error) {
      console.error('Error fetching wishlist item:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  printItinerary() {
    window.print();
  }
}

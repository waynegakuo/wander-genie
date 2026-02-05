import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { ToastService } from '../../services/core/toast/toast.service';
import { NavComponent } from '../../components/nav/nav';
import { HeroComponent } from '../../components/hero/hero';
import { FooterComponent } from '../../shared/footer/footer';
import { WishlistItem } from '../../models/travel.model';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterModule, NavComponent, HeroComponent, FooterComponent],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPage {
  wishlistService = inject(WishlistService);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  wishlistItems = this.wishlistService.wishlistItems;

  async removeItem(id: string | undefined) {
    if (!id) return;
    try {
      await this.wishlistService.removeFromWishlist(id);
      this.toastService.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      this.toastService.error('Failed to remove from wishlist');
    }
  }

  checkPrice(item: WishlistItem) {
    if (item.flightData?.googleFlightsUrl) {
      if (isPlatformBrowser(this.platformId)) {
        window.open(item.flightData.googleFlightsUrl, '_blank');
      }
    } else {
      this.toastService.info('Price details are currently unavailable for this itinerary.');
    }
  }

  formatDate(timestamp: any) {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

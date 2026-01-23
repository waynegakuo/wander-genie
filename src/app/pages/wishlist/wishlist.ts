import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { NavComponent } from '../../components/nav/nav';
import { HeroComponent } from '../../components/hero/hero';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, NavComponent, HeroComponent, FooterComponent],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPage {
  wishlistService = inject(WishlistService);
  wishlistItems = this.wishlistService.wishlistItems;

  async removeItem(id: string | undefined) {
    if (!id) return;
    await this.wishlistService.removeFromWishlist(id);
  }

  formatDate(timestamp: any) {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

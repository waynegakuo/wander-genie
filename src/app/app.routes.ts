import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist').then(m => m.WishlistPage)
  },
  {
    path: 'wishlist/:id',
    loadComponent: () => import('./pages/wishlist/wishlist-detail/wishlist-detail').then(m => m.WishlistDetailPage)
  }
];

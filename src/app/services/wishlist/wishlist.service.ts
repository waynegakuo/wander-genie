import { inject, Injectable, signal, effect } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  CollectionReference,
  Unsubscribe,
} from '@angular/fire/firestore';
import { AuthService } from '../core/auth/auth.service';
import { WishlistItem } from '../../models/travel.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private wishlistCollection = collection(this.firestore, 'wishlists') as CollectionReference<WishlistItem>;

  // Signal for the wishlist items
  wishlistItems = signal<WishlistItem[]>([]);
  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    this.initWishlistListener();
  }

  private initWishlistListener() {
    effect(() => {
      const user = this.authService.currentUser();
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      if (user) {
        this.unsubscribe = this.listenToWishlist(user.uid);
      } else {
        this.wishlistItems.set([]);
      }
    });
  }

  /**
   * Starts listening to the user's wishlist
   */
  listenToWishlist(userId: string) {
    const q = query(
      this.wishlistCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      this.wishlistItems.set(items);
    });
  }

  async addToWishlist(item: Omit<WishlistItem, 'id' | 'createdAt'>) {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User must be authenticated to save to wishlist');

    return addDoc(this.wishlistCollection, {
      ...item,
      userId: user.uid,
      createdAt: serverTimestamp(),
    } as any);
  }

  async removeFromWishlist(itemId: string) {
    const docRef = doc(this.firestore, `wishlists/${itemId}`);
    return deleteDoc(docRef);
  }

  async toggleWishlist(item: Omit<WishlistItem, 'id' | 'createdAt'>) {
    const existing = this.wishlistItems().find(
      (i) => i.destination === item.destination && i.itineraryTitle === item.itineraryTitle
    );

    if (existing && existing.id) {
      return this.removeFromWishlist(existing.id);
    } else {
      return this.addToWishlist(item);
    }
  }

  isSaved(destination: string, title: string): boolean {
    return this.wishlistItems().some(
      (i) => i.destination === destination && i.itineraryTitle === title
    );
  }
}

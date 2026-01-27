### AuthService SSR Optimization

The `AuthService` has been updated to improve the user experience during Server-Side Rendering (SSR).

#### Issue
Previously, the `isLoading` signal was being initialized and potentially updated on the server. This caused a "flashing" effect where the UI would briefly show the "Sign In" button (because `isLoading` became `false`) before the client-side Firebase Auth state could be determined.

#### Solution
A platform check using `isPlatformBrowser(PLATFORM_ID)` was added to the `initAuthState` method.

```typescript
  /**
   * Initializes the authentication state listener
   */
  private initAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // Keep isLoading as true on the server to prevent the Sign In button from flashing
      // while the client-side auth state is being determined.
      return;
    }
    return runInInjectionContext(this.environmentInjector, () => {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(!!user);
        this.isLoading.set(false);
      }, (error) => {
        console.error('Auth state change error:', error);
        this.isLoading.set(false);
      });
    })
  }
```

#### Key Changes
1.  **Platform Injection**: Injected `PLATFORM_ID` to distinguish between server and browser environments.
2.  **Early Return**: The `initAuthState` listener is now only registered in the browser.
3.  **Loading State Persistence**: On the server, `isLoading` remains `true` (its default state). This ensures that elements dependent on `isLoading` (like the auth buttons) remain in their loading/placeholder state until the browser takes over and determines the actual authentication status.

#### Developer Note
When working with authentication or any state that depends on browser-only APIs (like Firebase Auth's persistent session), always consider how the initial state will appear during SSR. Keeping a "loading" state active on the server is often better than showing an incorrect "logged out" state.

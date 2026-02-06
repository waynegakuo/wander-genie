# Wander Genie | AI Travel Planner 🧞‍♂️✈️

Wander Genie is a modern, AI-powered travel planning application that transforms your travel dreams into detailed, actionable itineraries. Whether you have a specific plan in mind or just a rough idea, Wander Genie uses the power of Gemini AI to craft the perfect journey for you.

## 🌟 Key Features

### 1. Magic Search (Natural Language Planning)
Just type how you want to travel! Wander Genie uses advanced NLP to extract preferences from your queries.
- *Example:* "I want to travel from New York to Tokyo for 10 days on a luxury budget with my family of 4."
- Automatically detects destinations, origins, group sizes, and budgets.

### 2. Deep Planner
For those who like to be specific, our detailed planning form allows you to fine-tune every aspect of your trip:
- **Travel Style:** Adventure, Relaxation, Cultural, etc.
- **Interests:** Food, History, Nature, Shopping, and more.
- **Logistics:** Select preferred accommodation types and transportation modes.
- **Class & Flexibility:** Specify travel class and date flexibility.

### 3. AI-Generated "User Journey"
Experience your trip before you even leave:
- **Visual Timelines:** A beautified, vertical "User Journey" showing every step of your trip.
- **Smart Flight Links:** Direct links to Google Flights search results tailored to your route and dates.
- **Day-by-Day breakdown:** Curated activities for morning, afternoon, and evening.
- **Dynamic Imagery:** Visual inspiration for your destinations.
- **Practical Travel Tips:** Insider advice for your specific destination.

### 4. Smart Wishlist
Keep track of your dream trips:
- **Save for Later:** Add any generated itinerary to your personal wishlist.
- **Persistent Storage:** Wishlists are synced to Firestore and tied to your Google account.
- **Easy Management:** View and remove saved trips at any time.

### 5. Multi-Currency Flight Deals
Global travel made easy:
- **Real-time Conversion:** View flight prices in your preferred currency (USD, KES, EUR, GBP, etc.).
- **Automatic Formatting:** Currency values are automatically formatted based on regional standards.

### 6. Portable Itineraries
Take your plans offline:
- **Save to PDF/Print:** One-click export of your beautified itinerary for easy access during travel.

### 7. Voice Search (Speech-to-Plan)
Don't want to type? Use your voice:
- **Speech Input:** Just tap the mic and say where you want to go.
- **Real-time Transcription:** Your speech is instantly converted to text and parsed for travel preferences.

## 🛠 Tech Stack

- **Frontend:** [Angular](https://angular.dev/) (v20+) with Standalone Components & Signals.
- **Backend & Hosting:** [Firebase](https://firebase.google.com/) (Functions v2, Hosting, Firestore).
- **Authentication:** [Firebase Auth](https://firebase.google.com/docs/auth) with Google Sign-In.
- **Database:** [Cloud Firestore](https://firebase.google.com/docs/firestore) for user wishlists.
- **AI Orchestration:** [Genkit AI](https://firebase.google.com/docs/genkit) for seamless LLM integration.
- **LLM:** Google Gemini 3 Flash.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm (v20+ recommended)
- Angular CLI (`npm install -g @angular/cli`)
- Firebase CLI (`npm install -g firebase-tools`)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd wander-genie
   ```

2. **Install dependencies:**
   ```bash
   npm install --force
   cd functions && npm install --force && cd ..
   ```

3. **Environment Setup:**
   - Create a `src/environments/environment.development.ts` file (see `src/environments/environment.ts` for the structure).
   - Configure your Firebase secrets for Genkit:
     ```bash
     firebase functions:secrets:set GEMINI_API_KEY
     ```
   - For local development, you'll also need to set the `GEMINI_API_KEY` in your shell environment or a `.env` file in the `functions` directory if running locally without the full emulator secret support.

4. **Run the application:**
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`.

## 🧪 Development

### Local Emulator Suite
Wander Genie is designed to be developed locally using the Firebase Emulator Suite.

1. **Start the emulators:**
   ```bash
   firebase emulators:start
   ```
2. **Start the Angular app in a separate terminal:**
   ```bash
   ng serve
   ```
   *Note: See [EMULATOR_SETUP.md](documentation/EMULATOR_SETUP.md) for a detailed guide on configuring your local environment.*

### Available Scripts
- **Start Dev Server:** `ng serve`
- **Build:** `ng build`
- **Tests:** `ng test`
- **Lint:** `ng lint` (if configured)
- **Deploy:** `firebase deploy`

## 📂 Project Structure

- `src/app/components`: Reusable UI components.
- `src/app/services`: Application logic and Firebase interactions.
- `src/styles.scss`: Global styles and design system tokens.
- `functions/src`: Cloud Functions (Genkit AI logic).
- `documentation/`: Additional setup, architecture guides, and technical notes.

## 🏗 Key Architecture & Code Highlights

Wander Genie combines the power of **Angular Signals**, **Firebase Genkit**, and **Google Gemini** to deliver a seamless travel planning experience.

### 🧠 AI Orchestration (Genkit + Gemini)
The heart of the app lies in the Firebase Functions where we use **Genkit** to define structured AI flows.
- **Structured Output:** We use Zod schemas to ensure the AI always returns a consistent `ItinerarySchema`, including travel tips, day-by-day activities, and even pre-formatted HTML.
- **Dual Planning Flows:** 
  - `generateItineraryFlow`: Handles detailed, form-based planning.
  - `genieItineraryFlow`: Processes natural language queries for "Magic Search".

```typescript
// Example: Defining the structured output schema with Zod
const ItinerarySchema = z.object({
  destination: z.string(),
  tripSummary: z.string(),
  days: z.array(z.object({
    day: z.number(),
    activities: z.object({
      morning: z.string(),
      afternoon: z.string(),
      evening: z.string(),
    })
  })),
  htmlContent: z.string(), // AI generates the visual structure directly
});

// Defining the AI flow
export const _generateItineraryLogic = ai.defineFlow({
  name: 'generateItineraryFlow',
  inputSchema: TravelPreferencesSchema,
  outputSchema: ItinerarySchema,
}, async (input) => {
  const response = await ai.generate({
    prompt: SYSTEM_PROMPT(input),
    output: { schema: ItinerarySchema },
  });
  return response.output;
});
```

*See: `functions/src/index.ts`*

### ⚡ Reactive Frontend (Angular Signals)
The application leverages modern Angular features for a performant and reactive UI.
- **Signals-based State:** Components use `input()`, `output()`, and `computed()` for efficient state management and change detection.
- **Secure Authentication:** Integrated Firebase Auth for a personalized experience.
- **Dynamic Currency Engine:** A dedicated `CurrencyService` handles real-time exchange rates and formatting.
- **Type-Safe Services:** `TravelService` acts as the bridge between the frontend and Firebase Functions, using `httpsCallable` for type-safe communication.
- **Real-time Sync:** `WishlistService` uses Angular Signals and Firestore `onSnapshot` to provide real-time updates of saved itineraries across the app.
- **Intelligent Parsing:** The `extractPreferences` logic in `TravelService` uses regex patterns to instantly extract destinations, budgets, and group sizes from natural language, providing immediate feedback as users type.
- **Speech Recognition:** Integrated Web Speech API via a dedicated `SpeechRecognitionService` for voice-controlled itinerary planning.
- **Component Integration:** A clean, async implementation in the `Home` component manages the UI state (loading, errors, results) while calling the AI orchestration layer.

```typescript
// Calling the AI flow from the Home component
async generateItinerary(): Promise<void> {
  if (!this.canSubmit()) return;

  this.isLoading.set(true);
  this.hasError.set(false);

  try {
    const itinerary = this.nlpQuery().length > 10
      ? await this.travelService.generateGenieItinerary(this.nlpQuery())
      : await this.travelService.generateItinerary(this.travelForm.value);

    this.generatedItinerary.set(itinerary); // Updates the UI via Signal
  } catch (error) {
    this.hasError.set(true);
  } finally {
    this.isLoading.set(false);
  }
}
```

```typescript
// Real-time Firestore sync with Signals in WishlistService
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
    this.wishlistItems.set(items); // Updates all UI components automatically
  });
}
```

```typescript
// Intelligent NLP parsing in TravelService
extractPreferences(text: string): Partial<TravelPreferences> {
  const preferences: Partial<TravelPreferences> = {};
  
  // Regex to extract "to [Destination]"
  const toMatch = text.match(/to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (toMatch) preferences.destination = toMatch[1];

  // Detect group size and budget
  const passengerMatch = text.match(/(\d+)\s*(?:people|passengers|adults)/i);
  if (passengerMatch) preferences.groupSize = parseInt(passengerMatch[1], 10);
  
  if (text.toLowerCase().includes('luxury')) preferences.budget = 'luxury';
  
  return preferences;
}
```

*See: `src/app/pages/home/home.ts`, `src/app/services/travel/travel.service.ts`, `src/app/services/wishlist/wishlist.service.ts`, and `src/app/services/loading/loading-message.service.ts`*

### 🎨 Modern UI/UX
- **User Journey Visualization:** A custom-built vertical timeline that visualizes the AI-generated itinerary.
- **Design System:** A centralized SCSS-based design system using **Ubuntu** for branding, **DM Sans** for UI, and **Inter** for content.
- **Optimized Assets:** Heavy use of `NgOptimizedImage` for performance.
- **UX Delighters:** `LoadingMessageService` cycles through contextually relevant travel messages using Signals to keep users engaged during AI generation.

```typescript
// Engaging loading states with Signals
startCycling() {
  if (isPlatformBrowser(this.platformId) && !this.interval) {
    let index = 0;
    this.messageSignal.set(this.messages[index]);
    this.interval = setInterval(() => {
      index = (index + 1) % this.messages.length;
      this.messageSignal.set(this.messages[index]);
    }, 3000);
  }
}
```

```scss
// Design System Tokens (src/styles/_variables.scss)
:root {
  --font-brand: 'Ubuntu', sans-serif;
  --font-ui: 'DM Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  --color-primary: #6366f1;
  --color-accent: #f59e0b;
}

// Reusable typography classes
.text-brand { font-family: var(--font-brand); }
.text-ui { font-family: var(--font-ui); }
```

---
*Built with ❤️ by [Wayne Gakuo](https://github.com/waynegakuo), for travelers everywhere.*

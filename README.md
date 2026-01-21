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

## 🛠 Tech Stack

- **Frontend:** [Angular](https://angular.dev/) (v20+) with Standalone Components & Signals.
- **Backend & Hosting:** [Firebase](https://firebase.google.com/) (Functions v2, Hosting, Firestore).
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
   npm install
   cd functions && npm install && cd ..
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
- `documentation/`: Additional setup and architecture guides.

---
*Built with ❤️ by [Wayne Gakuo](https://github.com/waynegakuo), for travelers everywhere.*

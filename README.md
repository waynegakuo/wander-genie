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
- **High-Quality Imagery:** Visual inspiration with dynamic images for your destinations.
- **Practical Travel Tips:** Insider advice for your specific destination.

## 🛠 Tech Stack

- **Frontend:** [Angular](https://angular.dev/) (v20+) with Standalone Components & Signals.
- **AI Orchestration:** [Genkit AI](https://firebase.google.com/docs/genkit) for seamless LLM integration.
- **LLM:** Google Gemini 3 Flash.
- **Backend:** Firebase Functions (v2).

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Angular CLI
- Firebase CLI (for backend functions)
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
   Configure your Firebase environment and Genkit secrets:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```

4. **Run the application:**
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`.

## 🧪 Development

- **Start Dev Server:** `ng serve`
- **Build:** `ng build`
- **Tests:** `ng test`
- **Deploy Functions:** `firebase deploy --only functions`

---
*Built with ❤️ for travelers everywhere.*

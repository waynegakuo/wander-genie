export interface TravelPreferences {
  departureLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelStyle: string;
  interests: string[];
  groupSize: number;
  accommodation: string;
  transportation: string;
  travelClass?: string;
  flexibility?: string;
  nlpQuery?: string;
}

export interface Itinerary {
  id?: string;
  destination: string;
  tripSummary: string;
  flightOptions?: {
    title: string;
    googleFlightsUrl: string;
    description: string;
    price?: string;
  }[];
  days: {
    day: number;
    date: string;
    activities: {
      morning: string;
      afternoon: string;
      evening: string;
    };
  }[];
  travelTips: string[];
  htmlContent: string;
}

export interface WishlistItem {
  id?: string;
  userId: string;
  destination: string;
  itineraryTitle: string;
  flightData: {
    price: string;
    airline: string;
    departureDate: string;
    returnDate: string;
    googleFlightsUrl?: string;
  };
  itinerary: Itinerary;
  searchMetadata: {
    prompt: string;
    budget: string;
    passengers: number;
  };
  imageUrl: string;
  createdAt: any; // Server Timestamp
  totalBudget?: string;
}

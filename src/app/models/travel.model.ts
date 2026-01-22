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
  destination: string;
  tripSummary: string;
  flightOptions?: {
    title: string;
    googleFlightsUrl: string;
    description: string;
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

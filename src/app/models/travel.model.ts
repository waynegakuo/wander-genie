export interface TravelPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelStyle: string;
  interests: string[];
  groupSize: number;
  accommodation: string;
  transportation: string;
}

export interface Itinerary {
  tripSummary: string;
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

export interface Hours {
  open: number;  // 24-hour format, e.g. 7 = 7:00 AM
  close: number; // 24-hour format, e.g. 22 = 10:00 PM. Use open: 0, close: 24 for 24-hour spots.
}

export interface Place {
  id: string;
  name: string;
  coords: { lat: number; lng: number };
  rating: number;
  price_level: number;
  types: string[];
  address: string;
  hours: Hours;
  amenities: {
    wifi: number;
    outlets: number;
    noise: number; // 1=very quiet, 5=loud
    seating: number;
  };
  badges: string[];
  distance_meters: number;
  travel_time: {
    walking_min: number;
    driving_min: number;
  };
  photo_url?: string;
  isDiscovered?: boolean; // true if pulled live from Foursquare (no reviews yet)
}

// Mock data for Stanford/Palo Alto area study spots
export const mockPlaces: Place[] = [
  {
    id: "1",
    name: "Coupa Café",
    coords: { lat: 37.4419, lng: -122.1430 },
    rating: 4.4,
    price_level: 2,
    types: ["cafe"],
    address: "538 Ramona St, Palo Alto, CA",
    hours: { open: 7, close: 21 },
    amenities: {
      wifi: 4.8,
      outlets: 4.2,
      noise: 2.8,
      seating: 3.9
    },
    badges: ["great-wifi", "student-friendly"],
    distance_meters: 850,
    travel_time: {
      walking_min: 12,
      driving_min: 4,
    },
  },
  {
    id: "2", 
    name: "Green Library",
    coords: { lat: 37.4259, lng: -122.1667 },
    rating: 4.7,
    price_level: 1,
    types: ["library"],
    address: "557 Escondido Mall, Stanford, CA",
    hours: { open: 8, close: 23 },
    amenities: {
      wifi: 4.9,
      outlets: 4.7,
      noise: 1.2,
      seating: 4.5
    },
    badges: ["very-quiet", "excellent-wifi", "long-hours"],
    distance_meters: 420,
    travel_time: {
      walking_min: 6,
      driving_min: 2,
    },
  },
  {
    id: "3",
    name: "Philz Coffee",
    coords: { lat: 37.4404, lng: -122.1518 },
    rating: 4.3,
    price_level: 2,
    types: ["cafe"],
    address: "101 Forest Ave, Palo Alto, CA",
    hours: { open: 6, close: 19 },
    amenities: {
      wifi: 4.1,
      outlets: 3.8,
      noise: 3.5,
      seating: 4.1
    },
    badges: ["spacious"],
    distance_meters: 1200,
    travel_time: {
      walking_min: 16,
      driving_min: 6,
    },
  },
  {
    id: "4",
    name: "Meyer Library Study Rooms",
    coords: { lat: 37.4276, lng: -122.1697 },
    rating: 4.6,
    price_level: 1,
    types: ["library"],
    address: "450 Jane Stanford Way, Stanford, CA",
    hours: { open: 0, close: 24 },
    amenities: {
      wifi: 4.8,
      outlets: 4.9,
      noise: 1.0,
      seating: 4.8
    },
    badges: ["silent", "private-rooms", "24-hours"],
    distance_meters: 650,
    travel_time: {
      walking_min: 9,
      driving_min: 3,
    },
  },
  {
    id: "5",
    name: "Blue Bottle Coffee",
    coords: { lat: 37.4238, lng: -122.1711 },
    rating: 4.2,
    price_level: 3,
    types: ["cafe"],
    address: "310 Pasteur Dr, Stanford, CA",
    hours: { open: 6, close: 20 },
    amenities: {
      wifi: 4.0,
      outlets: 3.2,
      noise: 3.8,
      seating: 3.5
    },
    badges: ["premium-coffee"],
    distance_meters: 780,
    travel_time: {
      walking_min: 11,
      driving_min: 4,
    },
  },
  {
    id: "6",
    name: "Tresidder Union Study Lounge",
    coords: { lat: 37.4248, lng: -122.1707 },
    rating: 3.9,
    price_level: 1,
    types: ["library"],
    address: "459 Lagunita Dr, Stanford, CA",
    hours: { open: 7, close: 24 },
    amenities: {
      wifi: 4.6,
      outlets: 4.3,
      noise: 2.1,
      seating: 4.0
    },
    badges: ["quiet", "central-location"],
    distance_meters: 320,
    travel_time: {
      walking_min: 4,
      driving_min: 2,
    },
  },
  {
    id: "7",
    name: "Caffe Venetia",
    coords: { lat: 37.4440, lng: -122.1593 },
    rating: 4.1,
    price_level: 2,
    types: ["cafe"],
    address: "419 University Ave, Palo Alto, CA",
    hours: { open: 7, close: 22 },
    amenities: {
      wifi: 3.7,
      outlets: 3.9,
      noise: 3.2,
      seating: 3.8
    },
    badges: ["cozy"],
    distance_meters: 1450,
    travel_time: {
      walking_min: 19,
      driving_min: 7,
    },
  },
  {
    id: "8",
    name: "Law Library",
    coords: { lat: 37.4281, lng: -122.1735 },
    rating: 4.8,
    price_level: 1,
    types: ["library"],
    address: "Crown Quadrangle, Stanford, CA",
    hours: { open: 8, close: 22 },
    amenities: {
      wifi: 4.9,
      outlets: 4.8,
      noise: 1.1,
      seating: 4.7
    },
    badges: ["extremely-quiet", "graduate-friendly", "excellent-wifi"],
    distance_meters: 890,
    travel_time: {
      walking_min: 13,
      driving_min: 5,
    },
  },
  {
    id: "9",
    name: "The Counter",
    coords: { lat: 37.4453, lng: -122.1607 },
    rating: 4.0,
    price_level: 2,
    types: ["restaurant"],
    address: "369 California Ave, Palo Alto, CA",
    hours: { open: 11, close: 22 },
    amenities: {
      wifi: 3.5,
      outlets: 2.8,
      noise: 3.6,
      seating: 4.2
    },
    badges: ["good-for-groups"],
    distance_meters: 1650,
    travel_time: {
      walking_min: 21,
      driving_min: 8,
    },
  },
  {
    id: "10",
    name: "MacArthur Park",
    coords: { lat: 37.4432, lng: -122.1587 },
    rating: 4.3,
    price_level: 3,
    types: ["restaurant"],
    address: "27 University Ave, Palo Alto, CA",
    hours: { open: 11, close: 21 },
    amenities: {
      wifi: 3.2,
      outlets: 2.5,
      noise: 3.9,
      seating: 4.4
    },
    badges: ["patio-seating"],
    distance_meters: 1380,
    travel_time: {
      walking_min: 18,
      driving_min: 7,
    },
  }
];

export type SortOption = 'nearest' | 'top-rated' | 'quietest' | 'best-wifi';

export const isOpenNow = (hours: Hours): boolean => {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  if (hours.open === 0 && hours.close === 24) return true;
  return currentHour >= hours.open && currentHour < hours.close;
};

export const getHoursLabel = (hours: Hours): string => {
  if (hours.open === 0 && hours.close === 24) return 'Open 24 hours';

  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:00 ${period}`;
  };

  return `${formatHour(hours.open)} - ${formatHour(hours.close)}`;
};

export const getMockPlaces = (filters?: {
  types?: string[];
  openNow?: boolean;
  priceRange?: [number, number];
  amenityMinimums?: {
    wifi: number;
    outlets: number;
    noise: number;
    seating: number;
  };
  withinMinutes?: number;
  transportMode?: 'walking' | 'driving';
  sortBy?: SortOption;
}): Place[] => {
  let filtered = [...mockPlaces];

  if (filters) {
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(place =>
        place.types.some(type => filters.types!.includes(type))
      );
    }

    if (filters.openNow) {
      filtered = filtered.filter(place => isOpenNow(place.hours));
    }

    if (filters.priceRange) {
      filtered = filtered.filter(place =>
        place.price_level >= filters.priceRange![0] &&
        place.price_level <= filters.priceRange![1]
      );
    }

    if (filters.withinMinutes && filters.transportMode) {
      const travelTimeKey = filters.transportMode === 'walking' ? 'walking_min' : 'driving_min';
      filtered = filtered.filter(place =>
        place.travel_time[travelTimeKey] <= filters.withinMinutes!
      );
    }

    if (filters.amenityMinimums) {
      filtered = filtered.filter(place => {
        const mins = filters.amenityMinimums!;
        return (
          place.amenities.wifi >= mins.wifi &&
          place.amenities.outlets >= mins.outlets &&
          place.amenities.seating >= mins.seating &&
          place.amenities.noise <= mins.noise
        );
      });
    }
  }

  const transportMode = filters?.transportMode || 'walking';
  const travelTimeKey = transportMode === 'walking' ? 'walking_min' : 'driving_min';
  const sortBy = filters?.sortBy || 'top-rated';

  return filtered.sort((a, b) => {
    switch (sortBy) {
      case 'nearest':
        return a.travel_time[travelTimeKey] - b.travel_time[travelTimeKey];
      case 'top-rated':
        return b.rating - a.rating;
      case 'quietest':
        return a.amenities.noise - b.amenities.noise;
      case 'best-wifi':
        return b.amenities.wifi - a.amenities.wifi;
      default:
        return 0;
    }
  });
};
export interface Place {
  id: string;
  name: string;
  coords: { lat: number; lng: number };
  rating: number;
  price_level: number;
  types: string[];
  address: string;
  open_now: boolean;
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
    open_now: true,
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
    open_now: true,
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
    open_now: false,
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
    open_now: true,
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
    open_now: true,
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
    open_now: true,
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
    open_now: true,
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
    open_now: true,
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
  }
];

export type SortOption = 'nearest' | 'top-rated' | 'quietest' | 'best-wifi';

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
      filtered = filtered.filter(place => place.open_now);
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
import { ItemCard } from "./ItemCard";

// Mock data - will be replaced with real data later
const mockItems = [
  {
    id: 1,
    title: "Molecular Model Kit - Complete Set",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&h=500&fit=crop",
    distance: "Same building",
    rating: 5.0,
    lender: "Marcus",
    category: "Academic"
  },
  {
    id: 2,
    title: "Stand Mixer - KitchenAid",
    image: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500&h=500&fit=crop",
    distance: "0.2 miles away",
    rating: 4.9,
    lender: "Sarah",
    category: "Kitchen"
  },
  {
    id: 3,
    title: "Power Drill Set with Bits",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&h=500&fit=crop",
    distance: "0.3 miles away",
    rating: 4.8,
    lender: "James",
    category: "Tools"
  },
  {
    id: 4,
    title: "Organic Chemistry Textbook",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop",
    distance: "1 block away",
    rating: 5.0,
    lender: "Emily",
    category: "Textbooks"
  },
  {
    id: 5,
    title: "HDMI Projector - Portable",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&h=500&fit=crop",
    distance: "0.4 miles away",
    rating: 4.7,
    lender: "David",
    category: "Electronics"
  },
  {
    id: 6,
    title: "Camping Tent - 4 Person",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&h=500&fit=crop",
    distance: "0.5 miles away",
    rating: 4.9,
    lender: "Rachel",
    category: "Sports"
  },
  {
    id: 7,
    title: "Instant Pot - 6 Quart",
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=500&fit=crop",
    distance: "Same building",
    rating: 5.0,
    lender: "Alex",
    category: "Kitchen"
  },
  {
    id: 8,
    title: "Folding Bike - Lightweight",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&h=500&fit=crop",
    distance: "0.1 miles away",
    rating: 4.8,
    lender: "Chris",
    category: "Sports"
  }
];

export const ItemGrid = () => {
  return (
    <section className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Available Near You</h2>
        <p className="text-muted-foreground">Browse items from students in your area</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockItems.map((item) => (
          <ItemCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
};

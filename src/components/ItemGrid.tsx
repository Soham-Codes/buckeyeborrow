import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ItemCard } from "./ItemCard";
import { FilterOptions } from "./SearchBar";

interface Item {
  id: string;
  item_name: string;
  category: string;
  photo_url: string | null;
  campus_area: string;
  pickup_location: string;
  status: string;
  item_number: string;
  owner_id: string;
  cost_type: string;
  max_borrow_duration: string;
}

interface ItemGridProps {
  searchQuery: string;
  selectedCategory: string;
  filters: FilterOptions;
  onItemClick: (itemId: string) => void;
}

export const ItemGrid = ({ searchQuery, selectedCategory, filters, onItemClick }: ItemGridProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search query, category, and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      searchQuery === '' ||
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.campus_area.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All Items' || 
      item.category === selectedCategory;

    const matchesCampusArea = 
      filters.campusArea === 'all' || 
      item.campus_area === filters.campusArea;

    const matchesCostType = 
      filters.costType === 'all' || 
      item.cost_type === filters.costType;

    const matchesStatus = 
      filters.status === 'all' || 
      item.status === filters.status;

    const matchesDuration = 
      filters.maxBorrowDuration === 'all' || 
      item.max_borrow_duration === filters.maxBorrowDuration;

    return matchesSearch && matchesCategory && matchesCampusArea && matchesCostType && matchesStatus && matchesDuration;
  });

  if (loading) {
    return (
      <section className="container mx-auto max-w-6xl py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading items...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Available Near You</h2>
        <p className="text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
        </p>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No items found matching your search.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              title={item.item_name}
              image={item.photo_url || '/images/no-image-placeholder.png'}
              distance={item.campus_area}
              category={item.category}
              itemNumber={item.item_number}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </section>
  );
};

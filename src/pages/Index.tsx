import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { ItemGrid } from "@/components/ItemGrid";
import { ItemDetailsPanel } from "@/components/ItemDetailsPanel";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const Index = () => {
  const { loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setDetailsPanelOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className={`transition-all duration-700 ease-in-out overflow-hidden ${searchExpanded ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'}`}>
        <Hero onSearchClick={() => setSearchExpanded(true)} />
      </div>
      <div className={`transition-all duration-700 ease-in-out ${searchExpanded ? 'mt-0' : ''}`}>
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          expanded={searchExpanded}
        />
        <ItemGrid 
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onItemClick={handleItemClick}
        />
      </div>
      <ItemDetailsPanel
        itemId={selectedItemId}
        open={detailsPanelOpen}
        onOpenChange={setDetailsPanelOpen}
      />
    </div>
  );
};

export default Index;

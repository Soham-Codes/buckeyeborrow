import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const categories = [
  "All Items",
  "Textbooks",
  "Kitchen",
  "Tools",
  "Electronics",
  "Sports",
  "Furniture"
];

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  expanded?: boolean;
}

export const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  expanded = false
}: SearchBarProps) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearch = (query: string) => {
    onSearchChange(query);
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
  };

  const deleteSearchItem = (item: string) => {
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  return (
    <div className={`z-40 bg-background transition-all duration-700 ease-in-out border-b ${
      expanded ? 'sticky top-0 shadow-lg' : 'sticky top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
    }`}>
      <div className="container mx-auto max-w-6xl py-4 px-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by item name, category, or item number..." 
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus={expanded}
              />
            </div>
            <Button size="lg" variant="outline" className="px-4">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
          {expanded && searchHistory.length > 0 && !searchQuery && (
            <div className="flex flex-col gap-2 pb-2">
              <p className="text-sm text-muted-foreground">Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-sm cursor-pointer transition-colors"
                  >
                    <span onClick={() => handleSearch(item)} className="flex-1">{item}</span>
                    <X 
                      className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSearchItem(item);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

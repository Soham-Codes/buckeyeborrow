import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

export interface FilterOptions {
  campusArea: string;
  costType: string;
  status: string;
  maxBorrowDuration: string;
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  expanded?: boolean;
}

export const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  filters,
  onFiltersChange,
  expanded = false
}: SearchBarProps) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const saveToHistory = (query: string) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveToHistory(searchQuery);
    }
  };

  const deleteSearchItem = (item: string) => {
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      campusArea: "all",
      costType: "all",
      status: "all",
      maxBorrowDuration: "all"
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== "all").length;

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
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus={expanded}
              />
            </div>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button size="lg" variant="outline" className="px-4 relative">
                  <SlidersHorizontal className="h-5 w-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Items</SheetTitle>
                  <SheetDescription>
                    Refine your search with these filter options
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  {/* Campus Area Filter */}
                  <div className="space-y-3">
                    <Label htmlFor="campus-area" className="text-base font-semibold">Campus Area</Label>
                    <Select value={filters.campusArea} onValueChange={(value) => handleFilterChange('campusArea', value)}>
                      <SelectTrigger id="campus-area">
                        <SelectValue placeholder="Select campus area" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">All Areas</SelectItem>
                        <SelectItem value="North Campus">North Campus</SelectItem>
                        <SelectItem value="South Campus">South Campus</SelectItem>
                        <SelectItem value="West Campus">West Campus</SelectItem>
                        <SelectItem value="Central Campus">Central Campus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Cost Type Filter */}
                  <div className="space-y-3">
                    <Label htmlFor="cost-type" className="text-base font-semibold">Cost Type</Label>
                    <Select value={filters.costType} onValueChange={(value) => handleFilterChange('costType', value)}>
                      <SelectTrigger id="cost-type">
                        <SelectValue placeholder="Select cost type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Small Fee">Small Fee</SelectItem>
                        <SelectItem value="Deposit Required">Deposit Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Availability Status Filter */}
                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-base font-semibold">Availability</Label>
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="available">Available Now</SelectItem>
                        <SelectItem value="borrowed">Currently Borrowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Max Borrow Duration Filter */}
                  <div className="space-y-3">
                    <Label htmlFor="borrow-duration" className="text-base font-semibold">Borrow Duration</Label>
                    <Select value={filters.maxBorrowDuration} onValueChange={(value) => handleFilterChange('maxBorrowDuration', value)}>
                      <SelectTrigger id="borrow-duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">Any Duration</SelectItem>
                        <SelectItem value="1 day">1 Day</SelectItem>
                        <SelectItem value="3 days">3 Days</SelectItem>
                        <SelectItem value="1 week">1 Week</SelectItem>
                        <SelectItem value="2 weeks">2 Weeks</SelectItem>
                        <SelectItem value="1 month">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Clear Filters Button */}
                  {activeFilterCount > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
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
                    <span onClick={() => {
                      onSearchChange(item);
                      saveToHistory(item);
                    }} className="flex-1">{item}</span>
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

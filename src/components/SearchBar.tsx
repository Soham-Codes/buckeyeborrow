import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categories = [
  "All Items",
  "Textbooks",
  "Kitchen",
  "Tools",
  "Electronics",
  "Sports",
  "Furniture"
];

export const SearchBar = () => {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto max-w-6xl py-4 px-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for items..." 
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button size="lg" variant="outline" className="px-4">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All Items" ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
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

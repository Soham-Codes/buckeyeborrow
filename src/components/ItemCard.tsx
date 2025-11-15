import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

interface ItemCardProps {
  title: string;
  image: string;
  distance: string;
  rating: number;
  lender: string;
  category: string;
}

export const ItemCard = ({ title, image, distance, rating, lender, category }: ItemCardProps) => {
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl border-border">
      <div className="aspect-square overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base line-clamp-2 text-foreground">{title}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {category}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            <span>{distance}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-medium text-foreground">{rating}</span>
              <span className="text-muted-foreground">· {lender}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

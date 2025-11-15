import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface HeroProps {
  onSearchClick: () => void;
}

export const Hero = ({ onSearchClick }: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-accent py-20 px-4">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center text-white space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Borrow from Your
            <span className="block mt-2">Buckeye Neighbors</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Connect with OSU students nearby to borrow what you need and share what you have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-muted hover:bg-muted/80 text-foreground"
              onClick={onSearchClick}
            >
              <Search className="mr-2 h-5 w-5" />
              Browse Items
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white text-white hover:bg-white hover:text-primary">
              List an Item
            </Button>
          </div>
          <div className="pt-8 flex items-center justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-white/80">Active Students</div>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold">1,200+</div>
              <div className="text-white/80">Items Available</div>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-white/80">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6bTAgMzBjMC0zLjMxNCAyLjY4Ni02IDYtNnM2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNnptLTMwIDBjMC0zLjMxNCAyLjY4Ni02IDYtNnM2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNnptMC0zMGMwLTMuMzE0IDIuNjg2LTYgNi02czYgMi42ODYgNiA2LTIuNjg2IDYtNiA2LTYtMi42ODYtNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
    </section>
  );
};

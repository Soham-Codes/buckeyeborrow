import { Button } from "@/components/ui/button";
import { Heart, Menu, Plus, User } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Buckeye Borrow</h1>
              <p className="text-xs text-muted-foreground">OSU Community</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Browse
          </Button>
          <Button variant="ghost" size="sm">
            My Items
          </Button>
          <Button variant="ghost" size="sm">
            Messages
          </Button>
          <Button size="sm" className="ml-2">
            <Plus className="h-4 w-4 mr-1" />
            List Item
          </Button>
          <Button variant="outline" size="sm" className="ml-2">
            <User className="h-4 w-4 mr-1" />
            Sign In
          </Button>
        </nav>

        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

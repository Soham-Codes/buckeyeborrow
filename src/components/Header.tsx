import { Button } from "@/components/ui/button";
import { Heart, Menu, Plus, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
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
          {user && (
            <>
              <Button variant="ghost" size="sm">
                My Items
              </Button>
              <Button variant="ghost" size="sm">
                Messages
              </Button>
              <Button 
                size="sm" 
                className="ml-2"
                onClick={() => navigate('/list-item')}
              >
                <Plus className="h-4 w-4 mr-1" />
                List Item
              </Button>
            </>
          )}
          
          {!user && (
            <Button 
              size="sm" 
              className="ml-2"
              onClick={() => navigate('/auth')}
            >
              <Plus className="h-4 w-4 mr-1" />
              List Item
            </Button>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  <User className="h-4 w-4 mr-1" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>My Listings</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => navigate('/auth')}
            >
              <User className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          )}
        </nav>

        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

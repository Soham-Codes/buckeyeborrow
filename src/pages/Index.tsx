import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { ItemGrid } from "@/components/ItemGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <SearchBar />
      <ItemGrid />
    </div>
  );
};

export default Index;

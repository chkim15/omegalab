import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-omegalab-dark text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Brain className="text-omegalab-dark text-lg" />
            </div>
            <span className="text-xl font-bold">OmegaLab</span>
          </div>
        </Link>
        
        <Link href="/login">
          <Button className="bg-white text-omegalab-dark hover:bg-gray-100">
            Log In
          </Button>
        </Link>
      </div>
    </header>
  );
}

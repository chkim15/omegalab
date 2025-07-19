import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-thetawise-dark text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Brain className="text-thetawise-dark text-lg" />
            </div>
            <span className="text-xl font-bold">Thetawise</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/#features">
            <a className="hover:text-gray-300 transition-colors">Features</a>
          </Link>
          <Link href="/pricing">
            <a className="hover:text-gray-300 transition-colors">Pricing</a>
          </Link>
          <Link href="/#about">
            <a className="hover:text-gray-300 transition-colors">About</a>
          </Link>
        </nav>
        
        <Button className="bg-white text-thetawise-dark hover:bg-gray-100">
          Log In
        </Button>
      </div>
    </header>
  );
}

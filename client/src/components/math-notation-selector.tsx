import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Filter } from "lucide-react";

interface MathNotationSelectorProps {
  onSelect: (notation: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface MathSymbol {
  symbol: string;
  name: string;
  category: string;
}

export default function MathNotationSelector({ onSelect, isOpen, onToggle }: MathNotationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Common");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mathSymbols: MathSymbol[] = [
    // Basic Operators
    { symbol: "+", name: "Plus", category: "Common" },
    { symbol: "-", name: "Minus", category: "Common" },
    { symbol: "×", name: "Multiplication", category: "Common" },
    { symbol: "÷", name: "Division", category: "Common" },
    { symbol: "±", name: "Plus-Minus", category: "Common" },
    { symbol: "□/□", name: "Fraction", category: "Common" },
    { symbol: "√□", name: "Square Root", category: "Common" },
    { symbol: "□²", name: "Squared", category: "Common" },
    { symbol: "□³", name: "Cubed", category: "Common" },
    { symbol: "□^□", name: "Exponent", category: "Common" },
    
    // Relations
    { symbol: "=", name: "Equals", category: "Common" },
    { symbol: "≠", name: "Not Equals", category: "Common" },
    { symbol: "≈", name: "Approximately", category: "Common" },
    { symbol: "<", name: "Less Than", category: "Common" },
    { symbol: "≤", name: "Less Than or Equal", category: "Common" },
    { symbol: ">", name: "Greater Than", category: "Common" },
    { symbol: "≥", name: "Greater Than or Equal", category: "Common" },
    { symbol: "·", name: "Dot", category: "Common" },
    
    // Logarithms and Variables
    { symbol: "ln □", name: "Natural Log", category: "Common" },
    { symbol: "log₁₀(□)", name: "Log Base 10", category: "Common" },
    { symbol: "log□ □", name: "Log Base", category: "Common" },
    { symbol: "e^□", name: "E to Power", category: "Common" },
    { symbol: "x", name: "Variable x", category: "Common" },
    { symbol: "y", name: "Variable y", category: "Common" },
    { symbol: "t", name: "Variable t", category: "Common" },
    { symbol: "n", name: "Variable n", category: "Common" },
    
    // Constants and Symbols
    { symbol: "π", name: "Pi", category: "Common" },
    { symbol: "e", name: "Euler's Number", category: "Common" },
    { symbol: "∞", name: "Infinity", category: "Common" },
    { symbol: "°", name: "Degree", category: "Common" },
    { symbol: "θ", name: "Theta", category: "Common" },
    { symbol: "%", name: "Percent", category: "Common" },
    { symbol: "(□)", name: "Parentheses", category: "Common" },
    { symbol: "[□]", name: "Square Brackets", category: "Common" },
    { symbol: "|□|", name: "Absolute Value", category: "Common" },
    { symbol: "||□||", name: "Norm", category: "Common" },
    { symbol: "⊢", name: "Right Tack", category: "Common" },
    
    // Summation and Functions
    { symbol: "∑", name: "Summation", category: "Common" },
    { symbol: "gcd(□, □)", name: "Greatest Common Divisor", category: "Common" },
    { symbol: "lcm(□, □)", name: "Least Common Multiple", category: "Common" },
    
    // Trigonometry
    { symbol: "sin(□)", name: "Sine", category: "Common" },
    { symbol: "cos(□)", name: "Cosine", category: "Common" },
    { symbol: "tan(□)", name: "Tangent", category: "Common" },
    { symbol: "lim□→□", name: "Limit", category: "Common" },
    { symbol: "d/dx", name: "Derivative", category: "Common" },
    
    // Integrals
    { symbol: "∫ d□", name: "Indefinite Integral", category: "Common" },
    { symbol: "∫□^□ d□", name: "Definite Integral", category: "Common" },
  ];

  const categories = ["Common", "Algebra", "Calculus", "Statistics", "Geometry"];

  const filteredSymbols = mathSymbols.filter(symbol => 
    symbol.category === selectedCategory && 
    (symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleSymbolClick = (symbol: string) => {
    onSelect(symbol);
    onToggle();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="p-2 text-gray-500 hover:text-omegalab-blue"
        title="Math notation"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="font-semibold text-gray-900">Common</h3>
          </div>

          {/* Math Symbols Grid */}
          <div className="p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {filteredSymbols.map((symbol, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSymbolClick(symbol.symbol)}
                  className="h-8 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded transition-colors"
                  title={symbol.name}
                >
                  <span className="font-mono">{symbol.symbol}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-sm border-none outline-none bg-transparent"
              />
            </div>
            
            <div className="flex items-center ml-4">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border-none outline-none bg-transparent cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
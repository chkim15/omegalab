import { Button } from "@/components/ui/button";

interface MathSymbolsProps {
  onSymbolClick: (symbol: string) => void;
}

export default function MathSymbols({ onSymbolClick }: MathSymbolsProps) {
  const symbols = [
    { symbol: "∫", name: "Integral" },
    { symbol: "∑", name: "Sum" },
    { symbol: "√", name: "Square root" },
    { symbol: "π", name: "Pi" },
    { symbol: "θ", name: "Theta" },
    { symbol: "α", name: "Alpha" },
    { symbol: "β", name: "Beta" },
    { symbol: "∞", name: "Infinity" },
    { symbol: "≤", name: "Less than or equal" },
    { symbol: "≥", name: "Greater than or equal" },
    { symbol: "≠", name: "Not equal" },
    { symbol: "±", name: "Plus minus" },
  ];

  return (
    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
      {symbols.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={() => onSymbolClick(item.symbol)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
          title={item.name}
        >
          {item.symbol}
        </Button>
      ))}
    </div>
  );
}

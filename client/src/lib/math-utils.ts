// Utility functions for math processing and LaTeX rendering

export function formatMathExpression(expression: string): string {
  // Basic math expression formatting
  return expression
    .replace(/\*\*/g, "^") // Convert ** to ^
    .replace(/\bsqrt\b/g, "√") // Convert sqrt to √
    .replace(/\bpi\b/g, "π") // Convert pi to π
    .replace(/\btheta\b/g, "θ") // Convert theta to θ
    .replace(/\balpha\b/g, "α") // Convert alpha to α
    .replace(/\bbeta\b/g, "β") // Convert beta to β
    .replace(/\binfinity\b/g, "∞") // Convert infinity to ∞
    .replace(/\bintegral\b/g, "∫") // Convert integral to ∫
    .replace(/\bsum\b/g, "∑"); // Convert sum to ∑
}

export function extractMathFromText(text: string): string[] {
  // Extract mathematical expressions from text
  const mathPatterns = [
    /\$\$([^$]+)\$\$/g, // $$math$$
    /\$([^$]+)\$/g, // $math$
    /\\([a-zA-Z]+)/g, // \command
    /\b\d+[+\-*/]\d+\b/g, // simple arithmetic
    /\b[a-zA-Z]\s*[=<>≤≥]\s*[^,\s]+/g, // equations
  ];

  const matches: string[] = [];
  
  mathPatterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) {
      matches.push(...found);
    }
  });

  return matches;
}

export function validateMathExpression(expression: string): boolean {
  // Basic validation for math expressions
  const mathChars = /^[0-9+\-*/().=<>≤≥≠πθαβ√∫∑∞\s]+$/;
  return mathChars.test(expression) || expression.includes("\\");
}

export function convertToLaTeX(expression: string): string {
  // Convert common math notation to LaTeX
  return expression
    .replace(/√/g, "\\sqrt{}")
    .replace(/π/g, "\\pi")
    .replace(/θ/g, "\\theta")
    .replace(/α/g, "\\alpha")
    .replace(/β/g, "\\beta")
    .replace(/∞/g, "\\infty")
    .replace(/∫/g, "\\int")
    .replace(/∑/g, "\\sum")
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/±/g, "\\pm");
}

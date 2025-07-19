import { Link } from "wouter";
import { Brain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-omegalab-dark text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          {/* Company Info */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Brain className="text-omegalab-dark text-lg" />
              </div>
              <span className="text-xl font-bold">OmegaLab</span>
            </div>
            <p className="text-gray-400 text-sm">
              The most accurate AI math tutor helping students conquer complex mathematical concepts.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <h4 className="font-semibold text-white mb-2">Other questions or feedback?</h4>
          <p className="text-gray-400 text-sm">
            Email us at <a href="mailto:support@omegalab.ai" className="text-omegalab-blue hover:underline">support@omegalab.ai</a>!
          </p>
        </div>
      </div>
    </footer>
  );
}

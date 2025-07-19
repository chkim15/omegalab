import { Link } from "wouter";
import { Brain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-thetawise-dark text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Brain className="text-thetawise-dark text-lg" />
              </div>
              <span className="text-xl font-bold">Thetawise</span>
            </div>
            <p className="text-gray-400 text-sm">
              The most accurate AI math tutor helping students conquer complex mathematical concepts.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/#features"><a className="hover:text-white transition-colors">Features</a></Link></li>
              <li><Link href="/pricing"><a className="hover:text-white transition-colors">Pricing</a></Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Evals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/#about"><a className="hover:text-white transition-colors">About</a></Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Preferences</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <h4 className="font-semibold text-white mb-2">Other questions or feedback?</h4>
          <p className="text-gray-400 text-sm">
            Email us at <a href="mailto:support@thetawise.ai" className="text-thetawise-blue hover:underline">support@thetawise.ai</a>!
          </p>
        </div>
      </div>
    </footer>
  );
}

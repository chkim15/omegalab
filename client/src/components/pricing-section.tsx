import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Plans</h2>
          <p className="text-xl text-gray-600">Choose the perfect plan for your math journey</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Free</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/ month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">50 free messages per day</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Access to image uploads</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Draw pad functionality</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Speech-to-text input</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">All chat features</span>
                </div>
              </div>
              <Button className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300">
                Create account
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-omegalab-blue bg-omegalab-blue text-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Pro</CardTitle>
              <CardDescription className="text-white">
                <span className="text-4xl font-bold">$15</span>
                <span className="text-blue-200">/ month</span>
                <p className="text-blue-200 text-sm mt-2">Billed annually. $20 / mo. billed monthly.</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span>Unlimited questions</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span>Access to Advanced Solver</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span>PDF Uploads</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span>...and everything in Free</span>
                </div>
              </div>
              <Button className="w-full bg-white text-omegalab-blue hover:bg-gray-100">
                Create account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
} 
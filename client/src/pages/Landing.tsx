import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Calculator, MessageSquare, Zap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OmegaLab</h1>
          </div>
          <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI-Powered Math Tutor
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience personalized math tutoring with dual learning modes. Get step-by-step solutions 
            or receive guided hints to learn at your own pace.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            Start Learning Now
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Dual Learning Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose between "Give me the answer" for complete solutions or "Tutor me" for guided learning with hints.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Interactive Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Engage in natural conversations with your AI tutor. Ask follow-up questions and get personalized explanations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Multiple Input Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Type, speak, draw, or upload images of math problems. Our AI understands various input formats.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Master Math?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of students who are improving their math skills with OmegaLab.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
          >
            Get Started Free
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; 2025 OmegaLab. Empowering students through AI-powered math education.</p>
      </footer>
    </div>
  );
}
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I use Thetawise?",
      answer: "Just as you would interact with a math tutor! In your chat, you can upload photos of any math, handwrite it using our draw interface, or type it out using your keyboard.",
    },
    {
      question: "How does Thetawise work?",
      answer: "Thetawise uses LLMs (large language models) to respond to your questions. Unlike many standard AI models (ex: ChatGPT) Thetawise uses tools to improve its accuracy and make fewer calculation errors. It can also create graphs and other output formats.",
    },
    {
      question: "Is Thetawise always correct?",
      answer: "Thetawise is at the cutting edge of accuracy and can solve problems ranging from basic algebra to upper division college math. However, it can still make mistakes in its outputs, most commonly in the form of algebraic errors. You should always check the accuracy of the outputs, and you can even ask Thetawise to check its own work if you suspect there are any errors.",
    },
    {
      question: "Can Thetawise handle graphing problems?",
      answer: "Yes! Thetawise can create visual representations of mathematical functions and data. It can generate clear, interactive graphs for various types of problems including functions, equations, inequalities, and statistical data.",
    },
    {
      question: "Is there a Thetawise mobile app?",
      answer: "While we don't currently have a dedicated mobile app, Thetawise works great on mobile devices through your web browser. Our interface is fully responsive and optimized for mobile use, allowing you to solve math problems on the go.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="mt-4 text-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

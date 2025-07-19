import { Upload, FileText, Mic, Pencil } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Upload,
      title: "Upload from anywhere",
      description: "Take photos, drop screenshots, drag files, paste images",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      color: "bg-omegalab-blue",
    },
    {
      icon: FileText,
      title: "Work alongside PDFs",
      description: "Select and paste any text from documents",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      color: "bg-green-500",
    },
    {
      icon: Mic,
      title: "Transcribe your voice",
      description: "Speak your questions aloud for instant help",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      color: "bg-purple-500",
    },
    {
      icon: Pencil,
      title: "Handwrite anything",
      description: "Compatible with tablets for natural math input",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      color: "bg-orange-500",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Upload, Select, Speak, Draw</h2>
          <p className="text-xl text-gray-600">OmegaLab makes writing math simple.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <img 
                src={feature.image} 
                alt={feature.title} 
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

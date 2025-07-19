import { User, GraduationCap, Star, Laptop, FlaskConical, TrendingUp } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      icon: User,
      name: "Cocoabutterbeauty",
      role: "Reddit User",
      content: "The explanations are really better than anything I could have hoped for. Seriously makes it easy to understand a concept that my professor explains in 3 hours in 10 minutes.",
      color: "bg-omegalab-blue",
    },
    {
      icon: GraduationCap,
      name: "Freshman Math Major",
      role: "University of Washington",
      content: "So l was like, literally just sitting here, like, bashing my head against the wall at my class... So then that's why I started using OmegaLab & was like yea this is super helpful for me.",
      color: "bg-green-500",
    },
    {
      icon: Star,
      name: "WestTex",
      role: "Reddit User",
      content: "went from a 33 on my exam to a 90 thank you 🙏🏼",
      color: "bg-purple-500",
    },
    {
      icon: Laptop,
      name: "Sophomore CS Major",
      role: "University of Michigan",
      content: "Before OmegaLab I'd get an answer wrong and be like, why the **** is this? I don't understand... But now I'm like 'ok, bet', 'cause if that happens now, OmegaLab can explain why to me.",
      color: "bg-orange-500",
    },
    {
      icon: FlaskConical,
      name: "PhD Student",
      role: "UC Berkeley",
      content: "I tried a bunch of other AIs that just weren't accurate so at that point I just didn't know what to do... I asked one of my upperclassmen friends and she said I should try OmegaLab and like I would have been so screwed without that.",
      color: "bg-red-500",
    },
    {
      icon: TrendingUp,
      name: "chad_killa",
      role: "Twitter User",
      content: "@omegalab fixed my life",
      color: "bg-indigo-500",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What users are saying</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center mr-4`}>
                  <testimonial.icon className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

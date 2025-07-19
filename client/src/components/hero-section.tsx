import ChatInterface from "./chat-interface";

export default function HeroSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI<br />
            <span className="text-thetawise-blue">Math Tutor</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            Conquer your math class with <strong>Thetawise</strong>,
          </p>
          <p className="text-lg md:text-xl text-gray-600">
            the most accurate AI tutor.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <ChatInterface 
            isHomePage={true}
            messages={[]}
            onSendMessage={() => {}}
            onSendImage={() => {}}
            isLoading={false}
            messagesLoading={false}
          />
        </div>
      </div>
    </section>
  );
}

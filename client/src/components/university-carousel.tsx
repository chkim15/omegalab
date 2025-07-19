export default function UniversityCarousel() {
  const universities = [
    { name: "UC Berkeley", image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
    { name: "Brown University", image: "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
    { name: "University of Notre Dame", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
    { name: "Washington University in St. Louis", image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
    { name: "Yale University", image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
    { name: "Santa Clara University", image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
  ];

  return (
    <section className="bg-omegalab-dark py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-white text-lg">
            Trusted by <span className="text-omegalab-blue font-semibold">310,624</span> 
            students from top universities.
          </p>
        </div>
        
        <div className="overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {universities.map((university, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 mx-8">
                <img 
                  src={university.image} 
                  alt={university.name} 
                  className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
            
            {/* Duplicate set for seamless scroll */}
            {universities.map((university, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 mx-8">
                <img 
                  src={university.image} 
                  alt={university.name} 
                  className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

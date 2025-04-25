import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to ConsumerAI</h1>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => scrollToSection('features')}>
              Learn More
            </Button>
            <Button 
              variant="outline" 
              onClick={() => scrollToSection('pricing')}
            >
              View Pricing
            </Button>
            <Link to="/signup">
              <Button variant="outline">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          {/* Features content */}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
          {/* Pricing content */}
        </div>
      </section>
    </div>
  );
};

export default Landing; 
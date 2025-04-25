import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, signOut } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          ConsumerAI
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/chat" className="text-gray-600 hover:text-primary">Chat</Link>
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-gray-600 hover:text-primary"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('pricing')} 
            className="text-gray-600 hover:text-primary"
          >
            Pricing
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link to="/chat">
                <Button>New Chat</Button>
              </Link>
              <Button variant="ghost" onClick={signOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

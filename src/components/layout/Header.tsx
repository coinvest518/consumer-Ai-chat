import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          ConsumerAI
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/chat" className="text-gray-600 hover:text-primary">Chat</Link>
          <Link to="/#features" className="text-gray-600 hover:text-primary">Features</Link>
          <Link to="/#pricing" className="text-gray-600 hover:text-primary">Pricing</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/chat">
              <Button>Go to Chat</Button>
            </Link>
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

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "../ui/logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { text: "Features", href: "/#features" },
  { text: "How It Works", href: "/#how-it-works" },
  { text: "Pricing", href: "/#pricing" },
  { text: "FAQ", href: "/#faq" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-bold text-gray-900">ConsumerAI</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-primary transition"
              >
                {link.text}
              </a>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="hidden sm:inline-block text-sm font-medium text-gray-600 hover:text-primary transition"
            >
              Log In
            </a>
            <Link href="/chat">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Start Chatting Free
              </Button>
            </Link>
          </div>
          
          <button
            onClick={toggleMobileMenu}
            className="md:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-b border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition"
                  onClick={() => setIsOpen(false)}
                >
                  {link.text}
                </a>
              ))}
              <Link
                href="/chat"
                className="block w-full px-3 py-2 text-base font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition text-center mt-3"
                onClick={() => setIsOpen(false)}
              >
                Start Chatting Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function CTASection() {
  const { user } = useAuth();
  
  return (
    <section className="bg-primary">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-100">Start using ConsumerAI today.</span>
          </h2>
        </motion.div>
        
        <motion.div 
          className="mt-8 flex lg:mt-0 lg:flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex rounded-md shadow">
            <Link to={user ? "/chat" : "/login"}>
              <Button className="px-5 py-3 text-base rounded-md font-medium bg-white text-primary hover:bg-primary-50">
                {user ? "Start Chatting" : "Get started"}
              </Button>
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <a href="#pricing">
              <Button variant="secondary" className="px-5 py-3 text-base rounded-md font-medium">
                View pricing
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

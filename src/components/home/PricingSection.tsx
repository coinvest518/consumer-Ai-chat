import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/config";

export default function PricingSection() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const freePlanFeatures = [
    "5 questions per day",
    "Basic legal information",
    "Standard templates",
    "Web access only",
  ];

  const proPlanFeatures = [
    "Unlimited questions",
    "Detailed legal explanations",
    "Premium document templates",
    "SMS and email notifications",
    "Priority response times",
    "Web, mobile and email access",
  ];

  const handleProUpgrade = async () => {
    try {
      setIsLoading(true);
      
      // Create user data to track this payment
      const userData = {
        userId: user?.id || 'anonymous',
        email: user?.email || '',
        // Include a return_path to properly handle where to redirect after payment
        return_path: '/dashboard'
      };
      
      // Call our backend to create a Stripe checkout session
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      // Log analytics event (if you have analytics set up)
      console.log('Payment flow initiated', {
        userId: userData.userId,
        timestamp: new Date().toISOString(),
        source: 'pricing_section'
      });
      
      // Navigate to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Show error message to user (you could implement a toast notification here)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="sm:flex sm:flex-col sm:align-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:text-center">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Start for free, upgrade when you need more
          </p>
        </motion.div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
          {/* Free Plan */}
          <motion.div 
            className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">
                Perfect for quick questions and occasional help with consumer issues.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <Link to="/chat">
                <Button variant="outline" className="mt-8 w-full border-primary text-primary hover:bg-primary-50">
                  Start Chatting Free
                </Button>
              </Link>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
              <ul className="mt-6 space-y-4">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div 
            className="border border-primary rounded-lg shadow-md divide-y divide-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-6 relative">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0 transform">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  Popular
                </span>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">
                Comprehensive support for all your consumer law needs.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <Button
                className="mt-8 w-full"
                onClick={handleProUpgrade}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
              <ul className="mt-6 space-y-4">
                {proPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

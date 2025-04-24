import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pb-32">
      {/* Background gradient and patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white z-0"></div>
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 transform">
        <div className="w-96 h-96 rounded-full bg-secondary/10 animate-pulse-slow"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 transform">
        <div className="w-96 h-96 rounded-full bg-cyan-500/10 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <motion.div 
            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:flex-col lg:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>
              <span className="block text-sm font-semibold uppercase tracking-wide text-secondary">
                Free AI-Powered Legal Help
              </span>
              <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                <span className="block text-gray-900">Consumer Law</span>
                <span className="block text-primary">AI Assistant.</span>
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Get instant answers to your credit, debt, and consumer protection questions from an AI trained on real laws and legal cases.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <motion.div 
                  className="rounded-md shadow"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10" href="/chat">
                    Start Chatting Free
                  </Link>
                </motion.div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a href="#how-it-works" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition">
                    How It Works
                  </a>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                No credit card required. Start asking questions right away.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                {/* Chat preview */}
                <div className="relative h-96 glass-effect rounded-lg overflow-hidden border border-gray-200 shadow-xl">
                  <div className="h-12 flex items-center justify-between px-4 bg-primary text-white">
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">ConsumerAI Assistant</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                      <span className="text-xs">Online</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-48px-56px)] bg-gray-50">
                    {/* AI message */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <motion.div 
                        className="bg-white p-3 rounded-lg chat-bubble-ai shadow-sm max-w-[85%]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-sm">Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?</p>
                      </motion.div>
                    </div>

                    {/* User message */}
                    <div className="flex items-start justify-end">
                      <motion.div 
                        className="bg-primary p-3 rounded-lg chat-bubble-user shadow-sm text-white max-w-[85%]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <p className="text-sm">Can debt collectors call me at work?</p>
                      </motion.div>
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* AI response */}
                    <motion.div 
                      className="flex items-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 }}
                    >
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg chat-bubble-ai shadow-sm max-w-[85%]">
                        <p className="text-sm">Under the Fair Debt Collection Practices Act (FDCPA), debt collectors cannot call you at work if they know your employer prohibits such calls.</p>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-primary">
                          <p className="font-semibold">Legal Reference:</p>
                          <p>15 U.S.C. § 1692c(a)(3) - FDCPA Section 805(a)(3)</p>
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <button className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 transition">
                            Generate Cease Letter
                          </button>
                          <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  {/* Input area */}
                  <div className="p-3 border-t flex items-center">
                    <input 
                      type="text" 
                      placeholder="Ask a consumer law question..." 
                      className="flex-1 border-gray-300 focus:ring-primary focus:border-primary block w-full rounded-md sm:text-sm border" 
                    />
                    <button className="ml-3 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="relative z-10 mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-primary">
          <PlayCircle className="h-4 w-4" /> Watch instruction video
        </Button>
      </motion.div>
    </section>
  );
}
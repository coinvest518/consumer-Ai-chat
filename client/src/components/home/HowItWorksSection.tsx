import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Ask Your Question",
      description: "Type your consumer law question in plain language. No legal jargon needed. Ask about credit reports, debt collection, or consumer protection issues."
    },
    {
      number: "2",
      title: "Get Instant Answers",
      description: "Our AI instantly searches relevant laws, regulations, and legal cases to provide you with accurate, up-to-date information with proper legal citations."
    },
    {
      number: "3",
      title: "Take Action",
      description: "Generate custom legal documents, get step-by-step guidance, or receive templates to help resolve your consumer issues effectively."
    },
    {
      number: "4",
      title: "Stay Updated",
      description: "Receive optional SMS or email reminders about important deadlines and next steps in your consumer rights case."
    }
  ];

  const lawTopics = [
    { title: "Fair Credit Reporting Act (FCRA)", description: "Credit reporting laws, dispute rights, and credit repair" },
    { title: "Fair Debt Collection Practices Act (FDCPA)", description: "Debt collection rules, harassment, and validation" },
    { title: "CFPB Regulations", description: "Consumer Financial Protection Bureau guidelines and enforcement" },
    { title: "State Consumer Protection Laws", description: "Specific state regulations related to consumer rights" }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="lg:text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">How It Works</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple, Fast, and Trustworthy
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            ConsumerAI uses advanced AI to provide accurate legal information in seconds.
          </p>
        </motion.div>

        <div className="mt-16">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="relative"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <span className="text-xl font-bold">{step.number}</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 lg:mt-24 lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Powered by Advanced Legal AI
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Our AI is trained on thousands of consumer protection laws, regulations, and legal cases to provide accurate, reliable information.
            </p>
            <div className="mt-6 space-y-4">
              {lawTopics.map((topic, index) => (
                <motion.div 
                  key={index} 
                  className="flex"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-gray-900">{topic.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{topic.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-12 relative lg:mt-0 lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Legal assistance imagery placeholder
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

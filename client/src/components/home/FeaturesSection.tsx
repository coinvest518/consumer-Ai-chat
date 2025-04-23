import { motion } from "framer-motion";
import { MessageSquare, FileText, Clock, ClipboardList, Mail, Lock } from "lucide-react";

const features = [
  {
    title: "Expert Legal Answers",
    description: "Get instant, accurate answers about credit reports, debt collection, and consumer rights based on actual laws and legal cases.",
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    color: "bg-primary",
  },
  {
    title: "Generate Legal Documents",
    description: "Create customized dispute letters, debt validation requests, and cease communication notices with a single click.",
    icon: <FileText className="h-6 w-6 text-white" />,
    color: "bg-secondary",
  },
  {
    title: "24/7 Availability",
    description: "Get help whenever you need it, day or night. No appointments, no waiting rooms, just instant legal assistance.",
    icon: <Clock className="h-6 w-6 text-white" />,
    color: "bg-cyan-500",
  },
  {
    title: "Simplified Legal Citations",
    description: "We explain complex legal references in plain language so you understand exactly what the law says and how it applies to you.",
    icon: <ClipboardList className="h-6 w-6 text-white" />,
    color: "bg-primary",
  },
  {
    title: "SMS & Email Updates",
    description: "Stay informed with timely updates on your consumer rights cases. We'll remind you of important deadlines and next steps.",
    icon: <Mail className="h-6 w-6 text-white" />,
    color: "bg-secondary",
  },
  {
    title: "Privacy Focused",
    description: "Your data is encrypted and secure. We never share your information with third parties or sell your data.",
    icon: <Lock className="h-6 w-6 text-white" />,
    color: "bg-cyan-500",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-gray-50 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Your Personal Legal AI Assistant
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
              Get expert help with consumer protection laws, credit disputes, debt collection issues, and more.
            </p>
          </motion.div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`absolute -top-3 -left-3 w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="mt-3 ml-6 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-3 text-base text-gray-500">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";

export default function StatsSection() {
  const stats = [
    { label: "Legal Questions Answered", value: "150,000+" },
    { label: "Success Rate", value: "92%" },
    { label: "Consumer Laws Covered", value: "50+" },
    { label: "Response Time", value: "< 5 sec" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Trusted by consumers</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Consumer protection made simple
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-10"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="px-6 py-8 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow"
                variants={item}
              >
                <dt className="text-base font-medium text-gray-500 text-center">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-3xl font-extrabold text-primary text-center">{stat.value}</dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

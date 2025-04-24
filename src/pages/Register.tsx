
import { RegisterForm } from '@/components/auth/RegisterForm';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

const Register = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">ConsumerAI</h1>
            <p className="text-gray-600 mt-2">Your Legal Assistant</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
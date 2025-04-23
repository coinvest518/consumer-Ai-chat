import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

export default function Login() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">ConsumerAI</h1>
          <p className="text-gray-600 mt-2">Your Legal Assistant</p>
        </div>
        <LoginForm />
      </div>
    </motion.div>
  );
}
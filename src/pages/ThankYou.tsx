import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID found');
      return;
    }

    const verifyPayment = async () => {
      try {
        const result = await api.verifyPayment(sessionId);
        if (result.paid) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Payment verification failed');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setStatus('error');
        setErrorMessage('Failed to verify payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Verifying Your Purchase...</h1>
              <p className="mt-4 text-sm text-gray-600">
                Please wait while we verify your payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <XCircle className="h-8 w-8 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Payment Verification Failed</h1>
              <p className="mt-4 text-sm text-gray-600 mb-8">
                {errorMessage || 'We could not verify your payment. Please try again or contact support.'}
              </p>
              <Button asChild>
                <Link to="/">Return Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Thank You for Your Purchase!</h1>
            
            <p className="mt-4 text-sm text-gray-600 mb-8">
              Your Pro account has been activated. You now have unlimited access to Consumer AI.
            </p>

            <Button asChild>
              <Link to="/chat">Start Chatting Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ThankYou; 
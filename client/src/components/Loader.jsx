import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const Loader = () => {
    const { navigate, axios, getToken } = useAppContext();
    const { nextUrl } = useParams();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const isVerifyingRef = useRef(false);

    useEffect(() => {
        const verifyPayment = async () => {
            if (sessionId && !isVerifyingRef.current) {
                isVerifyingRef.current = true;
                try {
                    const token = await getToken();
                    const { data } = await axios.post(
                        '/api/bookings/verify-stripe',
                        { sessionId },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (data.success) {
                        toast.success('Payment verified successfully!');
                    } else {
                        toast.error(data.message || 'Payment verification failed');
                    }
                } catch (error) {
                    console.error('Stripe verification error:', error);
                } finally {
                    navigate(`/${nextUrl || 'my-bookings'}`);
                }
            } else if (!sessionId && nextUrl) {
                const timer = setTimeout(() => {
                    navigate(`/${nextUrl}`);
                }, 3000);
                return () => clearTimeout(timer);
            }
        };

        verifyPayment();
    }, [sessionId, nextUrl]);

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-300 border-t-primary"></div>
            {sessionId && (
                <p className="text-gray-600 font-medium text-lg animate-pulse">
                    Verifying your payment, please wait...
                </p>
            )}
        </div>
    );
};

export default Loader;

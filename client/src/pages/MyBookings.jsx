import React, { useEffect, useState, useRef } from 'react';
import Title from '../components/Title';
import { assets, userBookingsDummyData } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const {axios, getToken, user} = useAppContext();
    const verifiedRef = useRef(false);

    const fetchUserBookings = async()=> {
        try {
            const {data} = await axios.get('/api/bookings/user', {headers: {Authorization: `Bearer ${await getToken()}`}});
            if(data.success) {
                setBookings(data.bookings);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Check for session_id in query params and verify payment
    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId && user && !verifiedRef.current) {
            verifiedRef.current = true;
            (async () => {
                try {
                    const token = await getToken();
                    const { data } = await axios.post(
                        '/api/bookings/verify-stripe',
                        { sessionId },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (data.success) {
                        toast.success("Payment verified successfully!");
                    }
                    // Remove session_id from URL
                    setSearchParams({}, { replace: true });
                    fetchUserBookings();
                } catch (err) {
                    console.error("Verification error in MyBookings:", err);
                }
            })();
        }
    }, [searchParams, user]);

    //function to initialize stripe instance
    const handlePayment = async (bookingId) => {
        try {
            const {data} = await axios.post('/api/bookings/stripe-payment', {bookingId}, {headers: {Authorization: `Bearer ${await getToken()}`}});
            if(data.success) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            } else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if(user) {
            fetchUserBookings();
        }
    }, [user])

    return (
        <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
            <Title align='left' title="My Bookings" subTitle="Easily manage your past, present and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks."/>

            <div className='max-w-8xl mt-8 w-full text-gray-800'>
                <div className='hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3'>
                    <div className='w-1/3'>Hotels</div>
                    <div className='w-1/3'>Date & Timings</div>
                    <div className='w-1/3'>Payment</div>
                </div>
            </div>

            {bookings.map((booking)=>(
                <div key={booking._id} className='grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t'>
                    {/*Hotel Details */}
                    <div className='flex flex-col md:flex-row'>
                        <img src={booking.room?.images?.[0] || assets.roomImg1} alt="hotel-img" className='min-md:w-44 rounded shadow object-cover'/>
                        <div className='flex flex-col gap-1.5 max-md:mt-3 min-md:ml-4'>
                            <p className='font-playfair text-2xl'>{booking.hotel?.name || 'Hotel'} 
                            <span className='font-inner text-sm'> ({booking.room?.roomType || 'Room'})</span>
                            </p>
                            <div className='flex items-center gap-1 text-sm text-gray-500'>
                                <img src={assets.locationIcon} alt="" />
                                <span>{booking.hotel?.address || ''}</span>
                            </div>

                            <div className='flex items-center gap-1 text-sm text-gray-500'>
                                <img src={assets.guestsIcon} alt="" />
                                <span>Guests: {booking.guests}</span>
                            </div>
                            <p className='text-base'>Total Price: ${booking.totalPrice}</p>
                        </div>
                    </div>

                    {/*Date & Timings*/}
                    <div className='flex flex-row md:items-center md:gap-12 mt-3 gap-8'>
                        <div>
                            <p>Check-In:</p>
                            <p className='text-gray-500 text-sm'>{new Date(booking.checkInDate).toDateString()}</p>
                        </div>
                        <div>
                            <p>Check-Out:</p>
                            <p className='text-gray-500 text-sm'>{new Date(booking.checkOutDate).toDateString()}</p>
                        </div>
                    </div>

                    {/*Payment Info*/}
                    <div className='flex flex-col items-start justify-center pt-3'>
                        <div className='flex items-center gap-2'>
                            <div className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
                            <p className={`text-sm ${booking.isPaid ? "text-green-500" : "text-red-500"}`}>
                                    {booking.isPaid ? "Paid" : "Not Paid"}
                            </p>
                        </div>
                        {!booking.isPaid && (
                            <button onClick={() => handlePayment(booking._id)} className='px-4 py-1.5 mt-4 text-xs border border-gray-400 rounded-full cursor-pointer hover:bg-gray-50 transition-all'>
                                Pay Now
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyBookings;
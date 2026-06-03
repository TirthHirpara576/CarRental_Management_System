import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
    const {currency, axios, user} = useAppContext();

    const [bookings, setBookings] = useState([])
    const [paymentLoading, setPaymentLoading] = useState(null)

    const fetchMyBookings = async () => {
        try {
            const {data} = await axios.get('/api/bookings/user');
            if(data.success){
                setBookings(data.bookings);
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const getStatusBadgeColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-400/15 text-yellow-600',
            'approved': 'bg-blue-400/15 text-blue-600',
            'paid': 'bg-green-400/15 text-green-600',
            'completed': 'bg-purple-400/15 text-purple-600',
            'rejected': 'bg-red-400/15 text-red-600',
            'cancelled': 'bg-gray-400/15 text-gray-600'
        };
        return colors[status] || 'bg-gray-400/15 text-gray-600';
    }

    const getStatusText = (status) => {
        const texts = {
            'pending': '🟡 Pending Owner Approval',
            'approved': '🟢 Booking Approved',
            'paid': '✅ Payment Successful',
            'completed': '✅ Completed',
            'rejected': '❌ Rejected by Owner',
            'cancelled': '⚫ Cancelled'
        };
        return texts[status] || status;
    }

    const handlePayment = async (booking) => {
        try {
            setPaymentLoading(booking._id);

            // Step 1: Create Razorpay Order from Backend
            const { data: orderData } = await axios.post(
                '/api/payment/create-order',
                { bookingId: booking._id }
            );

            if (!orderData.success) {
                toast.error(orderData.message || 'Failed to create payment order');
                setPaymentLoading(null);
                return;
            }

            // Step 2: Configure Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                order_id: orderData.order.id,
                name: "Car Rental",
                description: `Booking Payment - ${booking.car.brand} ${booking.car.model}`,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                handler: async function (response) {
                    try {
                        // Step 3: Verify Payment on Backend
                        const { data: verifyData } = await axios.post(
                            '/api/payment/verify-payment',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId: booking._id
                            }
                        );

                        if (verifyData.success) {
                            toast.success('💳 Payment Successful! Booking Confirmed');
                            fetchMyBookings(); // Refresh bookings
                        } else {
                            toast.error(verifyData.message || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error('Payment verification failed');
                    } finally {
                        setPaymentLoading(null);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(null);
                        toast.error('Payment cancelled');
                    }
                }
            };

            // Step 4: Open Razorpay Checkout
            const razor = new window.Razorpay(options);
            razor.open();

        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.message || 'Payment processing failed');
            setPaymentLoading(null);
        }
    }

    useEffect(() => {
        user && fetchMyBookings()
    }, [user]);

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>
            <Title title='My Bookings' subTitle='View and manage your all car bookings' align='left' />

            <div>
                {bookings.length > 0 ? (
                    bookings.map((booking, index) => (
                        <div key={booking._id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12'>
                            {/* Car Image + Info */}
                            <div className='md:col-span-1'>
                                <div className='rounded-md overflow-hidden mb-3'>
                                    <img src={booking.car.image} alt="" className='w-full h-auto aspect-video object-cover' />
                                </div>

                                <p className='text-lg font-medium mt-2'>{booking.car.brand} {booking.car.model}</p>

                                <p className='text-gray-500'>{booking.car.year} • {booking.car.category} • {booking.car.location}</p>
                            </div>

                            {/* Booking Info */}
                            <div className='md:col-span-2'>
                                <div className='flex items-center gap-2'>
                                    <p className='px-3 py-1.5 bg-light rounded'>
                                        Booking #{index + 1}
                                    </p>
                                    <p className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusBadgeColor(booking.status)}`}>
                                        {getStatusText(booking.status)}
                                    </p>

                                </div>

                                <div className='flex items-start gap-2 mt-3'>
                                    <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1' />

                                    <div>
                                        <p className='text-gray-500'>Rental Period</p>
                                        <p>
                                            {booking.pickupDate.split('T')[0]} To{' '}
                                            {booking.returnDate.split('T')[0]}
                                        </p>
                                    </div>

                                </div>

                                <div className='flex items-start gap-2 mt-3'>
                                    <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1' />

                                    <div>
                                        <p className='text-gray-500'>Pick-up Location</p>
                                        <p>{booking.car.location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className='md:col-span-1 flex flex-col justify-between gap-6'>

                                <div className='text-sm text-gray-500 text-right'>
                                    <p>Total Price</p>

                                    <h1 className='text-2xl font-semibold text-primary'>
                                        {currency}{booking.price}
                                    </h1>

                                    <p>
                                        Booked on {booking.createdAt.split('T')[0]}
                                    </p>
                                </div>

                                {/* Pay Now Button - Only Show if Approved */}
                                {booking.status === 'approved' && (
                                    <button
                                        onClick={() => handlePayment(booking)}
                                        disabled={paymentLoading === booking._id}
                                        className='px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition'
                                    >
                                        {paymentLoading === booking._id ? 'Processing...' : '💳 Pay Now'}
                                    </button>
                                )}
                            </div>

                        </div>
                    ))
                ) : (
                    <div className='text-center py-12 text-gray-500'>
                        <p>No bookings found</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyBookings
import React from 'react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';

const ManageBookings = () => {
    const {currency, axios} = useAppContext();

    const [bookings, setBookings] = useState([]);

    const getStatusBadgeColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-600',
            'approved': 'bg-blue-100 text-blue-600',
            'paid': 'bg-green-100 text-green-600',
            'completed': 'bg-purple-100 text-purple-600',
            'rejected': 'bg-red-100 text-red-600',
            'cancelled': 'bg-gray-100 text-gray-600'
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    }

    const getStatusText = (status) => {
        const texts = {
            'pending': '🟡 Pending',
            'approved': '🔵 Awaiting Payment',
            'paid': '🟢 Paid',
            'completed': '✅ Completed',
            'rejected': '❌ Rejected',
            'cancelled': '⚫ Cancelled'
        };
        return texts[status] || status;
    }

    const fetchOwnerBookings = async () => {
        try {
            const { data } = await axios.get("/api/bookings/owner");
            if(data.success) {
                setBookings(data.bookings);
            }
            else{
                toast.error(data.message);
            }
        } 
        catch (error) {
            toast.error(error.message);
        }
    }

    const changeBookingStatus = async (bookingId, newStatus) => {
        try {
            // Prevent owner from manually setting status to "paid"
            if (newStatus === 'paid') {
                toast.error('Payment status can only be set through Razorpay verification');
                return;
            }

            const { data } = await axios.post("/api/bookings/change-status", { bookingId, newStatus });
            if(data.success) {
                toast.success(data.message);
                fetchOwnerBookings();
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const getAvailableActions = (status) => {
        switch(status) {
            case 'pending':
                return ['approve', 'reject', 'cancelled'];
            case 'approved':
                return ['cancelled'];
            case 'paid':
                return ['completed'];
            case 'completed':
                return [];
            case 'rejected':
                return [];
            case 'cancelled':
                return [];
            default:
                return [];
        }
    }

    const getActionLabel = (action) => {
        const labels = {
            'approve': 'Approve',
            'reject': 'Reject',
            'cancelled': 'Cancel',
            'completed': 'Mark Completed'
        };
        return labels[action] || action;
    }

    useEffect(() => {
        fetchOwnerBookings();
    }, []);

    return (
        <div className='px-4 pt-10 md:px-10 w-full'>

            <Title
                title="Manage Bookings"
                subTitle="Track all customer bookings, approve or cancel requests, and manage booking statuses."
            />

            <div className='max-w-4xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
                <table className='w-full border-collapse text-left text-sm text-gray-600'>
                    <thead className='text-gray-500 bg-gray-50'>
                        <tr>
                            <th className='p-3 font-medium'>Car</th>
                            <th className='p-3 font-medium max-md:hidden'>Date Range</th>
                            <th className='p-3 font-medium'>Total</th>
                            <th className='p-3 font-medium'>Status</th>
                            <th className='p-3 font-medium'>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {bookings.map((booking, index) => {
                            const availableActions = getAvailableActions(booking.status);
                            
                            return (
                                <tr key={index} className='border-t border-borderColor text-gray-500 hover:bg-gray-50'>
                                    <td className='p-3 flex items-center gap-3'>
                                        <img src={booking.car.image} alt="" className='h-12 w-12 aspect-square rounded-md object-cover' />
                                        <p className='font-medium max-md:hidden'>
                                            {booking.car.brand} {booking.car.model}
                                        </p>
                                    </td>

                                    <td className='p-3 max-md:hidden text-sm'>
                                        {booking.pickupDate.split('T')[0]} to{" "}
                                        {booking.returnDate.split('T')[0]}
                                    </td>

                                    <td className='p-3 font-semibold'>
                                        {currency}{booking.price}
                                    </td>

                                    <td className='p-3'>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </td>

                                    <td className='p-3'>
                                        {availableActions.length > 0 ? (
                                            <select 
                                                value="" 
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        changeBookingStatus(booking._id, e.target.value);
                                                    }
                                                }}
                                                className='px-2 py-1.5 text-sm text-gray-500 border border-borderColor rounded-md outline-none cursor-pointer hover:border-primary'
                                            >
                                                <option value="">Select Action</option>
                                                {availableActions.map((action) => (
                                                    <option key={action} value={action}>
                                                        {getActionLabel(action)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className='text-xs text-gray-400'>No actions</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {bookings.length === 0 && (
                    <div className='p-6 text-center text-gray-500'>
                        <p>No bookings found</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManageBookings
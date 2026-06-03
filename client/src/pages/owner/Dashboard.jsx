import React, { useEffect, useState } from 'react'
import { assets, dummyDashboardData } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
    const {axios, isOwner, currency} = useAppContext();

    const [data, setData] = useState({
        totalCars: 0,
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        completedBookings: 0,
        recentBookings: [],
        monthlyRevenue: 0,
    })

    const dashboardCards = [
        { title: "Total Cars", value: data.totalCars, icon: assets.carIconColored, color: 'bg-blue-50' },
        { title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored, color: 'bg-purple-50' },
        { title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored, color: 'bg-yellow-50' },
        { title: "Awaiting Payment", value: data.approvedBookings, icon: assets.listIconColored, color: 'bg-blue-50' },
        { title: "Completed", value: data.completedBookings, icon: assets.listIconColored, color: 'bg-green-50' },
    ]

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

    const fetchDashboardData = async () => {
        try {
            const {data} = await axios.get("/api/owner/dashboard");
            if(data.success){
                setData(data.dashboardData);
            }
            else {
                toast.error(data.message);
            }
        }
        catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if(isOwner) fetchDashboardData();
    }, [isOwner]);

    return (
        <div className='px-4 pt-10 md:px-10 flex-1'>
            <Title
                title="Owner Dashboard"
                subTitle="Monitor overall platform performance including total cars, bookings, revenue, and recent activities"
            />

            {/* Dashboard Cards */}
            <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8 w-full'>
                {dashboardCards.map((card, index) => (
                    <div key={index} className={`flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor ${card.color}`}>
                        <div>
                            <h1 className='text-xs text-gray-500'>{card.title}</h1>
                            <p className='text-2xl font-semibold'>{card.value}</p>
                        </div>
                        <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
                            <img src={card.icon} alt="" className='h-4 w-4' />
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>

                {/* Recent Booking */}
                <div className='p-4 md:p-6 border border-borderColor rounded-md flex-1 min-w-xs'>

                    <h1 className='text-lg font-medium'>Recent Bookings</h1>
                    <p className='text-gray-500 mb-4'>Latest customer bookings</p>

                    {data.recentBookings && data.recentBookings.length > 0 ? (
                        data.recentBookings.map((booking, index) => (
                            <div key={index} className='mt-4 flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0'>

                                <div className='flex items-center gap-2'>
                                    <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                                        <img src={assets.listIconColored} alt="" className='h-5 w-5' />
                                    </div>
                                    <div>
                                        <p className='font-medium'>{booking.car.brand} {booking.car.model}</p>
                                        <p className='text-sm text-gray-500'>{booking.createdAt.split('T')[0]}</p>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2 font-medium'>
                                    <p className='text-sm text-gray-500'>{currency}{booking.price}</p>
                                    <p className={`px-3 py-0.5 border rounded-full text-xs font-semibold ${getStatusBadgeColor(booking.status)}`}>
                                        {getStatusText(booking.status)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className='text-gray-500 mt-4'>No recent bookings</p>
                    )}
                </div>

                {/* Monthly Revenue */}
                <div className='p-4 md:p-6 border border-borderColor rounded-md bg-green-50'>
                    <h1 className='text-lg font-medium'>Monthly Revenue</h1>
                    <p className='text-gray-500 mb-4'>Revenue from paid & completed bookings</p>
                    <p className='text-4xl font-semibold text-green-600'>{currency}{data.monthlyRevenue}</p>
                    <p className='text-xs text-gray-500 mt-2'>💡 Only counts paid & completed bookings</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
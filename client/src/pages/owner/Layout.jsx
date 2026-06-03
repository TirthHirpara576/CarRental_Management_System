import React, { useEffect } from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
    const {isOwner, navigate} = useAppContext();

    useEffect(() => {
        if(!isOwner){
            navigate("/"); // if user is not an owner, then navigate to home page(He can't access the owner's dashboard)
        }
    },[isOwner]);

    return (
        <div className='flex flex-col'>
            <NavbarOwner />

            <div className='flex'>
                <Sidebar />
                <Outlet />
            </div>
        </div>
    )
}

export default Layout
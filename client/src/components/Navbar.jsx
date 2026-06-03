import React, { useState } from "react";
import { assets, menuLinks } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Navbar = () => {

    const { setShowLogin, user, logout, isOwner, axios, setIsOwner, fetchUser } = useAppContext(); // user -> it tells whether the user is logged in or not, logout -> function to logout the user, isOwner -> it tells whether the logged in user is an owner or not

    const location = useLocation();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const changeRole = async () => {
        try{
            const {data} = await axios.post("/api/owner/change-role", { userId: user._id });
            if(data.success){
                setIsOwner(true);
                await fetchUser();
                toast.success("Now you can list cars");
            }
            else{
                toast.error(data.message);
            }
        }
        catch(error){
            toast.error(error.message);
        }
    }

    return (
        <div className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${location.pathname === "/" && "bg-light"}`}>
            <Link to="/">
                <img src={assets.logo} alt="Logo" className="h-8" />
            </Link>
            <div className={` ${open ? "max-sm:right-0" : "max-sm:-right-full"} max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} ${open ? "max-sm:translate-x-0" : "max-sm:-translate-x-full"}`}>
                {menuLinks.map((link, index) => (
                    <Link 
                        to={link.path} 
                        key={index} 
                        className={`relative max-sm:w-full px-4 py-2 flex items-center transition-all ${
                            location.pathname === link.path 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "text-gray-600"
                        }`}
                    >
                        {link.name}
                        {location.pathname === link.path && (
                            <div className="absolute max-sm:right-0 max-sm:top-1/2 max-sm:-translate-y-1/2 max-sm:w-1.5 max-sm:h-4/5 max-sm:rounded-l sm:bottom-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-4/5 sm:h-1 sm:rounded-t bg-primary"></div>
                        )}
                    </Link>
                ))}

                <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
                    <input
                        type="text"
                        className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                        placeholder="Search products"
                    />
                    <img src={assets.search_icon} alt="search" />
                </div>

                <div className='flex max-sm:flex-col items-start sm:items-center gap-6 max-sm:w-full'>
                    <button onClick={() => isOwner ? navigate('/owner') : changeRole()} 
                        className={`relative max-sm:w-full px-4 py-2 text-left flex items-center transition-all ${
                            location.pathname.includes('/owner') 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "text-gray-600"
                        }`}
                    >
                        {isOwner ? "Dashboard" : "List cars"}
                        {location.pathname.includes('/owner') && (
                            <div className="absolute max-sm:right-0 max-sm:top-1/2 max-sm:-translate-y-1/2 max-sm:w-1.5 max-sm:h-4/5 max-sm:rounded-l sm:bottom-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-4/5 sm:h-1 sm:rounded-t bg-primary"></div>
                        )}
                    </button>
                    <button onClick={() => {user ? logout() : setShowLogin(true)}} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg max-sm:mx-4">
                        {user ? "Logout" : "Login"}
                    </button>
                </div>
            </div>

            {/* mobile menu */}
            <button className='sm:hidden cursor-pointer' aria-label="Menu" onClick={() => setOpen(!open)}>
                <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
            </button>
        </div>
    );
};

export default Navbar;
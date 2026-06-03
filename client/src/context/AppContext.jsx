/* This is a context file where we store all global variables and functions so that we can easily access them from any component in our application without having to pass them down through props. */

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// we set the base URL for all our API requests to the backend server. This way, we don't have to specify the full URL for each request, we can just use relative paths.
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL; 

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY;
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [pickupDate, setPickupDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);
    const [cars, setCars] = useState([]);

    // Fuction to check if the user is logged in or not?
    const fetchUser = async () => {
        try {
            const {data} = await axios.get("/api/user/data");
            if(data.success === true){
                setUser(data.user);
                setIsOwner(data.user.role === "owner");
            }
            else{
                navigate("/"); // if user is not logged in, then navigate to home page
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to fetch all cars from the backend server 
    const fetchCars = async () => {
        try {
            const {data} = await axios.get("/api/user/cars");
            data.success ? setCars(data.cars) : toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Fuction to Logout the user
    const logout = () => {
        localStorage.removeItem("token"); // clear the token from localstorage when user logs out
        setToken(null);
        setUser(null);
        setIsOwner(false);
        axios.defaults.headers.common["Authorization"] = ''; // remove the token from axios headers
        toast.success("You have been logged out!");
    }

    // useEffect to retrieve the token from localstorage
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setToken(token);
        }
        fetchCars(); // call this fuction whenevr the component is loaded, so that we can get the list of cars from the backend server and display them on the frontend.
    }, []);

    // useEffect to fetch user data when the token is available
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            fetchUser();
        }
    }, [token]);

    // aani andar je variables and functions define kariye chhiye, te gamme te components ma access kari sakashe...
    const value = { 
        navigate,
        currency, 
        axios,  
        token,
        setToken,
        user,
        setUser,
        isOwner,
        setIsOwner,
        fetchUser,
        fetchCars,
        logout,
        showLogin,
        setShowLogin,
        pickupDate,
        setPickupDate,
        returnDate,
        setReturnDate,
        cars,
        setCars
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => { // when we call this function, it will return the value of the context, which is the object we defined in the AppProvider component. We can then use this value in any component that is wrapped in the AppProvider component.
    return useContext(AppContext);
}
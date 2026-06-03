import React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext';

const AddCar = () => {
    const {axios, currency} = useAppContext();

    const [image, setImage] = useState(null) // for storing image
    const [carData, setCarData] = useState({ // for storing form data
        brand: '',
        model: '',
        year: 0,
        pricePerDay: 0,
        category: '',
        fuel_type: '',
        transmission: '',
        seating_capacity: 0,
        location: '',
        description: '',
    });

    const [isLoading, setIsLoading] = useState(false); // whenevr we submit the form -> this becomes "true".
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if(isLoading) return null; // if the form is already being submitted, then do nothing when user clicks the button again.
        setIsLoading(true);

        try{
            const formData = new FormData();
            formData.append("image", image);
            formData.append('carData', JSON.stringify(carData)); // Now, we have image & carData from the form.

            // Now, call the API using Axios
            const {data} = await axios.post("/api/owner/add-car", formData); // formData is the data we are sending to the backend server to add a new car.
            // Now, check the response from the backend server
            if(data.success){
                toast.success(data.message);
                setImage(null); // clear the form after successful submission
                setCarData({ // clear the car data
                    brand: '',
                    model: '',
                    year: 0,
                    pricePerDay: 0,
                    category: '',
                    fuel_type: '',
                    transmission: '',
                    seating_capacity: 0,
                    location: '',
                    description: '',
                });
            }
            else {
                toast.error(data.message);
            }
        }
        catch(err){
            toast.error(err.message);
        }
        finally{
            setIsLoading(false); // after the submission is done, set isLoading to false, so that user can submit the form again if they want to add another car.
        }
    };

    return (
        <div className='px-4 py-10 md:px-10 flex-1'>
            <Title title="Add New Car" subTitle="Fill in details to list a new car for booking, including pricing, availability, and car specifications." />

            <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'>
                {/* Car Image */}
                <div className='flex items-center gap-2 w-full'>
                    <label htmlFor="car-image">
                        <img
                            src={image ? URL.createObjectURL(image) : assets.upload_icon}
                            alt=""
                            className='h-14 rounded cursor-pointer'
                        />
                        <input type="file" id="car-image" accept='image/*' hidden
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </label>
                    <p className='text-sm text-gray-500'>Upload a picture of your car</p>
                </div>

                {/* Car Brand & Model */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col w-full'>
                        <label>Brand</label>
                        <input type="text" placeholder='e.g. BMW, Mercedes, Audi...' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                            value={carData.brand}
                            onChange={(e) =>
                                setCarData({ ...carData, brand: e.target.value })
                            }
                        />
                    </div>
                    <div className='flex flex-col w-full'>
                        <label>Model</label>
                        <input type="text" placeholder='e.g. X5, E-Class, M4...' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                            value={carData.model}
                            onChange={(e) =>
                                setCarData({ ...carData, model: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* Car Year, Price, Category */}
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    <div className='flex flex-col w-full'>
                        <label>Year</label>
                        <input type="number" placeholder='2025' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                            value={carData.year}
                            onChange={(e) =>
                                setCarData({ ...carData, year: e.target.value })
                            }
                        />
                    </div>
                    <div className='flex flex-col w-full'>
                        <label>Daily Price ({currency})</label>
                        <input type="number" placeholder='100' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                            value={carData.pricePerDay}
                            onChange={(e) =>
                                setCarData({ ...carData, pricePerDay: e.target.value })
                            }
                        />
                    </div>
                    <div className='flex flex-col w-full'>
                        <label>Category</label>
                        <select
                            onChange={(e) =>
                                setCarData({ ...carData, category: e.target.value })
                            }
                            value={carData.category} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                        >
                            <option value="">Select a category</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Van">Van</option>
                        </select>
                    </div>
                </div>

                {/* Car Transmission, Fuel Type, Seating Capacity */}
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    <div className='flex flex-col w-full'>
                        <label>Transmission</label>
                        <select
                            onChange={(e) =>
                                setCarData({ ...carData, transmission: e.target.value })
                            }
                            value={carData.transmission} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                        >
                            <option value="">Select a transmission</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                            <option value="Semi-Automatic">Semi-Automatic</option>
                        </select>
                    </div>
                    <div className='flex flex-col w-full'>
                        <label>Fuel Type</label>
                        <select
                            onChange={(e) =>
                                setCarData({ ...carData, fuel_type: e.target.value })
                            }
                            value={carData.fuel_type} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                        >
                            <option value="">Select a fuel type</option>
                            <option value="Gas">Gas</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className='flex flex-col w-full'>
                        <label>Seating Capacity</label>
                        <input type="number" placeholder='4' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                            value={carData.seating_capacity}
                            onChange={(e) =>
                                setCarData({ ...carData, seating_capacity: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* Car Location */}
                <div className='flex flex-col w-full'>
                    <label>Location</label>
                    <select
                        onChange={(e) =>
                            setCarData({ ...carData, location: e.target.value })
                        }
                        value={carData.location} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                    >
                        <option value="">Select a location</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                        <option value="Surat">Surat</option>
                        <option value="Vadodara">Vadodara</option>
                        <option value="Rajkot">Rajkot</option>
                        <option value="Gandhinagar">Gandhinagar</option>
                        <option value="Jamnagar">Jamnagar</option>
                    </select>
                </div>

                {/* Car Description */}
                <div className='flex flex-col w-full'>
                    <label>Description</label>
                    <textarea rows={5} placeholder='e.g. A luxurious SUV with a spacious interior and a powerful engine.' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                        value={carData.description}
                        onChange={(e) =>
                            setCarData({ ...carData, description: e.target.value })
                        }
                    >
                    </textarea>
                </div>

                {/* List Your Car button */}
                <button className='flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer'>
                    <img src={assets.tick_icon} alt="" />
                    {isLoading ? 'Listing Your Car...' : 'List Your Car'}
                </button>
            </form>
        </div>
    );
};

export default AddCar;
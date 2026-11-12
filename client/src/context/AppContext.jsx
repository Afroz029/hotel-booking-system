import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || import.meta.env.CURRENCY || '$';
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    // Cache isOwner in localStorage so it never flickers on reload
    const [isOwner, setIsOwner] = useState(() => {
        try {
            return localStorage.getItem('quickstay_isOwner') === 'true';
        } catch {
            return false;
        }
    });

    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);

    const formatErrorMessage = (msg) => {
        if (!msg) return "An error occurred";
        if (msg.includes('ETIMEDOUT') || msg.includes('serverSelectionTimeoutMS')) {
            return "Database connection timed out. Please add 0.0.0.0/0 to MongoDB Atlas Network Access.";
        }
        return msg;
    };

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            const { data } = await axios.get('/api/rooms');
            if (data.success) {
                setRooms(data.rooms);
            } else {
                toast.error(formatErrorMessage(data.message));
            }
        } catch (error) {
            console.error("fetchRooms error:", error.message);
            toast.error(formatErrorMessage(error.message));
        } finally {
            setLoadingRooms(false);
        }
    };

    const fetchUser = async () => {
        if (!user) return;
        try {
            setLoadingUser(true);
            const token = await getToken();
            if (!token) return;

            const response = await axios.get('/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const owner = response.data.role === "hotelOwner";
                setIsOwner(owner);
                try {
                    localStorage.setItem('quickstay_isOwner', String(owner));
                } catch {
                    // Ignore storage errors
                }
                setSearchedCities(response.data.recentSearchedCities || []);
            }
        } catch (error) {
            console.error("fetchUser error:", error.message);
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user) {
                fetchUser();
            } else {
                setIsOwner(false);
                try {
                    localStorage.removeItem('quickstay_isOwner');
                } catch {
                    // Ignore
                }
                setLoadingUser(false);
            }
        }
    }, [user, isLoaded]);

    useEffect(() => {
        fetchRooms();
    }, []);

    const value = {
        currency,
        user,
        isLoaded,
        getToken,
        navigate,
        isOwner,
        setIsOwner,
        showHotelReg,
        setShowHotelReg,
        axios,
        searchedCities,
        setSearchedCities,
        rooms,
        setRooms,
        fetchRooms,
        loadingRooms,
        loadingUser,
        fetchUser,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

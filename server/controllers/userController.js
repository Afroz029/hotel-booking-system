import User from "../models/User.js";

export const getUserData = async (req, res) => {
    try {
        const role = req.user.role || "user";
        const recentSearchedCities = req.user.recentSearchedCities || [];
        res.json({ success: true, role, recentSearchedCities });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;

        if (!recentSearchedCity) {
            return res.json({ success: true, message: "No city provided" });
        }

        let cities = Array.isArray(user.recentSearchedCities) ? [...user.recentSearchedCities] : [];

        // If not already in list, push and limit to 3
        if (!cities.includes(recentSearchedCity)) {
            if (cities.length >= 3) {
                cities.shift();
            }
            cities.push(recentSearchedCity);

            await User.findByIdAndUpdate(user._id, { recentSearchedCities: cities });
        }

        res.json({ success: true, message: "City Added", recentSearchedCities: cities });
    } catch (error) {
        console.error("storeRecentSearchedCities error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

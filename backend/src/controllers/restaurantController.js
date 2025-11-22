import Restaurant from "../modules/restaurantReg.js";

export const  createRestaurant = async (req, res) => {
    try {
        
        const { RestaurantName, OwnerName, description, address, email, RestaurantPhone, OwnerPhone } = req.body;

        if (!RestaurantName || !OwnerName || !address || !email || !RestaurantPhone) {
            return res.status(400).json({message: "All fields are required"});
        }

        const newRestaurant = new Restaurant(
            {
                RestaurantName, OwnerName, description, address, email, RestaurantPhone, OwnerPhone
            }
        );
        
        await newRestaurant.save();

        return res.status(201).json({
            message: "Restaurant registered successfully",
            restaurant: newRestaurant
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({message: "Server error"})
    }
};
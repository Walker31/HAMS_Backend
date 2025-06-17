import Hospital from '../models/hospitalModel.js';

class hospitalControllers {

    async getNearbyHospital(req, res) {
        const { lat, lon } = req.params;

        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude required" });
        }

        try {
            const hospital = await Hospital.find({
            location: {
                $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lon), parseFloat(lat)],
                },
                $maxDistance: 5000, // 5 km
                },
            },
            });

            res.json(hospital);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    }
}

export default new hospitalControllers;
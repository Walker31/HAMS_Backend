import Hospital from '../models/hospitalModel.js';

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180;
  const R = 6371000; // Radius of Earth in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class hospitalControllers {

  async getNearbyHospital(req, res) {
    const { lat, lon } = req.params;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    try {
      // Fetch all hospitals
      const hospitals = await Hospital.find({});

      // Filter those within 5 km (5000 meters)
      const nearbyHospitals = hospitals.filter(hosp => {
        const [hLon, hLat] = hosp.location.coordinates; // as per your stored format
        const distance = getDistanceFromLatLonInMeters(
          parseFloat(lat), parseFloat(lon),
          hLat, hLon
        );
        return distance <= 50000;
      });

      res.json(nearbyHospitals);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
}

export default new hospitalControllers;

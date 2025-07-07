import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token Required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    req.user = user;
    next();
  });
}

export function generateToken(user) {
  const payload = {
    id: user.doctorId || user.patientId || user.hospitalId,
    phone: user.phone,
    role: user.role || determineUserRole(user),
    name: user.name,    
    email: user.email,                           
    photo: user.photo || null,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function determineUserRole(user) {
  if (user.doctorId) return "doctor";
  if (user.patientId) return "patient";
  if (user.hospitalId) return "hospital";
  return "unknown";
}
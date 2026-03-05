import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const checkAuth = async (req, res, next) => {
	let token;
	

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.usuario = await Usuario.findById(decoded.id).select(
				"-password -confirmado -token -createdAt -updatedAt -__v"
			);

			if (!req.usuario) {
				return res.status(401).json({ msg: "Usuario no encontrado" });
			}

			return next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res
					.status(401)
					.json({
						msg: {
							es: "Sesion expirada, por favor vuelve a logearte",
							en: "Session expired, please log in again",
						},
					});
			}
			return res.status(401).json({ msg: "Hubo un error con el token." });
		}
	}
	if (!token) {
		return res.status(401).json({ msg: "Token no válido" });
	}
};

export default checkAuth;

import multer from "multer";
import fs from "fs";
import path from "path";

// Función para generar un nombre aleatorio
function generateRandomName() {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let name = "";
	for (let i = 0; i < 16; i++) {
		// Puedes ajustar la longitud del nombre si lo deseas
		name += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return name;
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = "uploads/";
		// Crear la carpeta si no existe
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const randomName = generateRandomName();
		const fileExtension = file.originalname.split(".").pop(); // Obtener la extensión del archivo
		cb(null, `${randomName}.${fileExtension}`); // Nombre único con extensión original
	},
});

// Configuración de multer
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 400 * 1024 * 1024, // 200 MB
		fieldSize: 400 * 1024 * 1024,
	},
});

export default upload;

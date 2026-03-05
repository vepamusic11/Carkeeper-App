import multer from "multer";
import path from "path";
import fs from "fs";

// Creamos carpeta de uploads si no existe
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
		cb(null, uniqueName);
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: 40 * 1024 * 1024, // 25 MB
	},
	fileFilter: (req, file, cb) => {
		const filetypes = /mp3|mp4|m4a|wav|webm|ogg/;
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		if (extname) {
			return cb(null, true);
		}
		cb(new Error("Only audio files are allowed!"));
	},
});

export default upload;

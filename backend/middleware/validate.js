/**
 * Middleware de validación con Zod.
 * Valida req.body contra el schema proporcionado.
 * Si es válido, reemplaza req.body con los datos parseados (stripeados de campos extra).
 */
const validate = (schema) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		const errors = result.error.issues.map((issue) => ({
			field: issue.path.join("."),
			message: issue.message,
		}));
		return res.status(400).json({
			success: false,
			error: "Datos de entrada inválidos",
			details: errors,
		});
	}
	req.body = result.data;
	next();
};

export default validate;

import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, "..", "logo.png");

// Leer el archivo y convertirlo a base64
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });

// Generar el string para el src (asegurarte de indicar el MIME type correcto, por ejemplo, image/png)
const logoDataUrl = `data:image/png;base64,${logoBase64}`;

// Configuración de transporte de email
const createTransport = () => {
	return nodemailer.createTransport({
		host: process.env.EMAIL_HOST || process.env.HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER || process.env.EMAIL,
			pass: process.env.EMAIL_PASS || process.env.PASSWORD,
		},
	});
};

export const emailRegistro = async ({ email, nombre, lang = "es" }) => {
	const transport = createTransport();

	// Definir textos según el idioma (en inglés o español)
	let subject, welcomeMsg, text1, text2, autoMsg, signature;
	if (lang === "en") {
		subject = "🚗 Welcome to CarKeeper";
		welcomeMsg = `Welcome to CarKeeper, ${nombre}!`;
		text1 =
			"Your account has been successfully created. Now you can keep track of all your vehicle maintenance, expenses, and documents in one place.";
		text2 =
			"If you have any questions or need assistance, please feel free to reply to this email. Our team is here to help you manage your vehicles better.";
		autoMsg =
			"This message was sent automatically. If you do not recognize this action, simply ignore it.";
		signature = "CarKeeper - Your vehicle maintenance companion 🚗";
	} else {
		subject = "🚗 Bienvenido a CarKeeper";
		welcomeMsg = `¡Bienvenido a CarKeeper, ${nombre}!`;
		text1 =
			"Tu cuenta ha sido creada exitosamente. Ahora podés llevar un registro completo de todos los mantenimientos, gastos y documentos de tus vehículos en un solo lugar.";
		text2 =
			"Si tenés alguna duda o necesitás ayuda, no dudes en responder este correo. Nuestro equipo está para ayudarte a gestionar mejor tus vehículos.";
		autoMsg =
			"Este mensaje fue enviado automáticamente. Si no reconocés esta acción, simplemente ignoralo.";
		signature = "CarKeeper - Tu compañero de mantenimiento vehicular 🚗";
	}

	// Aquí usamos el logo convertido a base64
	const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
      <div style="text-align: center;">
        <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
      </div>
      <h2 style="color: #333;">${welcomeMsg}</h2>
      <p style="color: #555;">${text1}</p>
      <p style="color: #555;">${text2}</p>
      <hr style="margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">${autoMsg}</p>
      <p style="color: #999; font-size: 12px;">${signature}</p>
    </div>
  `;

	const info = await transport.sendMail({
		from: '"CarKeeper - Bienvenido!" <noreply@carkeeper.com>',
		to: email,
		subject: subject,
		html: htmlContent,
	});

	return info;
};

export const emailOlvidePassword = async (datos) => {
	const { email, nombre, token } = datos;

	const transport = createTransport();

	const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
      <div style="text-align: center;">
        <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
      </div>
      <h2 style="color: #333;">🔒 Restablecer Contraseña</h2>
      <p style="color: #555;">Hola <strong>${nombre}</strong>,</p>
      <p style="color: #555;">Has solicitado restablecer tu contraseña en CarKeeper. Hacé clic en el siguiente enlace para crear una nueva contraseña:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer Contraseña</a>
      </div>
      <p style="color: #555;">Si no solicitaste este cambio, podés ignorar este mensaje. Tu contraseña no será modificada.</p>
      <hr style="margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Este enlace expirará en 24 horas por seguridad.</p>
      <p style="color: #999; font-size: 12px;">CarKeeper - Tu compañero de mantenimiento vehicular 🚗</p>
    </div>
  `;

	const info = await transport.sendMail({
		from: '"CarKeeper - Recuperación" <noreply@carkeeper.com>',
		to: email,
		subject: "🔒 Restablecer tu contraseña en CarKeeper",
		text: `Hola ${nombre}, has solicitado restablecer tu contraseña. Visitá: ${process.env.FRONTEND_URL}/olvide-password/${token}`,
		html: htmlContent,
	});

	return info;
};
export const emailRecordatorioMantenimiento = async (datos) => {
	const {
		email,
		nombreUsuario,
		vehiculo,
		tipoMantenimiento,
		fechaVencimiento,
		kilometrajeActual,
		kilometrajeVencimiento,
		descripcion,
		lang = "es",
	} = datos;

	const transport = createTransport();
	const fechaFormateada = new Date(fechaVencimiento).toLocaleDateString(
		lang === "en" ? "en-US" : "es-AR",
		{ weekday: "long", year: "numeric", month: "long", day: "numeric" }
	);

	// Calcular días restantes
	const hoy = new Date();
	const vencimiento = new Date(fechaVencimiento);
	const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

	let subject, htmlContent;

	if (lang === "en") {
		subject = `🔧 Maintenance Reminder: ${vehiculo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="background-color: #28a745; color: white; padding: 20px;">
            <h2 style="margin: 0;">🔧 Maintenance Reminder</h2>
            <p style="margin: 5px 0;">Time to take care of your <strong>${vehiculo}</strong></p>
          </div>
          <div style="padding: 20px;">
            <p>Hello <strong>${nombreUsuario}</strong>,</p>
            <p>This is a friendly reminder that your vehicle needs maintenance:</p>
            <ul style="line-height: 1.6; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
              <li><strong>Vehicle:</strong> ${vehiculo}</li>
              <li><strong>Maintenance Type:</strong> ${tipoMantenimiento}</li>
              <li><strong>Due Date:</strong> ${fechaFormateada}</li>
              <li><strong>Days Remaining:</strong> ${diasRestantes > 0 ? diasRestantes : 'OVERDUE'}</li>
              ${kilometrajeVencimiento ? `<li><strong>Target Mileage:</strong> ${kilometrajeVencimiento} km</li>` : ''}
              ${descripcion ? `<li><strong>Description:</strong> ${descripcion}</li>` : ''}
            </ul>
            <p style="color: ${diasRestantes <= 0 ? '#dc3545' : '#28a745'}; font-weight: bold;">
              ${diasRestantes <= 0 ? '⚠️ This maintenance is overdue!' : '✅ Plan ahead to keep your vehicle in perfect condition.'}
            </p>
          </div>
          <div style="background-color: #ecf0f1; text-align: center; padding: 10px;">
            <small>&copy; ${new Date().getFullYear()} CarKeeper. All rights reserved.</small>
          </div>
        </div>
      </div>
    `;
	} else {
		subject = `🔧 Recordatorio de Mantenimiento: ${vehiculo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="background-color: #28a745; color: white; padding: 20px;">
            <h2 style="margin: 0;">🔧 Recordatorio de Mantenimiento</h2>
            <p style="margin: 5px 0;">Es hora de cuidar tu <strong>${vehiculo}</strong></p>
          </div>
          <div style="padding: 20px;">
            <p>Hola <strong>${nombreUsuario}</strong>,</p>
            <p>Te recordamos que tu vehículo necesita mantenimiento:</p>
            <ul style="line-height: 1.6; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
              <li><strong>Vehículo:</strong> ${vehiculo}</li>
              <li><strong>Tipo de Mantenimiento:</strong> ${tipoMantenimiento}</li>
              <li><strong>Fecha de Vencimiento:</strong> ${fechaFormateada}</li>
              <li><strong>Días Restantes:</strong> ${diasRestantes > 0 ? diasRestantes : 'VENCIDO'}</li>
              ${kilometrajeVencimiento ? `<li><strong>Kilometraje Objetivo:</strong> ${kilometrajeVencimiento} km</li>` : ''}
              ${descripcion ? `<li><strong>Descripción:</strong> ${descripcion}</li>` : ''}
            </ul>
            <p style="color: ${diasRestantes <= 0 ? '#dc3545' : '#28a745'}; font-weight: bold;">
              ${diasRestantes <= 0 ? '⚠️ Este mantenimiento está vencido!' : '✅ Planificá con tiempo para mantener tu vehículo en perfectas condiciones.'}
            </p>
          </div>
          <div style="background-color: #ecf0f1; text-align: center; padding: 10px;">
            <small>&copy; ${new Date().getFullYear()} CarKeeper. Todos los derechos reservados.</small>
          </div>
        </div>
      </div>
    `;
	}

	const info = await transport.sendMail({
		from: '"CarKeeper - Recordatorios" <noreply@carkeeper.com>',
		to: email,
		subject: subject,
		text: `Recordatorio: ${tipoMantenimiento} para ${vehiculo} - Vence: ${fechaFormateada}`,
		html: htmlContent,
	});

	return info;
};
export const emailReporteMantenimiento = async (datos) => {
	const {
		email,
		nombreUsuario,
		vehiculo,
		periodo,
		mantenimientosRealizados,
		gastoTotal,
		proximosMantenimientos,
		lang = "es",
	} = datos;

	const transport = createTransport();

	let subject, htmlContent;

	if (lang === "en") {
		subject = `📊 Maintenance Report: ${vehiculo} - ${periodo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #333; margin-bottom: 10px;">📊 Maintenance Report</h2>
        <p style="color: #555; font-size: 16px;">Dear <strong>${nombreUsuario}</strong>,</p>
        <p style="color: #555; font-size: 16px;">
          Here's your maintenance summary for <strong>${vehiculo}</strong> during <strong>${periodo}</strong>:
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <h3 style="color: #333; margin-bottom: 10px;">✅ Completed Maintenance</h3>
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin-bottom: 15px;">
          ${mantenimientosRealizados.length > 0 ? 
            mantenimientosRealizados.map(m => 
              `<p>• <strong>${m.tipo}</strong> - ${new Date(m.fecha).toLocaleDateString()} - $${m.costo || 0}</p>`
            ).join('') : 
            '<p>No maintenance completed during this period.</p>'
          }
        </div>
        
        <h3 style="color: #333; margin-bottom: 10px;">💰 Total Expenses</h3>
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; border: 1px solid #28a745; margin-bottom: 15px; text-align: center;">
          <h2 style="color: #28a745; margin: 0;">$${gastoTotal || 0}</h2>
        </div>
        
        <h3 style="color: #333; margin-bottom: 10px;">🔜 Upcoming Maintenance</h3>
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
          ${proximosMantenimientos.length > 0 ? 
            proximosMantenimientos.map(m => 
              `<p>• <strong>${m.tipo}</strong> - Due: ${new Date(m.fechaVencimiento).toLocaleDateString()}</p>`
            ).join('') : 
            '<p>No upcoming maintenance scheduled.</p>'
          }
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          This report was generated automatically.
        </p>
        <p style="color: #999; font-size: 12px; text-align: center;">
          CarKeeper - Your vehicle maintenance companion 🚗
        </p>
      </div>
    `;
	} else {
		subject = `📊 Reporte de Mantenimiento: ${vehiculo} - ${periodo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #333; margin-bottom: 10px;">📊 Reporte de Mantenimiento</h2>
        <p style="color: #555; font-size: 16px;">Estimad@ <strong>${nombreUsuario}</strong>,</p>
        <p style="color: #555; font-size: 16px;">
          Aquí tenés el resumen de mantenimiento de <strong>${vehiculo}</strong> durante <strong>${periodo}</strong>:
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <h3 style="color: #333; margin-bottom: 10px;">✅ Mantenimientos Realizados</h3>
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin-bottom: 15px;">
          ${mantenimientosRealizados.length > 0 ? 
            mantenimientosRealizados.map(m => 
              `<p>• <strong>${m.tipo}</strong> - ${new Date(m.fecha).toLocaleDateString()} - $${m.costo || 0}</p>`
            ).join('') : 
            '<p>No se realizaron mantenimientos en este período.</p>'
          }
        </div>
        
        <h3 style="color: #333; margin-bottom: 10px;">💰 Gasto Total</h3>
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; border: 1px solid #28a745; margin-bottom: 15px; text-align: center;">
          <h2 style="color: #28a745; margin: 0;">$${gastoTotal || 0}</h2>
        </div>
        
        <h3 style="color: #333; margin-bottom: 10px;">🔜 Próximos Mantenimientos</h3>
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
          ${proximosMantenimientos.length > 0 ? 
            proximosMantenimientos.map(m => 
              `<p>• <strong>${m.tipo}</strong> - Vence: ${new Date(m.fechaVencimiento).toLocaleDateString()}</p>`
            ).join('') : 
            '<p>No hay mantenimientos próximos programados.</p>'
          }
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Este reporte fue generado automáticamente.
        </p>
        <p style="color: #999; font-size: 12px; text-align: center;">
          CarKeeper - Tu compañero de mantenimiento vehicular 🚗
        </p>
      </div>
    `;
	}

	const info = await transport.sendMail({
		from: '"CarKeeper - Reportes" <noreply@carkeeper.com>',
		to: email,
		subject: subject,
		html: htmlContent,
	});

	return info;
};

// Email de invitación para compartir vehículo
export const emailInvitacionVehiculo = async (datos) => {
	const {
		invitedEmail,
		invitedBy,
		vehicleInfo,
		role,
		message,
		invitationToken,
		lang = "es"
	} = datos;

	const transport = createTransport();

	// URLs para aceptar/rechazar invitación
	const acceptUrl = `${process.env.FRONTEND_URL || 'https://app.carkeeper.com'}/invitation/accept/${invitationToken}`;
	const declineUrl = `${process.env.FRONTEND_URL || 'https://app.carkeeper.com'}/invitation/decline/${invitationToken}`;

	let subject, htmlContent;

	if (lang === "en") {
		subject = `🚗 Vehicle Sharing Invitation - ${vehicleInfo.marca} ${vehicleInfo.modelo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333;">🚗 Vehicle Sharing Invitation</h2>
        <p style="color: #555;">Hello!</p>
        <p style="color: #555;"><strong>${invitedBy.nombre} ${invitedBy.apellido}</strong> has invited you to help manage their vehicle on CarKeeper:</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.ano}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>License Plate:</strong> ${vehicleInfo.patente || 'N/A'}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Your Role:</strong> ${role === 'viewer' ? 'Viewer (read-only)' : role === 'editor' ? 'Editor (can add expenses/maintenance)' : 'Admin (full access)'}</p>
        </div>

        ${message ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #555; font-style: italic;">"${message}"</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${acceptUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Accept Invitation</a>
          <a href="${declineUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Decline</a>
        </div>

        <p style="color: #555;">By accepting, you'll be able to view and manage this vehicle's maintenance and expenses according to your assigned permissions.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This invitation will expire in 7 days for security reasons.</p>
        <p style="color: #999; font-size: 12px;">CarKeeper - Your vehicle maintenance companion 🚗</p>
      </div>
    `;
	} else {
		subject = `🚗 Invitación para Compartir Vehículo - ${vehicleInfo.marca} ${vehicleInfo.modelo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333;">🚗 Invitación para Compartir Vehículo</h2>
        <p style="color: #555;">¡Hola!</p>
        <p style="color: #555;"><strong>${invitedBy.nombre} ${invitedBy.apellido}</strong> te ha invitado a colaborar en la gestión de su vehículo en CarKeeper:</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.ano}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Patente:</strong> ${vehicleInfo.patente || 'N/A'}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Tu Rol:</strong> ${role === 'viewer' ? 'Solo ver (lectura)' : role === 'editor' ? 'Editor (puede agregar gastos/mantenimiento)' : 'Admin (acceso completo)'}</p>
        </div>

        ${message ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #555; font-style: italic;">"${message}"</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${acceptUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Aceptar Invitación</a>
          <a href="${declineUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Rechazar</a>
        </div>

        <p style="color: #555;">Al aceptar, podrás ver y gestionar el mantenimiento y gastos de este vehículo según los permisos asignados.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Esta invitación expirará en 7 días por seguridad.</p>
        <p style="color: #999; font-size: 12px;">CarKeeper - Tu compañero de mantenimiento vehicular 🚗</p>
      </div>
    `;
	}

	const info = await transport.sendMail({
		from: '"CarKeeper - Invitación" <noreply@carkeeper.com>',
		to: invitedEmail,
		subject: subject,
		html: htmlContent,
	});

	return info;
};

// Email de confirmación al usuario que invita
export const emailConfirmacionInvitacion = async (datos) => {
	const {
		inviterEmail,
		inviterName,
		invitedEmail,
		vehicleInfo,
		role,
		lang = "es"
	} = datos;

	const transport = createTransport();

	let subject, htmlContent;

	if (lang === "en") {
		subject = `✅ Vehicle Sharing Invitation Sent - ${vehicleInfo.marca} ${vehicleInfo.modelo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333;">✅ Invitation Sent Successfully</h2>
        <p style="color: #555;">Hello <strong>${inviterName}</strong>,</p>
        <p style="color: #555;">Your vehicle sharing invitation has been sent successfully!</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Invitation Details:</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Vehicle:</strong> ${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.ano}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Invited User:</strong> ${invitedEmail}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Role Assigned:</strong> ${role === 'viewer' ? 'Viewer' : role === 'editor' ? 'Editor' : 'Admin'}</p>
        </div>

        <p style="color: #555;">We'll notify you when the user responds to your invitation. You can manage all your vehicle sharing invitations from the app.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">CarKeeper - Your vehicle maintenance companion 🚗</p>
      </div>
    `;
	} else {
		subject = `✅ Invitación Enviada - ${vehicleInfo.marca} ${vehicleInfo.modelo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333;">✅ Invitación Enviada Exitosamente</h2>
        <p style="color: #555;">Hola <strong>${inviterName}</strong>,</p>
        <p style="color: #555;">Tu invitación para compartir vehículo ha sido enviada exitosamente!</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Detalles de la Invitación:</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Vehículo:</strong> ${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.ano}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Usuario Invitado:</strong> ${invitedEmail}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Rol Asignado:</strong> ${role === 'viewer' ? 'Solo ver' : role === 'editor' ? 'Editor' : 'Admin'}</p>
        </div>

        <p style="color: #555;">Te notificaremos cuando el usuario responda a tu invitación. Podés gestionar todas tus invitaciones desde la app.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">CarKeeper - Tu compañero de mantenimiento vehicular 🚗</p>
      </div>
    `;
	}

	const info = await transport.sendMail({
		from: '"CarKeeper - Confirmación" <noreply@carkeeper.com>',
		to: inviterEmail,
		subject: subject,
		html: htmlContent,
	});

	return info;
};

// Email de confirmación cuando se acepta una invitación
export const emailInvitacionAceptada = async (datos) => {
	const {
		inviterEmail,
		inviterName,
		acceptedByName,
		acceptedByEmail,
		vehicleInfo,
		role,
		lang = "es"
	} = datos;

	const transport = createTransport();

	let subject, htmlContent;

	if (lang === "en") {
		subject = `🎉 Invitation Accepted - ${vehicleInfo.marca} ${vehicleInfo.modelo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333;">🎉 Great News! Invitation Accepted</h2>
        <p style="color: #555;">Hello <strong>${inviterName}</strong>,</p>
        <p style="color: #555;"><strong>${acceptedByName}</strong> (${acceptedByEmail}) has accepted your invitation to help manage your vehicle!</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.ano}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Shared with:</strong> ${acceptedByName}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Role:</strong> ${role === 'viewer' ? 'Viewer (read-only)' : role === 'editor' ? 'Editor (can add expenses/maintenance)' : 'Admin (full access)'}</p>
        </div>

        <p style="color: #555;">Now you can both manage this vehicle's maintenance and expenses together. All changes will be synchronized in real-time.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">CarKeeper - Your vehicle maintenance companion 🚗</p>
      </div>
    `;
	} else {
		subject = `🎉 Invitación Aceptada - ${vehicleInfo.marca} ${vehicleInfo.modelo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333;">🎉 ¡Excelente Noticia! Invitación Aceptada</h2>
        <p style="color: #555;">Hola <strong>${inviterName}</strong>,</p>
        <p style="color: #555;"><strong>${acceptedByName}</strong> (${acceptedByEmail}) ha aceptado tu invitación para colaborar en la gestión de tu vehículo!</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.ano}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Compartido con:</strong> ${acceptedByName}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Rol:</strong> ${role === 'viewer' ? 'Solo ver (lectura)' : role === 'editor' ? 'Editor (puede agregar gastos/mantenimiento)' : 'Admin (acceso completo)'}</p>
        </div>

        <p style="color: #555;">Ahora ambos pueden gestionar el mantenimiento y gastos de este vehículo juntos. Todos los cambios se sincronizarán en tiempo real.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">CarKeeper - Tu compañero de mantenimiento vehicular 🚗</p>
      </div>
    `;
	}

	const info = await transport.sendMail({
		from: '"CarKeeper - Buenas Noticias" <noreply@carkeeper.com>',
		to: inviterEmail,
		subject: subject,
		html: htmlContent,
	});

	return info;
};

// Email de confirmación para quien acepta la invitación
export const emailBienvenidaVehiculoCompartido = async (datos) => {
	const {
		acceptedByEmail,
		acceptedByName,
		inviterName,
		vehicleInfo,
		role,
		lang = "es"
	} = datos;

	const transport = createTransport();

	let subject, htmlContent;

	if (lang === "en") {
		subject = `🚗 Welcome to Shared Vehicle - ${vehicleInfo.marca} ${vehicleInfo.modelo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333;">🚗 Welcome to the Team!</h2>
        <p style="color: #555;">Hello <strong>${acceptedByName}</strong>,</p>
        <p style="color: #555;">You've successfully joined the management team for <strong>${inviterName}</strong>'s vehicle. Welcome aboard!</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.ano}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Owner:</strong> ${inviterName}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Your Role:</strong> ${role === 'viewer' ? 'Viewer (read-only access)' : role === 'editor' ? 'Editor (can add and edit expenses/maintenance)' : 'Admin (full access to all features)'}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #333;">What you can do:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            ${role === 'viewer' ? 
              '<li>View vehicle information, maintenance history, and expenses</li><li>See upcoming maintenance reminders</li><li>Access vehicle documents</li>' :
              role === 'editor' ?
              '<li>Add and edit maintenance records</li><li>Add and edit expenses</li><li>Upload documents</li><li>View all vehicle information</li>' :
              '<li>Full access to all vehicle features</li><li>Edit vehicle information</li><li>Manage maintenance and expenses</li><li>Upload and manage documents</li>'
            }
          </ul>
        </div>

        <p style="color: #555;">The vehicle will now appear in your vehicle list marked as "Shared". All updates will be synchronized in real-time between you and the owner.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">CarKeeper - Your vehicle maintenance companion 🚗</p>
      </div>
    `;
	} else {
		subject = `🚗 Bienvenido al Vehículo Compartido - ${vehicleInfo.marca} ${vehicleInfo.modelo}`;
		htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="${logoDataUrl}" alt="CarKeeper Logo" style="max-width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333;">🚗 ¡Bienvenido al Equipo!</h2>
        <p style="color: #555;">Hola <strong>${acceptedByName}</strong>,</p>
        <p style="color: #555;">Te has unido exitosamente al equipo de gestión del vehículo de <strong>${inviterName}</strong>. ¡Bienvenido!</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.ano}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Propietario:</strong> ${inviterName}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Tu Rol:</strong> ${role === 'viewer' ? 'Solo ver (acceso de lectura)' : role === 'editor' ? 'Editor (puede agregar y editar gastos/mantenimiento)' : 'Admin (acceso completo a todas las funciones)'}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Lo que podés hacer:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            ${role === 'viewer' ? 
              '<li>Ver información del vehículo, historial de mantenimiento y gastos</li><li>Ver recordatorios de mantenimiento próximos</li><li>Acceder a documentos del vehículo</li>' :
              role === 'editor' ?
              '<li>Agregar y editar registros de mantenimiento</li><li>Agregar y editar gastos</li><li>Subir documentos</li><li>Ver toda la información del vehículo</li>' :
              '<li>Acceso completo a todas las funciones del vehículo</li><li>Editar información del vehículo</li><li>Gestionar mantenimiento y gastos</li><li>Subir y gestionar documentos</li>'
            }
          </ul>
        </div>

        <p style="color: #555;">El vehículo ahora aparecerá en tu lista de vehículos marcado como "Compartido". Todas las actualizaciones se sincronizarán en tiempo real entre vos y el propietario.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">CarKeeper - Tu compañero de mantenimiento vehicular 🚗</p>
      </div>
    `;
	}

	const info = await transport.sendMail({
		from: '"CarKeeper - Bienvenida" <noreply@carkeeper.com>',
		to: acceptedByEmail,
		subject: subject,
		html: htmlContent,
	});

	return info;
};

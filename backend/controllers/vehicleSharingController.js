import VehicleInvitation from "../models/VehicleInvitation.js";
import Vehiculo from "../models/Vehiculo.js";
import Usuario from "../models/Usuario.js";
import { getUserSubscriptionStatus } from "../helpers/revenueCatService.js";
import generarId from "../helpers/generarId.js";
import {
	emailInvitacionVehiculo,
	emailConfirmacionInvitacion,
	emailInvitacionAceptada,
	emailBienvenidaVehiculoCompartido
} from "../helpers/emails.js";
import { sendPushNotification } from "./usuarioController.js";


// Invitar usuario a compartir vehículo (solo Pro)
const inviteUserToVehicle = async (req, res) => {
	try {
		const { id: inviterId } = req.usuario;
		const { vehicleId, email, role = 'viewer', message, permissions } = req.body;

		console.log('🔄 Starting invitation process...', {
			inviterId,
			vehicleId,
			email,
			role,
			hasMessage: !!message,
			permissions
		});

		// Verificar suscripción Pro
		const subscription = await getUserSubscriptionStatus(inviterId);
		console.log('📊 Subscription status for user', inviterId, ':', subscription);

		// Verificar también directamente el campo isInvitado del usuario
		const user = await Usuario.findById(inviterId);
		console.log('👤 User direct check:', {
			userId: inviterId,
			isInvitado: user?.isInvitado,
			proActivatedBy: user?.proActivatedBy
		});

		// Permitir si el usuario fue invitado (Easter egg) O si tiene suscripción Pro
		const hasProAccess = user?.isInvitado ||
							 (subscription?.features?.userInvitations === true);

		if (!hasProAccess) {
			console.log('❌ User invitation permission denied:', {
				subscription,
				hasFeatures: !!subscription?.features,
				hasUserInvitations: !!subscription?.features?.userInvitations,
				isInvitado: user?.isInvitado
			});
			return res.status(400).json({
				success: false,
				error: 'Esta función requiere suscripción Pro.'
			});
		}

		console.log('✅ Subscription check passed via', user?.isInvitado ? 'Easter Egg' : 'Pro subscription');

		// Verificar que el vehículo existe y pertenece al usuario
		console.log('🚗 Searching for vehicle...', { vehicleId, inviterId });
		const vehicle = await Vehiculo.findOne({
			_id: vehicleId,
			userId: inviterId,
			isActive: true
		});

		if (!vehicle) {
			console.log('❌ Vehicle not found');
			return res.status(404).json({
				success: false,
				error: 'Vehículo no encontrado'
			});
		}

		console.log('✅ Vehicle found:', vehicle.marca, vehicle.modelo);

		// Verificar si ya existe una invitación pendiente
		console.log('🔍 Checking for existing invitations...', { vehicleId, email: email.toLowerCase() });
		const existingInvitation = await VehicleInvitation.findOne({
			vehicleId,
			invitedEmail: email.toLowerCase(),
			status: 'pending'
		});

		if (existingInvitation) {
			console.log('❌ Existing invitation found');
			return res.status(400).json({
				success: false,
				error: 'Ya existe una invitación pendiente para este usuario'
			});
		}

		console.log('✅ No existing invitation found');

		// Buscar usuario por email
		console.log('👤 Searching for invited user...', { email: email.toLowerCase() });
		const invitedUser = await Usuario.findOne({ email: email.toLowerCase() });
		console.log('👤 Invited user found:', !!invitedUser, invitedUser?._id);

		// Crear invitación
		console.log('📝 Creating invitation...');
		const invitationToken = generarId();
		const invitation = new VehicleInvitation({
			invitedBy: inviterId,
			invitedUser: invitedUser?._id,
			invitedEmail: email.toLowerCase(),
			vehicleId,
			role,
			message,
			invitationToken,
			permissions: {
				canEditExpenses: permissions?.canEditExpenses ?? true,
				canEditMaintenance: permissions?.canEditMaintenance ?? true,
				canUploadDocuments: permissions?.canUploadDocuments ?? false,
				canEditVehicle: permissions?.canEditVehicle ?? false,
			}
		});

		console.log('💾 Saving invitation...');
		await invitation.save();
		console.log('✅ Invitation saved successfully');

		// Poblar información para la respuesta
		await invitation.populate([
			{ path: 'invitedBy', select: 'nombre apellido email' },
			{ path: 'vehicleId', select: 'marca modelo ano patente' }
		]);

		// Enviar emails de invitación
		try {
			// Email al usuario invitado
			await emailInvitacionVehiculo({
				invitedEmail: invitation.invitedEmail,
				invitedBy: invitation.invitedBy,
				vehicleInfo: invitation.vehicleId,
				role: invitation.role,
				message: invitation.message,
				invitationToken: invitation.invitationToken,
				lang: 'es' // Puedes obtener esto del usuario
			});

			// Email de confirmación al usuario que invita
			await emailConfirmacionInvitacion({
				inviterEmail: invitation.invitedBy.email,
				inviterName: `${invitation.invitedBy.nombre} ${invitation.invitedBy.apellido}`,
				invitedEmail: invitation.invitedEmail,
				vehicleInfo: invitation.vehicleId,
				role: invitation.role,
				lang: 'es'
			});

			console.log('Invitation emails sent successfully');
		} catch (emailError) {
			console.error('Error sending invitation emails:', emailError);
		}

		// Enviar push notification al usuario invitado (si tiene la app)
		if (invitedUser && invitedUser._id) {
			try {
				await sendPushNotification(
					invitedUser._id,
					'Nueva invitación de vehículo 🚗',
					`${invitation.invitedBy.nombre} te invitó a gestionar su ${invitation.vehicleId.marca} ${invitation.vehicleId.modelo}`
				);
				console.log('Push notification sent to invited user');
			} catch (pushError) {
				console.error('Error sending push notification to invited user:', pushError);
			}
		}

		res.status(201).json({
			success: true,
			message: 'Invitación enviada correctamente',
			invitation: {
				id: invitation._id,
				vehicleInfo: invitation.vehicleId,
				invitedEmail: invitation.invitedEmail,
				role: invitation.role,
				status: invitation.status,
				expiresAt: invitation.expiresAt,
				invitationToken: invitation.invitationToken
			}
		});

	} catch (error) {
		console.error('❌ Error inviting user:', error);
		console.error('❌ Error details:', {
			name: error.name,
			message: error.message,
			stack: error.stack
		});
		res.status(500).json({
			success: false,
			error: 'Error al enviar la invitación: ' + error.message
		});
	}
};

// Obtener invitaciones enviadas por el usuario
const getSentInvitations = async (req, res) => {
	try {
		const { id: userId } = req.usuario;

		const invitations = await VehicleInvitation.find({ invitedBy: userId })
			.populate('vehicleId', 'marca modelo ano patente imageUrl')
			.populate('invitedUser', 'nombre apellido email')
			.sort({ createdAt: -1 });

		res.json({
			success: true,
			invitations
		});

	} catch (error) {
		console.error('Error getting sent invitations:', error);
		res.status(500).json({
			success: false,
			error: 'Error al obtener las invitaciones'
		});
	}
};

// Obtener invitaciones recibidas por el usuario
const getReceivedInvitations = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { email } = req.usuario;

		const invitations = await VehicleInvitation.find({
			$or: [
				{ invitedUser: userId },
				{ invitedEmail: email.toLowerCase() }
			],
			status: 'pending'
		})
		.populate('invitedBy', 'nombre apellido email')
		.populate('vehicleId', 'marca modelo ano patente imageUrl')
		.sort({ createdAt: -1 });

		// Actualizar invitaciones que fueron enviadas por email pero ahora el usuario se registró
		const emailInvitations = invitations.filter(inv => !inv.invitedUser && inv.invitedEmail === email.toLowerCase());
		if (emailInvitations.length > 0) {
			await VehicleInvitation.updateMany(
				{
					_id: { $in: emailInvitations.map(inv => inv._id) }
				},
				{
					$set: { invitedUser: userId }
				}
			);
		}

		res.json({
			success: true,
			invitations
		});

	} catch (error) {
		console.error('Error getting received invitations:', error);
		res.status(500).json({
			success: false,
			error: 'Error al obtener las invitaciones'
		});
	}
};

// Responder a una invitación (aceptar/rechazar)
const respondToInvitation = async (req, res) => {
	try {
		const { invitationToken } = req.params;
		const { action } = req.body; // 'accept' or 'decline'
		const { id: userId } = req.usuario;

		const invitation = await VehicleInvitation.findOne({
			invitationToken,
			status: 'pending'
		})
		.populate('vehicleId')
		.populate('invitedBy', 'nombre apellido email');

		if (!invitation) {
			return res.status(404).json({
				success: false,
				error: 'Invitación no encontrada o ya procesada'
			});
		}

		// Verificar que la invitación no ha expirado
		if (invitation.isExpired()) {
			invitation.status = 'expired';
			await invitation.save();
			return res.status(400).json({
				success: false,
				error: 'La invitación ha expirado'
			});
		}

		// Verificar que el usuario puede responder a esta invitación
		const currentUser = await Usuario.findById(userId);
		const canRespond = (invitation.invitedUser && invitation.invitedUser.toString() === userId.toString()) ||
						   (!invitation.invitedUser && invitation.invitedEmail === currentUser.email.toLowerCase());

		if (!canRespond) {
			return res.status(403).json({
				success: false,
				error: 'No tienes permisos para responder a esta invitación'
			});
		}

		// Si la invitación no tenía usuario asignado pero ahora sí, asignarlo
		if (!invitation.invitedUser && invitation.invitedEmail === currentUser.email.toLowerCase()) {
			invitation.invitedUser = userId;
			await invitation.save();
		}

		if (action === 'accept') {
			// Aceptar invitación
			await invitation.accept();

			// Agregar usuario al vehículo compartido
			const vehicle = await Vehiculo.findById(invitation.vehicleId);

			// Verificar si el usuario ya está en la lista de compartidos
			const existingShare = vehicle.sharedWith.find(
				share => share.userId.toString() === userId.toString()
			);

			if (!existingShare) {
				vehicle.sharedWith.push({
					userId: userId,
					role: invitation.role,
					invitedBy: invitation.invitedBy._id,
					invitedAt: invitation.createdAt,
					acceptedAt: new Date(),
					status: 'accepted',
					permissions: {
						canEditExpenses: invitation.permissions.canEditExpenses,
						canEditMaintenance: invitation.permissions.canEditMaintenance,
						canUploadDocuments: invitation.permissions.canUploadDocuments,
						canEditVehicle: invitation.permissions.canEditVehicle
					}
				});

				await vehicle.save();
			}

			// Enviar emails de confirmación de aceptación
			try {

				// Email al usuario que aceptó la invitación
				await emailBienvenidaVehiculoCompartido({
					userEmail: currentUser.email,
					userName: `${currentUser.nombre} ${currentUser.apellido}`,
					vehicleInfo: vehicle,
					ownerInfo: invitation.invitedBy,
					role: invitation.role,
					lang: 'es'
				});

				// Email al propietario notificando que se aceptó la invitación
				await emailInvitacionAceptada({
					ownerEmail: invitation.invitedBy.email,
					ownerName: `${invitation.invitedBy.nombre} ${invitation.invitedBy.apellido}`,
					acceptedBy: `${currentUser.nombre} ${currentUser.apellido}`,
					acceptedEmail: currentUser.email,
					vehicleInfo: vehicle,
					role: invitation.role,
					lang: 'es'
				});

				console.log('Acceptance emails sent successfully');
			} catch (emailError) {
				console.error('Error sending acceptance emails:', emailError);
			}

			// Enviar push notification al propietario del vehículo
			try {
				await sendPushNotification(
					invitation.invitedBy._id,
					'Invitación aceptada ✅',
					`${currentUser.nombre} ${currentUser.apellido} aceptó compartir tu ${vehicle.marca} ${vehicle.modelo}`
				);
				console.log('Acceptance push notification sent to vehicle owner');
			} catch (pushError) {
				console.error('Error sending acceptance push notification:', pushError);
			}

			res.json({
				success: true,
				message: 'Invitación aceptada correctamente',
				vehicleInfo: {
					id: vehicle._id,
					marca: vehicle.marca,
					modelo: vehicle.modelo,
					ano: vehicle.ano,
					patente: vehicle.patente
				}
			});

		} else if (action === 'decline') {
			// Rechazar invitación
			await invitation.decline();

			res.json({
				success: true,
				message: 'Invitación rechazada'
			});

		} else {
			return res.status(400).json({
				success: false,
				error: 'Acción no válida. Usa "accept" o "decline"'
			});
		}

	} catch (error) {
		console.error('Error responding to invitation:', error);
		res.status(500).json({
			success: false,
			error: 'Error al procesar la respuesta'
		});
	}
};

// Obtener vehículos compartidos conmigo
const getSharedVehicles = async (req, res) => {
	try {
		const { id: userId } = req.usuario;

		const sharedVehicles = await Vehiculo.find({
			'sharedWith.userId': userId,
			'sharedWith.status': 'accepted',
			isActive: true
		})
		.populate('userId', 'nombre apellido email')
		.populate('sharedWith.userId', 'nombre apellido email')
		.sort({ createdAt: -1 });

		// Filtrar y formatear la información
		const formattedVehicles = sharedVehicles.map(vehicle => {
			const myShare = vehicle.sharedWith.find(
				share => share.userId._id.toString() === userId.toString()
			);

			return {
				...vehicle.toObject(),
				myRole: myShare?.role,
				sharedBy: vehicle.userId,
				acceptedAt: myShare?.acceptedAt,
				isShared: true
			};
		});

		res.json({
			success: true,
			vehicles: formattedVehicles
		});

	} catch (error) {
		console.error('Error getting shared vehicles:', error);
		res.status(500).json({
			success: false,
			error: 'Error al obtener los vehículos compartidos'
		});
	}
};

// Remover usuario de vehículo compartido
const removeUserFromVehicle = async (req, res) => {
	try {
		const { vehicleId, userId: targetUserId } = req.params;
		const { id: ownerId } = req.usuario;

		const vehicle = await Vehiculo.findOne({
			_id: vehicleId,
			userId: ownerId,
			isActive: true
		});

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				error: 'Vehículo no encontrado'
			});
		}

		// Remover usuario de la lista de compartidos
		vehicle.sharedWith = vehicle.sharedWith.filter(
			share => share.userId.toString() !== targetUserId.toString()
		);

		await vehicle.save();

		res.json({
			success: true,
			message: 'Usuario removido del vehículo compartido'
		});

	} catch (error) {
		console.error('Error removing user from vehicle:', error);
		res.status(500).json({
			success: false,
			error: 'Error al remover el usuario'
		});
	}
};

// Salir de un vehículo compartido
const leaveSharedVehicle = async (req, res) => {
	try {
		const { vehicleId } = req.params;
		const { id: userId } = req.usuario;

		const vehicle = await Vehiculo.findOne({
			_id: vehicleId,
			'sharedWith.userId': userId,
			isActive: true
		});

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				error: 'Vehículo compartido no encontrado'
			});
		}

		// Remover usuario de la lista de compartidos
		vehicle.sharedWith = vehicle.sharedWith.filter(
			share => share.userId.toString() !== userId.toString()
		);

		await vehicle.save();

		res.json({
			success: true,
			message: 'Has salido del vehículo compartido'
		});

	} catch (error) {
		console.error('Error leaving shared vehicle:', error);
		res.status(500).json({
			success: false,
			error: 'Error al salir del vehículo compartido'
		});
	}
};

export {
	inviteUserToVehicle,
	getSentInvitations,
	getReceivedInvitations,
	respondToInvitation,
	getSharedVehicles,
	removeUserFromVehicle,
	leaveSharedVehicle
};

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import clienteAxios from '../configs/clinteAxios.jsx';

export const exportService = {
  // Métodos para conectar con el backend
  async fetchExportData(endpoint, params = {}) {
    try {
      const response = await clienteAxios.get(`/usuarios/export/${endpoint}`, { params });
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error(`Error fetching ${endpoint} data:`, error);
      return { data: null, error: error.response?.data?.error || error.message };
    }
  },

  async exportVehiclesFromBackend() {
    const result = await this.fetchExportData('vehicles');
    if (result.error) {
      return result;
    }
    
    const headers = [
      'ID',
      'Marca',
      'Modelo',
      'Año',
      'Color',
      'Kilometraje',
      'VIN',
      'Patente',
      'Fecha de registro'
    ];
    
    const data = result.data.map(vehicle => ({
      id: vehicle.id,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.ano,
      color: vehicle.color || '',
      kilometraje: vehicle.kilometraje || 0,
      vin: vehicle.vin || '',
      patente: vehicle.patente || '',
      fechaRegistro: vehicle.fechaRegistro ? new Date(vehicle.fechaRegistro).toLocaleDateString('es-ES') : ''
    }));
    
    const filename = `vehiculos_${new Date().toISOString().split('T')[0]}.csv`;
    return await this.exportToCSV(data, filename, headers);
  },

  async exportExpensesFromBackend(startDate, endDate) {
    const params = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    const result = await this.fetchExportData('expenses', params);
    if (result.error) {
      return result;
    }
    
    const headers = [
      'ID',
      'Fecha',
      'Vehículo',
      'Categoría',
      'Descripción',
      'Monto',
      'Litros',
      'Kilometraje',
      'Lugar',
      'Notas'
    ];
    
    const data = result.data.map(expense => ({
      id: expense.id,
      fecha: new Date(expense.date).toLocaleDateString('es-ES'),
      vehiculo: expense.vehicleName,
      categoria: this.getCategoryName(expense.category),
      descripcion: expense.description,
      monto: expense.amount || 0,
      litros: expense.liters || '',
      kilometraje: expense.odometer || '',
      lugar: expense.location || '',
      notas: expense.notes || ''
    }));
    
    const filename = `gastos_${new Date().toISOString().split('T')[0]}.csv`;
    return await this.exportToCSV(data, filename, headers);
  },

  async exportMaintenancesFromBackend(startDate, endDate) {
    const params = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    const result = await this.fetchExportData('maintenances', params);
    if (result.error) {
      return result;
    }
    
    const headers = [
      'ID',
      'Fecha',
      'Vehículo',
      'Tipo',
      'Descripción',
      'Costo',
      'Taller',
      'Kilometraje actual',
      'Próximo mantenimiento (km)',
      'Estado',
      'Notas'
    ];
    
    const data = result.data.map(maintenance => ({
      id: maintenance.id,
      fecha: new Date(maintenance.date).toLocaleDateString('es-ES'),
      vehiculo: maintenance.vehicleName,
      tipo: this.getMaintenanceTypeName(maintenance.type),
      descripcion: maintenance.description,
      costo: maintenance.cost || 0,
      taller: maintenance.workshop || '',
      kilometrajeActual: maintenance.currentKm || '',
      proximoMantenimiento: maintenance.nextMaintenanceKm || '',
      estado: maintenance.status === 'completed' ? 'Completado' : 'Pendiente',
      notas: maintenance.notes || ''
    }));
    
    const filename = `mantenimientos_${new Date().toISOString().split('T')[0]}.csv`;
    return await this.exportToCSV(data, filename, headers);
  },

  async exportDocumentsFromBackend() {
    const result = await this.fetchExportData('documents');
    if (result.error) {
      return result;
    }
    
    const headers = [
      'ID',
      'Nombre',
      'Tipo',
      'Vehículo',
      'Descripción',
      'Emisor',
      'Número documento',
      'Fecha vencimiento',
      'Fecha creación',
      'Tiene archivo',
      'Notas'
    ];
    
    const data = result.data.map(document => ({
      id: document.id,
      nombre: document.name,
      tipo: this.getDocumentTypeName(document.type),
      vehiculo: document.vehicleName,
      descripcion: document.description || '',
      emisor: document.issuer || '',
      numeroDocumento: document.documentNumber || '',
      fechaVencimiento: document.expirationDate ? new Date(document.expirationDate).toLocaleDateString('es-ES') : '',
      fechaCreacion: document.createdAt ? new Date(document.createdAt).toLocaleDateString('es-ES') : '',
      tieneArchivo: document.hasFile ? 'Sí' : 'No',
      notas: document.notes || ''
    }));
    
    const filename = `documentos_${new Date().toISOString().split('T')[0]}.csv`;
    return await this.exportToCSV(data, filename, headers);
  },

  async exportCompleteDataFromBackend() {
    const result = await this.fetchExportData('complete');
    if (result.error) {
      return result;
    }
    
    const filename = `carkeeper_backup_${new Date().toISOString().split('T')[0]}.json`;
    return await this.exportToJSON(result.data, filename);
  },

  async generateExpenseReportFromBackend(startDate, endDate) {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    const result = await this.fetchExportData('expense-report', params);
    if (result.error) {
      return result;
    }
    
    const filename = `reporte_gastos_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.json`;
    return await this.exportToJSON(result.data, filename);
  },
  async exportToCSV(data, filename, headers) {
    try {
      // Crear contenido CSV
      let csvContent = '';
      
      // Agregar headers
      if (headers && headers.length > 0) {
        csvContent += headers.join(',') + '\n';
      }
      
      // Agregar datos
      data.forEach(row => {
        const csvRow = Object.values(row).map(value => {
          // Escapar comillas y envolver en comillas si contiene comas
          if (typeof value === 'string') {
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
          }
          return value || '';
        }).join(',');
        csvContent += csvRow + '\n';
      });
      
      // Crear archivo
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      return { uri: fileUri, error: null };
    } catch (error) {
      return { uri: null, error: error.message };
    }
  },

  async exportToJSON(data, filename) {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      return { uri: fileUri, error: null };
    } catch (error) {
      return { uri: null, error: error.message };
    }
  },

  async shareFile(fileUri, message = 'Exportación de datos CarKeeper') {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, error: 'Sharing no está disponible en este dispositivo' };
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: message
      });
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async sendByEmail(fileUri, filename, subject, body, recipients = []) {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, error: 'Mail Composer no está disponible' };
      }
      
      const result = await MailComposer.composeAsync({
        recipients,
        subject,
        body,
        attachments: [fileUri]
      });
      
      return { success: result.status === 'sent', error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async exportVehicles(vehicles) {
    const headers = [
      'ID',
      'Marca',
      'Modelo',
      'Año',
      'Color',
      'Kilometraje',
      'VIN',
      'Patente',
      'Fecha de registro'
    ];
    
    const data = vehicles.map(vehicle => ({
      id: vehicle.id,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.ano,
      color: vehicle.color || '',
      kilometraje: vehicle.kilometraje || 0,
      vin: vehicle.vin || '',
      patente: vehicle.patente || '',
      fechaRegistro: vehicle.createdAt || ''
    }));
    
    const filename = `vehiculos_${new Date().toISOString().split('T')[0]}.csv`;
    return await this.exportToCSV(data, filename, headers);
  },

  async exportExpenses(expenses, vehicles) {
    const headers = [
      'ID',
      'Fecha',
      'Vehículo',
      'Categoría',
      'Descripción',
      'Monto',
      'Litros',
      'Kilometraje',
      'Lugar',
      'Notas'
    ];
    
    const data = expenses.map(expense => {
      const vehicle = vehicles.find(v => v.id === expense.vehicleId);
      return {
        id: expense.id,
        fecha: (expense.date.toDate ? expense.date.toDate() : new Date(expense.date)).toLocaleDateString('es-ES'),
        vehiculo: vehicle ? `${vehicle.marca} ${vehicle.modelo}` : 'Vehículo eliminado',
        categoria: this.getCategoryName(expense.category),
        descripcion: expense.description,
        monto: expense.amount || 0,
        litros: expense.liters || '',
        kilometraje: expense.odometer || '',
        lugar: expense.location || '',
        notas: expense.notes || ''
      };
    });
    
    const filename = `gastos_${new Date().toISOString().split('T')[0]}.csv`;
    return await this.exportToCSV(data, filename, headers);
  },

  async exportMaintenances(maintenances, vehicles) {
    const headers = [
      'ID',
      'Fecha',
      'Vehículo',
      'Tipo',
      'Descripción',
      'Costo',
      'Taller',
      'Kilometraje actual',
      'Próximo mantenimiento (km)',
      'Estado',
      'Notas'
    ];
    
    const data = maintenances.map(maintenance => {
      const vehicle = vehicles.find(v => v.id === maintenance.vehicleId);
      return {
        id: maintenance.id,
        fecha: (maintenance.date.toDate ? maintenance.date.toDate() : new Date(maintenance.date)).toLocaleDateString('es-ES'),
        vehiculo: vehicle ? `${vehicle.marca} ${vehicle.modelo}` : 'Vehículo eliminado',
        tipo: this.getMaintenanceTypeName(maintenance.type),
        descripcion: maintenance.description,
        costo: maintenance.cost || 0,
        taller: maintenance.workshop || '',
        kilometrajeActual: maintenance.currentKm || '',
        proximoMantenimiento: maintenance.nextMaintenanceKm || '',
        estado: maintenance.status === 'completed' ? 'Completado' : 'Pendiente',
        notas: maintenance.notes || ''
      };
    });
    
    const filename = `mantenimientos_${new Date().toISOString().split('T')[0]}.csv`;
    return await this.exportToCSV(data, filename, headers);
  },

  async exportDocuments(documents, vehicles) {
    const headers = [
      'ID',
      'Nombre',
      'Tipo',
      'Vehículo',
      'Descripción',
      'Emisor',
      'Número documento',
      'Fecha vencimiento',
      'Fecha creación',
      'Tiene archivo',
      'Notas'
    ];
    
    const data = documents.map(document => {
      const vehicle = vehicles.find(v => v.id === document.vehicleId);
      return {
        id: document.id,
        nombre: document.name,
        tipo: this.getDocumentTypeName(document.type),
        vehiculo: vehicle ? `${vehicle.marca} ${vehicle.modelo}` : 'Vehículo eliminado',
        descripcion: document.description || '',
        emisor: document.issuer || '',
        numeroDocumento: document.documentNumber || '',
        fechaVencimiento: document.expirationDate ? document.expirationDate.toLocaleDateString('es-ES') : '',
        fechaCreacion: document.createdAt ? document.createdAt.toLocaleDateString('es-ES') : '',
        tieneArchivo: document.fileUrl ? 'Sí' : 'No',
        notas: document.notes || ''
      };
    });
    
    const filename = `documentos_${new Date().toISOString().split('T')[0]}.csv`;
    return await this.exportToCSV(data, filename, headers);
  },

  async exportCompleteData(vehicles, expenses, maintenances, documents) {
    const completeData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalVehicles: vehicles.length,
        totalExpenses: expenses.length,
        totalMaintenances: maintenances.length,
        totalDocuments: documents.length,
        totalExpenseAmount: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
      },
      vehicles: vehicles.map(v => ({
        ...v,
        createdAt: v.createdAt || null,
        updatedAt: v.updatedAt || null
      })),
      expenses: expenses.map(exp => ({
        ...exp,
        date: (exp.date.toDate ? exp.date.toDate() : new Date(exp.date)).toISOString(),
        createdAt: exp.createdAt ? (exp.createdAt.toDate ? exp.createdAt.toDate() : new Date(exp.createdAt)).toISOString() : null
      })),
      maintenances: maintenances.map(maint => ({
        ...maint,
        date: (maint.date.toDate ? maint.date.toDate() : new Date(maint.date)).toISOString(),
        createdAt: maint.createdAt ? (maint.createdAt.toDate ? maint.createdAt.toDate() : new Date(maint.createdAt)).toISOString() : null
      })),
      documents: documents.map(doc => ({
        ...doc,
        expirationDate: doc.expirationDate ? doc.expirationDate.toISOString() : null,
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : null
      }))
    };
    
    const filename = `carkeeper_backup_${new Date().toISOString().split('T')[0]}.json`;
    return await this.exportToJSON(completeData, filename);
  },

  getCategoryName(category) {
    const categories = {
      fuel: 'Combustible',
      maintenance: 'Mantenimiento',
      insurance: 'Seguro',
      parking: 'Estacionamiento',
      tolls: 'Peajes',
      other: 'Otros'
    };
    return categories[category] || category;
  },

  getMaintenanceTypeName(type) {
    const types = {
      oil_change: 'Cambio de aceite',
      tire_rotation: 'Rotación de neumáticos',
      brake_service: 'Servicio de frenos',
      inspection: 'Inspección general',
      filter_change: 'Cambio de filtros',
      battery: 'Batería',
      alignment: 'Alineación',
      general: 'General'
    };
    return types[type] || type;
  },

  getDocumentTypeName(type) {
    const types = {
      insurance: 'Seguro',
      registration: 'Registro',
      inspection: 'Inspección/VTV',
      license: 'Licencia',
      manual: 'Manual',
      receipt: 'Recibo/Factura',
      warranty: 'Garantía',
      other: 'Otros'
    };
    return types[type] || type;
  },

  async generateExpenseReport(expenses, vehicles, startDate, endDate) {
    const filteredExpenses = expenses.filter(exp => {
      const expDate = exp.date.toDate ? exp.date.toDate() : new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const categoryTotals = {};
    const vehicleTotals = {};

    filteredExpenses.forEach(exp => {
      // Por categoría
      const category = exp.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (exp.amount || 0);

      // Por vehículo
      const vehicle = vehicles.find(v => v.id === exp.vehicleId);
      const vehicleName = vehicle ? `${vehicle.marca} ${vehicle.modelo}` : 'Vehículo eliminado';
      vehicleTotals[vehicleName] = (vehicleTotals[vehicleName] || 0) + (exp.amount || 0);
    });

    const reportData = {
      period: {
        start: startDate.toLocaleDateString('es-ES'),
        end: endDate.toLocaleDateString('es-ES')
      },
      summary: {
        totalExpenses: filteredExpenses.length,
        totalAmount,
        averagePerExpense: filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0
      },
      byCategory: Object.entries(categoryTotals).map(([category, amount]) => ({
        category: this.getCategoryName(category),
        amount,
        percentage: ((amount / totalAmount) * 100).toFixed(1)
      })),
      byVehicle: Object.entries(vehicleTotals).map(([vehicle, amount]) => ({
        vehicle,
        amount,
        percentage: ((amount / totalAmount) * 100).toFixed(1)
      })),
      expenses: filteredExpenses
    };

    const filename = `reporte_gastos_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.json`;
    return await this.exportToJSON(reportData, filename);
  }
};
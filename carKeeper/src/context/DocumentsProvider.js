import React, { useState, useEffect, createContext } from 'react';
import { documentosService } from '../services/documentosApi';
import useAuth from '../hooks/useAuth';

const DocumentsContext = createContext();

const DocumentsProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAllDocuments();
      loadExpiringDocuments();
    } else {
      setDocuments([]);
      setExpiringDocuments([]);
    }
  }, [user]);

  const loadAllDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await documentosService.getAllUserDocuments(user._id);
    
    if (data) {
      setDocuments(data);
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { data, error };
  };

  const loadDocumentsByVehicle = async (vehicleId) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await documentosService.getDocuments(vehicleId);
    
    setLoading(false);
    return { data, error };
  };

  const loadExpiringDocuments = async (daysAhead = 30) => {
    if (!user) return;
    
    const { data, error } = await documentosService.getExpiringDocuments(user._id, daysAhead);
    
    if (data) {
      setExpiringDocuments(data);
    }
    
    return { data, error };
  };

  const addDocument = async (vehicleId, documentData, fileUri = null) => {
    setLoading(true);
    setError(null);
    
    const completeData = {
      ...documentData,
      vehicleId
    };
    
    const { id, error } = await documentosService.addDocument(completeData, fileUri);
    
    if (id) {
      await loadAllDocuments();
      await loadExpiringDocuments();
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success: !!id, error };
  };

  const updateDocument = async (documentId, updates, newFileUri = null) => {
    setLoading(true);
    setError(null);
    
    const { success, error } = await documentosService.updateDocument(
      documentId, 
      updates, 
      newFileUri
    );
    
    if (success) {
      await loadAllDocuments();
      await loadExpiringDocuments();
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success, error };
  };

  const deleteDocument = async (documentId) => {
    setLoading(true);
    setError(null);
    
    const document = documents.find(d => d._id === documentId);
    const { success, error } = await documentosService.deleteDocument(
      documentId, 
      document?.filePath
    );
    
    if (success) {
      await loadAllDocuments();
      await loadExpiringDocuments();
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success, error };
  };

  const pickDocument = async () => {
    return await documentosService.pickDocument();
  };

  const downloadDocument = async (documentId, fileName) => {
    return await documentosService.downloadDocument(documentId, fileName);
  };

  const getDocumentsByVehicle = (vehicleId) => {
    return documents.filter(doc => doc.vehicleId === vehicleId);
  };

  const getDocumentsByType = (documentType) => {
    return documents.filter(doc => doc.type === documentType);
  };

  const getUrgentExpiringDocuments = (days = 7) => {
    return expiringDocuments.filter(doc => doc.daysUntilExpiration <= days);
  };

  const getDocumentStats = () => {
    const stats = {
      total: documents.length,
      byType: {},
      expired: 0,
      expiringSoon: 0
    };
    
    const now = new Date();
    
    documents.forEach(doc => {
      // Por tipo
      if (!stats.byType[doc.type]) {
        stats.byType[doc.type] = 0;
      }
      stats.byType[doc.type]++;
      
      // Por estado de expiración
      if (doc.expirationDate) {
        const expirationDate = new Date(doc.expirationDate);
        if (expirationDate < now) {
          stats.expired++;
        } else if (expirationDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
          stats.expiringSoon++;
        }
      }
    });
    
    return stats;
  };

  return (
    <DocumentsContext.Provider value={{
      documents,
      expiringDocuments,
      loading,
      error,
      loadAllDocuments,
      loadDocumentsByVehicle,
      loadExpiringDocuments,
      addDocument,
      updateDocument,
      deleteDocument,
      pickDocument,
      downloadDocument,
      getDocumentsByVehicle,
      getDocumentsByType,
      getUrgentExpiringDocuments,
      getDocumentStats,
      refreshData: () => {
        loadAllDocuments();
        loadExpiringDocuments();
      }
    }}>
      {children}
    </DocumentsContext.Provider>
  );
};

export { DocumentsProvider };
export default DocumentsContext;
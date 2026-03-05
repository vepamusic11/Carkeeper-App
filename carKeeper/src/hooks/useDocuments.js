import { useContext } from 'react';
import DocumentsContext from '../context/DocumentsProvider';

const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments debe ser usado dentro de DocumentsProvider');
  }
  return context;
};

export default useDocuments;
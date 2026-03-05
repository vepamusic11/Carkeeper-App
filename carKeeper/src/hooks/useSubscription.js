import { useContext } from 'react';
import SubscriptionContext from '../context/SubscriptionProvider';

const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription debe ser usado dentro de SubscriptionProvider');
  }
  return context;
};

export default useSubscription;
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Error desconocido';
      const errorStack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo sali\u00f3 mal</Text>
          <ScrollView style={styles.errorScroll} contentContainerStyle={styles.errorScrollContent}>
            <Text style={styles.errorLabel}>Error:</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            {__DEV__ && errorStack ? (
              <>
                <Text style={styles.errorLabel}>Stack:</Text>
                <Text style={styles.errorDetail}>{errorStack.substring(0, 500)}</Text>
              </>
            ) : null}
            {__DEV__ && componentStack ? (
              <>
                <Text style={styles.errorLabel}>Componente:</Text>
                <Text style={styles.errorDetail}>{componentStack.substring(0, 300)}</Text>
              </>
            ) : null}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 16,
  },
  errorScroll: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
  errorScrollContent: {
    paddingHorizontal: 10,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ErrorBoundary;

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#fff3cd', border: '2px solid #ffc107' }}>
          <h1 style={{ color: '#856404', marginTop: 0 }}>🚨 Eroare React</h1>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              Vezi detalii eroare
            </summary>
            <p style={{ marginTop: '10px', color: '#721c24' }}>
              <strong>Mesaj:</strong> {this.state.error && this.state.error.toString()}
            </p>
            <p style={{ marginTop: '10px', color: '#721c24' }}>
              <strong>Stack trace:</strong>
            </p>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              border: '1px solid #dee2e6',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reîncarcă pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'; // ✅ Import

import './styles/1-variables.css';
import './styles/2-base.css';
import './styles/3-utilities.css';
import './styles/4-ui-elements.css';
import './styles/5-components.css';
import './styles/6-widgets.css';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: "red", background: "#fff0f0", height: "100vh" }}>
          <h1>⚠️ Something went wrong.</h1>
          <p><b>Error:</b> {this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()} style={{ padding: 10, marginTop: 10 }}>
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          {/* ✅ WRAP HERE: Inside Theme, but outside App */}
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
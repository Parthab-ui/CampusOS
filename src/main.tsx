import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { FinancialDataProvider } from './context/FinancialDataContext';
import './styles/app.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <FinancialDataProvider>
        <App />
      </FinancialDataProvider>
    </React.StrictMode>
  );
}

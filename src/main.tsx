import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { NotificationProvider } from './components/NotificationProvider.tsx';
import './lib/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ErrorBoundary>
  </StrictMode>,
);

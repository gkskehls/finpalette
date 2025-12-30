import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaletteProvider } from './context/PaletteContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PaletteProvider>
          <App />
        </PaletteProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

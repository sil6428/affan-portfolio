import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/geist-mono/wght-italic.css';
import './index.css';
import { MotionProvider } from '@/lib/motion';
import { router } from '@/app/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionProvider>
      <RouterProvider router={router} />
    </MotionProvider>
  </StrictMode>
);

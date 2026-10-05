import { lazy } from 'react';
import { Navigate, createBrowserRouter, useParams } from 'react-router';
import RootLayout from './RootLayout';
import { routeModules } from './routeModules';

// Every page is code-split; heavy WebGL/physics stays out of the initial bundle.
const HomePage = lazy(routeModules.home);
const CaseStudyPage = lazy(routeModules.caseStudy);
const AboutPage = lazy(routeModules.about);
const StackPage = lazy(routeModules.stack);
const LogPage = lazy(routeModules.log);
const ContactPage = lazy(routeModules.contact);
const NotFoundPage = lazy(routeModules.notFound);

/** Case files moved into the log; keep old /work links working. */
function LegacyCaseRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/log/${slug ?? ''}`} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'stack', element: <StackPage /> },
      { path: 'log', element: <LogPage /> },
      { path: 'log/:slug', element: <CaseStudyPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'work', element: <Navigate to="/log#case-files" replace /> },
      { path: 'work/:slug', element: <LegacyCaseRedirect /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);

import { useRoutes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Settings from './pages/Settings';

const AppRoutes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'subjects', element: <Subjects /> },
        { path: 'settings', element: <Settings /> }
      ],
    }
  ]);

  return routes;
};

export default AppRoutes;

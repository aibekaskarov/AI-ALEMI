import { useRoutes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Rooms from './pages/Dashboard';


const AppRoutes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'subjects', element: <Subjects /> },
      ],
    },
    {
      path: '/auth/*',
      element: <Auth />
    },
    {
      path: '/auth/register',
      element: <Register />
    },
  ]);

  return routes;
};

export default AppRoutes;

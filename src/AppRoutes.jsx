import { useRoutes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import CreateTest from './pages/CreateTest';

import LecturesTestsDetail from './pages/LecturesTestsDetail';

const AppRoutes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'subjects', element: <Subjects /> },
        { path: 'subjects/:id', element: <LecturesTestsDetail /> },
        { path: 'schedule', element: <Schedule />},
        { path: 'settings', element: <Settings /> },
        { path: 'test/add', element: <CreateTest /> }
      ],
    }
  ]);

  return routes;
};

export default AppRoutes;

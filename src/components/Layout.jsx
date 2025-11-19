import { Outlet } from 'react-router-dom';
import styles from '../css/layout.module.css';
import Sidebar from './Sidebar'

const Layout =() => (
  <div className={styles.app}>
    <main className={styles.content}>
      <Outlet />
    </main>
    <Sidebar/>
  </div>
);

export default Layout;
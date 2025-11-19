import { NavLink } from 'react-router-dom';

import { ReactComponent as HomeIcon } from '../assets/icon/homeIcon.svg';
import { ReactComponent as SettingsIcon } from '../assets/icon/settingsIcon.svg';

import { ReactComponent as LogaIcon } from '../assets/icon/logoIcon.svg';

import { ReactComponent as LogOutIcon } from '../assets/icon/logoutIcon.svg';

import styles from '../css/sideBar.module.css';

const SideBar = () => {
  const links = [
    { to: '/dashboard', label: 'Главная', icon: <HomeIcon />},
    { to: '/settings', label: 'Настройки', icon: <SettingsIcon />}
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.block}>
        <div className={styles.head}>
          <LogaIcon />
        </div>
        <nav className={styles.nav}>
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            > 
              <div className={styles.span}>
                <div className={styles.icon}>{icon}</div>
                <div className={styles.text}>{label}</div>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>
      <button className={styles.logout}>
          <LogOutIcon />
          Выйти
      </button>
    </div>
  );
};

export default SideBar;
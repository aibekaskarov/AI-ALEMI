import { NavLink } from 'react-router-dom';

import avatar from '../assets/image/userImage.jpg';

import { ReactComponent as HomeIcon } from '../assets/icon/homeIcon.svg';
import { ReactComponent as SettingsIcon } from '../assets/icon/settingsIcon.svg';

import { ReactComponent as ArrowRightIcon } from '../assets/icon/arrowRightIcon.svg';

import { ReactComponent as LogaIcon } from '../assets/icon/logaMain.svg';

import { ReactComponent as LogOutIcon } from '../assets/icon/logoutIcon.svg';

import styles from '../css/sideBar.module.css';

const SideBar = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <HomeIcon />},
    { to: '/settings', label: 'Настройки', icon: <SettingsIcon />}
  ];


  return (
    <div className={styles.sidebar}>
      <div className={styles.block}>
        <div className={styles.head}>
          <LogaIcon />
          <div className={styles.user}>
          
            <img src={avatar} alt="" className={styles.avatar}/>
          
            <div className={styles.col}>
              <h1 className={styles.title}>Ануар Нуртаев</h1>
              <h1 className={styles.role}>Председатель</h1>
            </div>
          </div>
        </div>
        <div className={styles.complex}>
          <div className={styles.span}>
            <HomeIcon />
            <div className={styles.col}>
              <h1 className={styles.title}>
                ЖК “Керемет”
              </h1>
              <p className={styles.p}>
                мкр-н Керемет, д. 100
              </p>
            </div>
          </div>
          <ArrowRightIcon />
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
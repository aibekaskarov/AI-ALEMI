import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  ClipboardList,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';

import styles from '../css/dashboard.module.css';

const Dashboard = () => {
  const [stats] = useState({
    subjects: 5,
    lectures: 23,
    tests: 12,
    upcomingLessons: 8
  });

  const [recentActivity] = useState([
    { id: 1, action: 'Создана лекция', subject: 'Математика', time: '2 часа назад', icon: FileText },
    { id: 2, action: 'Добавлен тест', subject: 'Физика', time: '5 часов назад', icon: ClipboardList },
    { id: 3, action: 'Обновлено расписание', subject: 'Общее', time: 'Вчера', icon: Calendar },
  ]);

  const [aiTip] = useState({
    title: "Совет дня от AI",
    text: "Рекомендуем добавить практические задания к лекции 'Основы квантовой механики'.",
    action: "Создать задание"
  });

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className={styles.statContent}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick }) => (
    <div className={styles.quickActionCard} onClick={onClick}>
      <div className={styles.actionIcon}>
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className={styles.activityItem}>
        <div className={styles.activityIcon}>
          <Icon size={16} />
        </div>
        <div className={styles.activityContent}>
          <div className={styles.activityMain}>
            <span className={styles.activityAction}>{activity.action}</span>
            <span className={styles.activitySubject}> · {activity.subject}</span>
          </div>
          <div className={styles.activityTime}>{activity.time}</div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h1>Добро пожаловать, Преподаватель! 👋</h1>
        <p className={styles.currentDate}>Среда, 19 ноября 2025</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard icon={BookOpen} label="Предметы" value={stats.subjects} color="#6366F1" />
        <StatCard icon={FileText} label="Лекций" value={stats.lectures} color="#8B5CF6" />
        <StatCard icon={ClipboardList} label="Тестов" value={stats.tests} color="#10B981" />
        <StatCard icon={Calendar} label="Занятий на неделе" value={stats.upcomingLessons} color="#F59E0B" />
      </div>

      {/* Quick Actions */}
      <section className={styles.section}>
        <h2>Быстрые действия</h2>
        <div className={styles.quickActionsGrid}>
          <QuickActionCard
            icon={BookOpen}
            title="Создать предмет"
            description="Начните новый курс"
            onClick={() => alert('Создание предмета')}
          />
          <QuickActionCard
            icon={FileText}
            title="Новая лекция"
            description="Добавьте материал"
            onClick={() => alert('Редактор лекции')}
          />
          <QuickActionCard
            icon={ClipboardList}
            title="Создать тест"
            description="Проверьте знания"
            onClick={() => alert('Конструктор тестов')}
          />
          <QuickActionCard
            icon={Sparkles}
            title="AI Расписание"
            description="Оптимизируйте время"
            onClick={() => alert('AI расписание')}
          />
        </div>
      </section>

      <div className={styles.twoColumnLayout}>
        {/* Activity */}
        <section className={styles.section}>
          <h2>Последняя активность</h2>
          <div className={styles.activityList}>
            {recentActivity.map(item => <ActivityItem key={item.id} activity={item} />)}
          </div>
          <button className={styles.viewAllBtn}>Посмотреть всё</button>
        </section>

        {/* AI Panel */}
        <section className={`${styles.section} ${styles.aiPanel}`}>
          <div className={styles.aiHeader}>
            <Sparkles size={20} />
            <h2>AI Помощник</h2>
          </div>

          <div className={styles.aiTip}>
            <div className={styles.aiTipIcon}>💡</div>
            <h3>{aiTip.title}</h3>
            <p>{aiTip.text}</p>
            <button className={styles.aiActionBtn}>{aiTip.action}</button>
          </div>

          <button className={styles.askAiBtn}>
            <Sparkles size={16} />
            Спросить AI
          </button>

          <div className={styles.aiStats}>
            <div className={styles.aiStatItem}>
              <TrendingUp size={16} /> 23 материала сгенерировано
            </div>
            <div className={styles.aiStatItem}>
              <Clock size={16} /> 15 часов сэкономлено
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

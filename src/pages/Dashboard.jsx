import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [subjectsData, setSubjectsData] = useState([]);
  const [lecturesData, setLecturesData] = useState([]);
  const [testsData, setTestsData] = useState([]);
  const [schedulesData, setSchedulesData] = useState([]);


  const [stats, setStats] = useState({
    subjects: 0,
    lectures: 0,
    tests: 0,
    upcomingLessons: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [aiTip, setAiTip] = useState({
    title: "Совет дня от AI",
    text: "Рекомендуем добавить практические задания к лекции.",
    action: "Создать задание"
  });

  // ==== Загрузка данных с бэкенда ====
  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectsRes, lecturesRes, testsRes, schedulesRes] = await Promise.all([
          axios.get('http://localhost:3001/subjects'),
          axios.get('http://localhost:3001/lectures'),
          axios.get('http://localhost:3001/tests'),
          axios.get('http://localhost:3001/schedules'),
        ]);

        const subjectsData = subjectsRes.data;
        const lecturesData = lecturesRes.data;
        const testsData = testsRes.data;
        const schedulesData = schedulesRes.data;

        console.log('Subjects:', subjectsData); // проверка

        setSubjectsData(subjectsRes.data);
        setLecturesData(lecturesRes.data);
        setTestsData(testsRes.data);
        setSchedulesData(schedulesRes.data);


        setStats({
          subjects: subjectsData.length,
          lectures: lecturesData.length,
          tests: testsData.length,
          upcomingLessons: schedulesData.reduce((acc, sch) => {
            return acc + sch.days.reduce((dAcc, day) => dAcc + day.lessons.length, 0);
          }, 0)
        });

        // Последние действия
        const activities = [
          ...lecturesData.slice(-3).map(l => ({ id: l.id, action: 'Создана лекция', subject: l.name, time: 'Недавно', icon: FileText })),
          ...testsData.slice(-3).map(t => ({
            id: t.id,
            action: 'Добавлен тест',
            subject: lecturesData.find(l => l.id === t.lecture_id)?.name || 'Лекция',
            time: 'Недавно',
            icon: ClipboardList
          }))
        ];
        setRecentActivity(activities);

      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    }

    fetchData();
  }, []);

  // ==== Генерация расписания через AI ====
  const handleGenerateSchedule = async () => {
    try {
      const teacherId = 1; // пример
      const res = await axios.post(`http://localhost:3001/schedules/generate/${teacherId}`);
      const schedule = res.data;
      alert('AI сгенерировал расписание на неделю!');
      console.log(schedule);
    } catch (error) {
      console.error('Ошибка генерации расписания:', error);
    }
  };

  // ==== Статистика, Активность и AI ====
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
      <div className={styles.actionIcon}><Icon size={28} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className={styles.activityItem}>
        <div className={styles.activityIcon}><Icon size={16} /></div>
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
      <div className={styles.welcomeSection}>
        <h1>Добро пожаловать, Преподаватель! 👋</h1>
        <p className={styles.currentDate}>
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon={BookOpen} label="Предметы" value={subjectsData.length} color="#6366F1" />
        <StatCard icon={FileText} label="Лекций" value={lecturesData.length} color="#8B5CF6" />
        <StatCard icon={ClipboardList} label="Тестов" value={testsData.length} color="#10B981" />
        <StatCard
          icon={Calendar}
          label="Занятий на неделе"
          value={schedulesData.reduce((acc, sch) => acc + sch.days.reduce((dAcc, day) => dAcc + day.lessons.length, 0), 0)}
          color="#F59E0B"
        />
      </div>


      <section className={styles.section}>
        <h2>Быстрые действия</h2>
        <div className={styles.quickActionsGrid}>
          <QuickActionCard icon={BookOpen} title="Создать предмет" description="Начните новый курс" onClick={() => alert('Создание предмета')} />
          <QuickActionCard icon={FileText} title="Новая лекция" description="Добавьте материал" onClick={() => alert('Редактор лекции')} />
          <QuickActionCard icon={ClipboardList} title="Создать тест" description="Проверьте знания" onClick={() => alert('Конструктор тестов')} />
          <QuickActionCard icon={Sparkles} title="AI Расписание" description="Оптимизируйте время" onClick={handleGenerateSchedule} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
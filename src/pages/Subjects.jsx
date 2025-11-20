import React from 'react';
import { BookOpen, Calculator, Globe, Palette, Laptop, FlaskConical } from 'lucide-react';
import styles from '../css/subjects.module.css';

const subjects = [
  { id: 1, name: 'Машинное обучение', icon: Laptop, lectures: 24, tests: 8, color: 'purple' },
  { id: 2, name: 'Анализ данных', icon: Calculator, lectures: 18, tests: 6, color: 'violet' },
  { id: 3, name: 'Этика ИИ', icon: BookOpen, lectures: 12, tests: 4, color: 'green' },
  { id: 4, name: 'Химия 101', icon: FlaskConical, lectures: 20, tests: 7, color: 'orange' },
  { id: 5, name: 'Веб-разработка', icon: Globe, lectures: 16, tests: 5, color: 'blue' },
  { id: 6, name: 'Дизайн-мышление', icon: Palette, lectures: 10, tests: 3, color: 'pink' }
];

const colors = {
  purple: { bg: '#ede9fe', icon: '#7c3aed', border: '#7c3aed' },
  violet: { bg: '#ede9fe', icon: '#8b5cf6', border: '#8b5cf6' },
  green: { bg: '#d1fae5', icon: '#10b981', border: '#10b981' },
  orange: { bg: '#fed7aa', icon: '#f59e0b', border: '#f59e0b' },
  blue: { bg: '#dbeafe', icon: '#3b82f6', border: '#3b82f6' },
  pink: { bg: '#fce7f3', icon: '#ec4899', border: '#ec4899' }
};

export default function Subjects() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Мои предметы</h1>
          <p className={styles.subtitle}>Управляйте своими курсами и учебными материалами</p>
        </div>
        <button className={styles.createButton}>
          <span style={{ fontSize: '18px' }}>+</span> Создать предмет
        </button>
      </div>

      <div className={styles.grid}>
        {subjects.map((subject) => {
          const Icon = subject.icon;
          const colorScheme = colors[subject.color];

          return (
            <div key={subject.id} className={styles.card}>
              <div className={styles.cardTopBorder} style={{ backgroundColor: colorScheme.border }} />

              <div className={styles.iconWrapper} style={{ backgroundColor: colorScheme.bg }}>
                <Icon size={28} color={colorScheme.icon} strokeWidth={2} />
              </div>

              <h3 className={styles.cardTitle}>{subject.name}</h3>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 4h12M2 4v8a2 2 0 002 2h8a2 2 0 002-2V4M2 4l2-2h8l2 2" />
                    <path d="M6 7v5M10 7v5" />
                  </svg>
                  {subject.lectures} лекций
                </div>
                <div className={styles.stat}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="12" height="10" rx="1" />
                    <path d="M2 6h12M5 3v3M11 3v3" />
                  </svg>
                  {subject.tests} тестов
                </div>
              </div>

              <button className={styles.openButton} style={{ borderColor: '#e2e8f0', color: '#1a1a2e' }}>
                Открыть
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

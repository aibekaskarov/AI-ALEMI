import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calculator, Globe, Palette, Laptop, FlaskConical, Plus, Edit2, Trash2 } from 'lucide-react';
import { subjectsAPI, lecturesAPI, testsAPI } from '../services/api';
import styles from '../css/subjects.module.css';

const ICON_MAP = {
  book: BookOpen,
  laptop: Laptop,
  flask: FlaskConical,
  atom: Calculator,
  globe: Globe,
  paint: Palette,
  music: BookOpen,
  dumbbell: BookOpen
};

const COLORS = {
  purple: { bg: '#ede9fe', icon: '#7c3aed', border: '#7c3aed' },
  violet: { bg: '#ede9fe', icon: '#8b5cf6', border: '#8b5cf6' },
  green: { bg: '#d1fae5', icon: '#10b981', border: '#10b981' },
  orange: { bg: '#fed7aa', icon: '#f59e0b', border: '#f59e0b' },
  blue: { bg: '#dbeafe', icon: '#3b82f6', border: '#3b82f6' },
  pink: { bg: '#fce7f3', icon: '#ec4899', border: '#ec4899' }
};

const AVAILABLE_ICONS = [
  { id: 'book', label: 'Книга', icon: BookOpen },
  { id: 'laptop', label: 'Компьютер', icon: Laptop },
  { id: 'flask', label: 'Химия', icon: FlaskConical },
  { id: 'atom', label: 'Физика', icon: Calculator },
  { id: 'globe', label: 'География', icon: Globe },
  { id: 'paint', label: 'Искусство', icon: Palette }
];

const AVAILABLE_COLORS = [
  { id: 'blue', name: 'Синий' },
  { id: 'purple', name: 'Фиолетовый' },
  { id: 'green', name: 'Зеленый' },
  { id: 'orange', name: 'Оранжевый' },
  { id: 'pink', name: 'Розовый' },
  { id: 'violet', name: 'Фиолетовый' }
];

export default function Subjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon_id: 'book',
    color_id: 'blue'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, lecturesRes, testsRes] = await Promise.all([
        subjectsAPI.getAll(),
        lecturesAPI.getAll(),
        testsAPI.getAll()
      ]);
      setSubjects(subjectsRes.data);
      setLectures(lecturesRes.data);
      setTests(testsRes.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Ошибка при загрузке данных. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const getLecturesCount = (subjectId) => {
    return lectures.filter(l => l.subject_id == subjectId).length;
  };

  const getTestsCount = (subjectId) => {
    const subjectLectures = lectures.filter(l => l.subject_id == subjectId);
    return tests.filter(t => subjectLectures.some(l => l.id == t.lecture_id)).length;
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        icon_id: subject.icon_id,
        color_id: subject.color_id
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        icon_id: 'book',
        color_id: 'blue'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubject(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Введите название предмета');
      return;
    }

    try {
      if (editingSubject) {
        await subjectsAPI.update(editingSubject.id, formData);
      } else {
        await subjectsAPI.create(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка сохранения предмета:', error);
      alert('Ошибка при сохранении предмета');
    }
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Вы уверены, что хотите удалить этот предмет?')) return;

    try {
      await subjectsAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Ошибка удаления предмета:', error);
      alert('Ошибка при удалении предмета');
    }
  };

  const handleOpenSubject = (subjectId) => {
    // Здесь можно использовать React Router для навигации
    navigate(`/subjects/${subjectId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '64px', color: '#6B7280' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Мои предметы</h1>
          <p className={styles.subtitle}>Управляйте своими курсами и учебными материалами</p>
        </div>
        <button className={styles.createButton} onClick={() => handleOpenModal()}>
          <Plus size={18} /> Создать предмет
        </button>
      </div>

      {subjects.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
          <h2 style={{ fontSize: '24px', color: '#1F2937', marginBottom: '8px' }}>
            У вас пока нет предметов
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '24px' }}>
            Создайте первый предмет, чтобы начать работу
          </p>
          <button className={styles.createButton} onClick={() => handleOpenModal()}>
            Создать первый предмет
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {subjects.map((subject) => {
            const IconComponent = ICON_MAP[subject.icon_id] || BookOpen;
            const colorScheme = COLORS[subject.color_id] || COLORS.blue;

            return (
              <div key={subject.id} className={styles.card}>
                <div className={styles.cardTopBorder} style={{ backgroundColor: colorScheme.border }} />

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: colorScheme.bg }}>
                    <IconComponent size={28} color={colorScheme.icon} strokeWidth={2} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenModal(subject)}
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#6B7280'
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#6B7280'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className={styles.cardTitle}>{subject.name}</h3>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 4h12M2 4v8a2 2 0 002 2h8a2 2 0 002-2V4M2 4l2-2h8l2 2" />
                      <path d="M6 7v5M10 7v5" />
                    </svg>
                    {getLecturesCount(subject.id)} лекций
                  </div>
                  <div className={styles.stat}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="3" width="12" height="10" rx="1" />
                      <path d="M2 6h12M5 3v3M11 3v3" />
                    </svg>
                    {getTestsCount(subject.id)} тестов
                  </div>
                </div>

                <button 
                  className={styles.openButton} 
                  style={{ borderColor: '#e2e8f0', color: '#1a1a2e' }}
                  onClick={() => handleOpenSubject(subject.id)}
                >
                  Открыть
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                {editingSubject ? 'Редактировать предмет' : 'Создать предмет'}
              </h2>
              <button 
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: '#6B7280',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Название предмета
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Например: Математика"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Иконка
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '12px' 
                }}>
                  {AVAILABLE_ICONS.map(iconData => {
                    const Icon = iconData.icon;
                    return (
                      <div
                        key={iconData.id}
                        onClick={() => setFormData({...formData, icon_id: iconData.id})}
                        style={{
                          padding: '16px',
                          border: `2px solid ${formData.icon_id === iconData.id ? '#6366F1' : '#E5E7EB'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          background: formData.icon_id === iconData.id ? '#F0F1FF' : 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Icon size={24} style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {iconData.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Цвет
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '12px' 
                }}>
                  {AVAILABLE_COLORS.map(color => (
                    <div
                      key={color.id}
                      onClick={() => setFormData({...formData, color_id: color.id})}
                      style={{
                        padding: '12px',
                        border: `2px solid ${formData.color_id === color.id ? '#6366F1' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: formData.color_id === color.id ? '#F0F1FF' : 'white'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: COLORS[color.id]?.icon || '#6366F1'
                      }} />
                      <span style={{ fontSize: '13px' }}>{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end' 
              }}>
                <button
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  {editingSubject ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

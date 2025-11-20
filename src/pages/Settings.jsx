import React, { useState, useEffect } from 'react';
import { User, Clock, BookOpen, Bell, Save, Check } from 'lucide-react';
import { teachersAPI, subjectsAPI } from '../services/api';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    selected_subjects: [],
    hours_per_week: 12,
    lesson_duration: 90,
    min_break: 15,
    work_start: '08:00',
    work_end: '17:00',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        teachersAPI.getAll(),
        subjectsAPI.getAll()
      ]);

      setSubjects(subjectsRes.data);
      
      // Для MVP берем первого преподавателя или создаем нового
      let currentTeacher = teachersRes.data[0];
      
      if (!currentTeacher) {
        const newTeacher = {
          name: 'Преподаватель',
          selected_subjects: [],
          hours_per_week: 12,
          lesson_duration: 90,
          min_break: 15,
          work_start: '08:00',
          work_end: '17:00'
        };
        const response = await teachersAPI.create(newTeacher);
        currentTeacher = response.data;
      }

      setTeacher(currentTeacher);
      setFormData({
        name: currentTeacher.name,
        selected_subjects: currentTeacher.selected_subjects || [],
        hours_per_week: currentTeacher.hours_per_week,
        lesson_duration: currentTeacher.lesson_duration,
        min_break: currentTeacher.min_break,
        work_start: currentTeacher.work_start,
        work_end: currentTeacher.work_end,
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!teacher) return;

    setSaving(true);
    setSaved(false);

    try {
      await teachersAPI.update(teacher.id, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (subjectId) => {
    const selected = formData.selected_subjects;
    const newSelected = selected.includes(subjectId)
      ? selected.filter(id => id !== subjectId)
      : [...selected, subjectId];
    
    setFormData({ ...formData, selected_subjects: newSelected });
  };

  if (loading) {
    return <div className="page-loading">Загрузка...</div>;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Настройки</h1>
          <p className="subtitle">Управление профилем и предпочтениями</p>
        </div>
        <button 
          className="btn-save"
          onClick={handleSave}
          disabled={saving || saved}
        >
          {saved ? (
            <>
              <Check size={18} />
              Сохранено
            </>
          ) : (
            <>
              <Save size={18} />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </>
          )}
        </button>
      </div>

      <div className="settings-container">
        <div className="tabs-sidebar">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Профиль
          </button>
          <button
            className={`tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <BookOpen size={18} />
            Предметы
          </button>
          <button
            className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Clock size={18} />
            Расписание
          </button>
        </div>

        <div className="content-area">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Профиль преподавателя</h2>
              <p className="section-description">
                Основная информация о вас
              </p>

              <div className="form-group">
                <label>Имя преподавателя</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="info-box">
                <div className="info-icon">ℹ️</div>
                <div>
                  <h4>Информация</h4>
                  <p>Эти данные будут использоваться при генерации расписания и в отчетах.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="settings-section">
              <h2>Мои предметы</h2>
              <p className="section-description">
                Выберите предметы, которые вы преподаете
              </p>

              {subjects.length === 0 ? (
                <div className="empty-message">
                  Сначала создайте предметы в разделе "Мои предметы"
                </div>
              ) : (
                <div className="subjects-list">
                  {subjects.map(subject => (
                    <div
                      key={subject.id}
                      className={`subject-item ${formData.selected_subjects.includes(subject.id) ? 'selected' : ''}`}
                      onClick={() => toggleSubject(subject.id)}
                    >
                      <div className="subject-checkbox">
                        {formData.selected_subjects.includes(subject.id) && <Check size={16} />}
                      </div>
                      <div className="subject-info">
                        <h3>{subject.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="info-box">
                <div className="info-icon">💡</div>
                <div>
                  <h4>Совет</h4>
                  <p>Выбранные предметы будут учитываться при автоматической генерации расписания.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="settings-section">
              <h2>Настройки расписания</h2>
              <p className="section-description">
                Укажите ваши предпочтения для создания оптимального расписания
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label>Часов в неделю</label>
                  <input
                    type="number"
                    value={formData.hours_per_week}
                    onChange={e => setFormData({...formData, hours_per_week: parseInt(e.target.value)})}
                    min="1"
                    max="40"
                  />
                  <span className="hint">Общая недельная нагрузка</span>
                </div>

                <div className="form-group">
                  <label>Длительность занятия (минуты)</label>
                  <input
                    type="number"
                    value={formData.lesson_duration}
                    onChange={e => setFormData({...formData, lesson_duration: parseInt(e.target.value)})}
                    min="30"
                    max="180"
                    step="15"
                  />
                  <span className="hint">Обычно 45, 60 или 90 минут</span>
                </div>

                <div className="form-group">
                  <label>Минимальный перерыв (минуты)</label>
                  <input
                    type="number"
                    value={formData.min_break}
                    onChange={e => setFormData({...formData, min_break: parseInt(e.target.value)})}
                    min="5"
                    max="60"
                    step="5"
                  />
                  <span className="hint">Время между занятиями</span>
                </div>

                <div className="form-group">
                  <label>Начало рабочего дня</label>
                  <input
                    type="time"
                    value={formData.work_start}
                    onChange={e => setFormData({...formData, work_start: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Конец рабочего дня</label>
                  <input
                    type="time"
                    value={formData.work_end}
                    onChange={e => setFormData({...formData, work_end: e.target.value})}
                  />
                </div>
              </div>

              <div className="info-box success">
                <div className="info-icon">✨</div>
                <div>
                  <h4>AI оптимизация</h4>
                  <p>
                    AI использует эти настройки для создания сбалансированного расписания,
                    учитывая ваши предпочтения и минимизируя усталость.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px;
          background: #F9FAFB;
          min-height: 100vh;
        }

        .page-loading {
          text-align: center;
          padding: 64px;
          color: #6B7280;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 4px 0;
        }

        .subtitle {
          font-size: 15px;
          color: #6B7280;
          margin: 0;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .settings-container {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
        }

        .tabs-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border: none;
          border-radius: 8px;
          color: #6B7280;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .tab:hover {
          color: #374151;
          background: #F9FAFB;
        }

        .tab.active {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          color: white;
        }

        .content-area {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .settings-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 8px 0;
        }

        .section-description {
          font-size: 15px;
          color: #6B7280;
          margin: 0 0 32px 0;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #6366F1;
        }

        .hint {
          display: block;
          font-size: 12px;
          color: #9CA3AF;
          margin-top: 4px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .info-box {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #F0F9FF;
          border: 1px solid #BAE6FD;
          border-radius: 8px;
          margin-top: 32px;
        }

        .info-box.success {
          background: #F0FDF4;
          border-color: #BBF7D0;
        }

        .info-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .info-box h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 4px 0;
        }

        .info-box p {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }

        .empty-message {
          text-align: center;
          padding: 48px 20px;
          color: #9CA3AF;
          font-size: 14px;
        }

        .subjects-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 12px;
          margin-bottom: 32px;
        }

        .subject-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #F9FAFB;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .subject-item:hover {
          border-color: #6366F1;
          background: #F0F1FF;
        }

        .subject-item.selected {
          border-color: #6366F1;
          background: #F0F1FF;
        }

        .subject-checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid #D1D5DB;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .subject-item.selected .subject-checkbox {
          background: #6366F1;
          border-color: #6366F1;
          color: white;
        }

        .subject-info h3 {
          font-size: 15px;
          font-weight: 500;
          color: #1F2937;
          margin: 0;
        }

        @media (max-width: 768px) {
          .settings-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .btn-save {
            width: 100%;
            justify-content: center;
          }

          .settings-container {
            grid-template-columns: 1fr;
          }

          .tabs-sidebar {
            flex-direction: row;
            overflow-x: auto;
          }

          .tab {
            white-space: nowrap;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .subjects-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
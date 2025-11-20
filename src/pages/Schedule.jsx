import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Sparkles, Loader, Trash2 } from 'lucide-react';
import { schedulesAPI, teachersAPI, subjectsAPI, lecturesAPI } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_NAMES = {
  'Monday': 'Понедельник',
  'Tuesday': 'Вторник',
  'Wednesday': 'Среда',
  'Thursday': 'Четверг',
  'Friday': 'Пятница'
};
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const EventCard = ({ event, subjectColor }) => {
  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const startMinutes = timeToMinutes(event.start_time);
  const endMinutes = timeToMinutes(event.end_time);
  const startRow = Math.floor((startMinutes - 480) / 60) + 2;
  const span = Math.ceil((endMinutes - startMinutes) / 60);

  return (
    <div
      style={{
        gridRow: `${startRow} / span ${span}`,
        background: subjectColor,
        borderRadius: '12px',
        padding: '14px',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        margin: '2px 4px',
        minHeight: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      }}
    >
      <div>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
          {event.subject_name}
        </h4>
        {event.lecture_name && (
          <span style={{ fontSize: '12px', opacity: 0.9 }}>{event.lecture_name}</span>
        )}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '500', marginTop: '4px' }}>
        {event.start_time} - {event.end_time}
      </div>
    </div>
  );
};

const Schedule = () => {
  const [schedule, setSchedule] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const SUBJECT_COLORS = {
    1: '#5A54F1',
    2: '#9B5CF6',
    3: '#18A57E',
    4: '#4A8BFF',
    5: '#F59E0B',
    6: '#EC4899'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, teachersRes, subjectsRes, lecturesRes] = await Promise.all([
        schedulesAPI.getAll(),
        teachersAPI.getAll(),
        subjectsAPI.getAll(),
        lecturesAPI.getAll()
      ]);

      setSubjects(subjectsRes.data);
      setLectures(lecturesRes.data);
      
      const currentTeacher = teachersRes.data[0];
      setTeacher(currentTeacher);
      
      const teacherSchedules = schedulesRes.data.filter(s => s.teacher_id === currentTeacher?.id);
      if (teacherSchedules.length > 0) {
        setSchedule(teacherSchedules[teacherSchedules.length - 1]);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Ошибка при загрузке данных. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!teacher) {
      alert('Преподаватель не найден');
      return;
    }

    setGenerating(true);
    try {
      const response = await schedulesAPI.generateForTeacher(teacher.id);
      setSchedule(response.data);
      setShowGenerateModal(false);
      alert('Расписание успешно создано!');
    } catch (error) {
      console.error('Ошибка генерации расписания:', error);
      alert('Ошибка при генерации расписания');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSchedule = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!schedule || !confirm('Удалить расписание?')) return;
    
    try {
      await schedulesAPI.delete(schedule.id);
      setSchedule(null);
    } catch (error) {
      console.error('Ошибка удаления расписания:', error);
      alert('Ошибка при удалении расписания');
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Неизвестный предмет';
  };

  const getLectureName = (lectureId) => {
    if (!lectureId) return '';
    const lecture = lectures.find(l => l.id === lectureId);
    return lecture ? lecture.name : '';
  };

  const getSubjectColor = (subjectId) => {
    return SUBJECT_COLORS[subjectId % 7] || '#6366F1';
  };

  const getEnrichedEvents = () => {
    if (!schedule || !schedule.days) return [];
    
    const events = [];
    schedule.days.forEach(dayData => {
      dayData.lessons?.forEach(lesson => {
        events.push({
          ...lesson,
          day: dayData.day,
          subject_name: getSubjectName(lesson.subject_id),
          lecture_name: getLectureName(lesson.lecture_id),
          color: getSubjectColor(lesson.subject_id)
        });
      });
    });
    return events;
  };

  const getTotalClasses = () => {
    return getEnrichedEvents().length;
  };

  const getTotalHours = () => {
    const events = getEnrichedEvents();
    let totalMinutes = 0;
    
    events.forEach(event => {
      const [startH, startM] = event.start_time.split(':').map(Number);
      const [endH, endM] = event.end_time.split(':').map(Number);
      const duration = (endH * 60 + endM) - (startH * 60 + startM);
      totalMinutes += duration;
    });
    
    return (totalMinutes / 60).toFixed(1);
  };

  const getBusiestDay = () => {
    const events = getEnrichedEvents();
    const dayCount = {};
    
    events.forEach(event => {
      dayCount[event.day] = (dayCount[event.day] || 0) + 1;
    });
    
    let maxDay = '';
    let maxCount = 0;
    
    Object.entries(dayCount).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    });
    
    return DAY_NAMES[maxDay] || 'N/A';
  };

  const getUniqueSubjects = () => {
    if (!schedule || !schedule.days) return [];
    
    const subjectIds = new Set();
    schedule.days.forEach(dayData => {
      dayData.lessons?.forEach(lesson => {
        subjectIds.add(lesson.subject_id);
      });
    });
    
    return Array.from(subjectIds).map(id => ({
      name: getSubjectName(id),
      color: getSubjectColor(id)
    }));
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto', 
        padding: '32px', 
        background: '#F9FAFB', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <Loader className="spin" size={48} style={{ marginBottom: '16px' }} />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto', 
        padding: '32px', 
        background: '#F9FAFB', 
        minHeight: '100vh'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
          Расписание
        </h1>
        <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '24px' }}>
          Управление расписанием занятий
        </p>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '80px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
          <h2 style={{ fontSize: '24px', color: '#1F2937', marginBottom: '8px' }}>
            Расписание не создано
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '24px' }}>
            Используйте AI для автоматического создания оптимального расписания
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={20} />
            Создать расписание с AI
          </button>
        </div>
      </div>
    );
  }

  const enrichedEvents = getEnrichedEvents();

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px', background: '#F9FAFB', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
        Расписание
      </h1>
      <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '24px' }}>
        Управление расписанием занятий
      </p>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button style={{
          padding: '8px 12px',
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}>
          <ChevronLeft size={18} />
        </button>

        <span style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
          {new Date(schedule.week_start).toLocaleDateString('ru-RU', { 
            month: 'short', 
            day: 'numeric' 
          })} - {new Date(new Date(schedule.week_start).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </span>

        <button style={{
          padding: '8px 12px',
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}>
          <ChevronRight size={18} />
        </button>

        <button style={{
          padding: '8px 16px',
          background: '#6366F1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500'
        }}>
          Сегодня
        </button>

        <button
          onClick={() => setShowGenerateModal(true)}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
            marginLeft: 'auto'
          }}
        >
          <Sparkles size={18} />
          Пересоздать с AI
        </button>

        <button
          onClick={handleDeleteSchedule}
          style={{
            padding: '8px 16px',
            background: 'white',
            color: '#EF4444',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500
          }}
        >
          <Trash2 size={18} />
          Удалить
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 300px', gap: '0', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        
        {/* Time Column */}
        <div style={{ borderRight: '1px solid #E5E7EB' }}>
          <div style={{ height: '60px', borderBottom: '1px solid #E5E7EB' }}></div>
          {HOURS.map((time) => (
            <div
              key={time}
              style={{
                height: '80px',
                padding: '8px',
                borderBottom: '1px solid #E5E7EB',
                fontSize: '13px',
                color: '#6B7280',
                textAlign: 'right'
              }}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderRight: '1px solid #E5E7EB' }}>
          {DAYS.map((day, idx) => (
            <div key={day} style={{ borderRight: idx < 4 ? '1px solid #E5E7EB' : 'none' }}>
              <div style={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '14px',
                color: '#1F2937',
                borderBottom: '1px solid #E5E7EB'
              }}>
                {DAY_NAMES[day]}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateRows: `repeat(${HOURS.length}, 80px)`,
                position: 'relative'
              }}>
                {HOURS.map((_, hourIdx) => (
                  <div
                    key={hourIdx}
                    style={{
                      borderBottom: hourIdx < HOURS.length - 1 ? '1px solid #E5E7EB' : 'none',
                      background: '#FAFBFC'
                    }}
                  />
                ))}

                {enrichedEvents
                  .filter(e => e.day === day)
                  .map((event, eventIdx) => (
                    <EventCard key={eventIdx} event={event} subjectColor={event.color} />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ padding: '24px', background: '#F9FAFB' }}>
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Предметы</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getUniqueSubjects().map((subject, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: subject.color
                  }}></span>
                  {subject.name}
                </div>
              ))}
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Эта неделя</h3>
            <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.8' }}>
              <p style={{ margin: '8px 0' }}>Всего занятий: <b style={{ color: '#1F2937' }}>{getTotalClasses()}</b></p>
              <p style={{ margin: '8px 0' }}>Часов преподавания: <b style={{ color: '#1F2937' }}>{getTotalHours()}ч</b></p>
              <p style={{ margin: '8px 0' }}>Самый загруженный день: <b style={{ color: '#1F2937' }}>{getBusiestDay()}</b></p>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => !generating && setShowGenerateModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                Генерация расписания с AI
              </h2>
              {!generating && (
                <button 
                  onClick={() => setShowGenerateModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: '#6B7280'
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <div style={{ padding: '24px' }}>
              {teacher && (
                <div style={{
                  background: '#F9FAFB',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                    Параметры преподавателя:
                  </h3>
                  <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.8' }}>
                    <p style={{ margin: '8px 0' }}>Имя: <b style={{ color: '#1F2937' }}>{teacher.name}</b></p>
                    <p style={{ margin: '8px 0' }}>Часов в неделю: <b style={{ color: '#1F2937' }}>{teacher.hours_per_week}</b></p>
                    <p style={{ margin: '8px 0' }}>Длительность урока: <b style={{ color: '#1F2937' }}>{teacher.lesson_duration} мин</b></p>
                    <p style={{ margin: '8px 0' }}>Рабочее время: <b style={{ color: '#1F2937' }}>{teacher.work_start} - {teacher.work_end}</b></p>
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #F0F1FF 0%, #F9F5FF 100%)',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Sparkles size={24} />
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                  AI создаст оптимальное расписание на основе ваших предметов, 
                  предпочтений по времени и нагрузке. Это займет несколько секунд.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generating}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    opacity: generating ? 0.5 : 1
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleGenerateSchedule}
                  disabled={generating}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    opacity: generating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {generating ? (
                    <>
                      <Loader className="spin" size={18} />
                      Генерация расписания...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Сгенерировать
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Schedule;
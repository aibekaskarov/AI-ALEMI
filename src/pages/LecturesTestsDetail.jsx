import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Plus, Sparkles, Edit2, Trash2, ClipboardList, Clock, Loader, ArrowLeft } from 'lucide-react';
import { lecturesAPI, testsAPI, subjectsAPI } from '../services/api';

const LecturesTestsDetail = () => {
    const { id } = useParams();
    const subjectId = id;
  const [activeTab, setActiveTab] = useState('lectures');
  const [subject, setSubject] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  // Forms
  const [lectureForm, setLectureForm] = useState({
    name: '',
    text: '',
    estimated_time: 60,
    subject_id: subjectId
  });

  const [testForm, setTestForm] = useState({
    lecture_id: '',
    questionCount: 5,
    difficulty: 'medium'
  });

  useEffect(() => {
    if (subjectId) {
      loadData();
    }
  }, [subjectId]);

  const loadData = async () => {
    setLoading(true);
    try {
        const [subjectRes, lecturesRes, testsRes] = await Promise.all([
        subjectsAPI.getById(subjectId),
        lecturesAPI.getAll(),
        testsAPI.getAll()
        ]);
        
        setSubject(subjectRes.data);
        
        const subjectLectures = lecturesRes.data.filter(
        l => Number(l.subject_id) === Number(subjectId)
        );
        setLectures(subjectLectures);

        const lectureIds = subjectLectures.map(l => Number(l.id));

        const subjectTests = testsRes.data.filter(
        t => lectureIds.includes(Number(t.lecture_id))
        );

        setTests(subjectTests);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Ошибка при загрузке данных');
    } finally {
        setLoading(false);
    }
  };


  // ===== LECTURES =====
  const handleCreateLecture = () => {
    setLectureForm({
      name: '',
      text: '',
      estimated_time: 60,
      subject_id: subjectId
    });
    setShowLectureModal(true);
  };

  const handleSaveLecture = async () => {
    if (!lectureForm.name.trim()) {
      alert('Введите название лекции');
      return;
    }

    try {
      await lecturesAPI.create(lectureForm);
      await loadData();
      setShowLectureModal(false);
      alert('Лекция успешно создана!');
    } catch (error) {
      console.error('Ошибка сохранения лекции:', error);
      alert('Ошибка при сохранении лекции');
    }
  };

  const handleGenerateLectureWithAI = async () => {
    if (!lectureForm.name.trim()) {
      alert('Введите название лекции для генерации');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await lecturesAPI.generateWithAI(lectureForm.name, subjectId);
      setLectureForm(prev => ({
        ...prev,
        text: response.data.content || ''
      }));
      alert('Контент успешно сгенерирован!');
    } catch (error) {
      console.error('Ошибка генерации лекции:', error);
      alert('Ошибка при генерации лекции с AI');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDeleteLecture = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Удалить эту лекцию?')) return;
    
    try {
      await lecturesAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Ошибка удаления лекции:', error);
      alert('Ошибка при удалении лекции');
    }
  };

  // ===== TESTS =====
  const handleCreateTest = () => {
    if (lectures.length === 0) {
      alert('Сначала создайте хотя бы одну лекцию');
      return;
    }
    
    setTestForm({
      lecture_id: lectures[0].id,
      questionCount: 5,
      difficulty: 'medium'
    });
    setShowTestModal(true);
  };

  const handleGenerateTestWithAI = async () => {
    if (!testForm.lecture_id) {
      alert('Выберите лекцию');
      return;
    }

    setAiGenerating(true);
    try {
      await testsAPI.generateWithAI(testForm.lecture_id, {
        questionCount: testForm.questionCount,
        difficulty: testForm.difficulty,
        types: ['multiple-choice']
      });
      await loadData();
      setShowTestModal(false);
      alert('Тест успешно создан!');
    } catch (error) {
      console.error('Ошибка генерации теста:', error);
      alert('Ошибка при генерации теста с AI');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDeleteTest = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Удалить этот тест?')) return;
    
    try {
      await testsAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Ошибка удаления теста:', error);
      alert('Ошибка при удалении теста');
    }
  };

  const getLectureName = (lectureId) => {
    const lecture = lectures.find(l => l.id === lectureId);
    return lecture ? lecture.name : 'Неизвестная лекция';
  };

  if (loading) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', color: '#6B7280' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px', background: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => window.history.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '16px',
            color: '#6B7280',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={16} />
          Назад к предметам
        </button>
        
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1F2937', margin: '0 0 4px 0' }}>
          {subject?.name}
        </h1>
        <p style={{ fontSize: '15px', color: '#6B7280', margin: 0 }}>
          Управление лекциями и тестами
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        borderBottom: '2px solid #E5E7EB' 
      }}>
        <button
          onClick={() => setActiveTab('lectures')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'lectures' ? '#6366F1' : 'transparent'}`,
            color: activeTab === 'lectures' ? '#6366F1' : '#6B7280',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <FileText size={18} />
          Лекции ({lectures.length})
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'tests' ? '#6366F1' : 'transparent'}`,
            color: activeTab === 'tests' ? '#6366F1' : '#6B7280',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <ClipboardList size={18} />
          Тесты ({tests.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
            {activeTab === 'lectures' ? 'Лекции' : 'Тесты'}
          </h2>
          <button
            onClick={activeTab === 'lectures' ? handleCreateLecture : handleCreateTest}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {activeTab === 'lectures' ? (
              <>
                <Plus size={18} />
                Создать лекцию
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Создать тест с AI
              </>
            )}
          </button>
        </div>

        {/* Lectures List */}
        {activeTab === 'lectures' && (
          lectures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', color: '#6B7280' }}>
              <FileText size={48} style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', color: '#1F2937', margin: '0 0 8px 0' }}>
                Нет лекций
              </h3>
              <p style={{ margin: 0 }}>Создайте первую лекцию для этого предмета</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lectures.map(lecture => (
                <div
                  key={lecture.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'white',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6366F1'
                  }}>
                    <FileText size={24} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: '0 0 6px 0' }}>
                      {lecture.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {lecture.estimated_time} мин
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLecture(lecture.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#EF4444'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tests List */}
        {activeTab === 'tests' && (
          tests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', color: '#6B7280' }}>
              <ClipboardList size={48} style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', color: '#1F2937', margin: '0 0 8px 0' }}>
                Нет тестов
              </h3>
              <p style={{ margin: 0 }}>Создайте первый тест используя AI</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tests.map(test => (
                <div
                  key={test.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'white',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8B5CF6'
                  }}>
                    <ClipboardList size={24} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: '0 0 6px 0' }}>
                      {test.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280' }}>
                      <span>Лекция: {getLectureName(test.lecture_id)}</span>
                      <span>{test.questions?.length || 0} вопросов</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#EF4444'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Lecture Modal */}
      {showLectureModal && (
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
          onClick={() => setShowLectureModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto'
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
                Создать лекцию
              </h2>
              <button 
                onClick={() => setShowLectureModal(false)}
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
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', fontSize: '14px' }}>
                  Название лекции
                </label>
                <input
                  type="text"
                  value={lectureForm.name}
                  onChange={e => setLectureForm({...lectureForm, name: e.target.value})}
                  placeholder="Например: Введение в алгебру"
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', fontSize: '14px' }}>
                  Предполагаемое время (минуты)
                </label>
                <input
                  type="number"
                  value={lectureForm.estimated_time}
                  onChange={e => setLectureForm({...lectureForm, estimated_time: parseInt(e.target.value)})}
                  min="15"
                  max="180"
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

              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={handleGenerateLectureWithAI}
                  disabled={aiGenerating}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: aiGenerating ? 'not-allowed' : 'pointer',
                    opacity: aiGenerating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {aiGenerating ? (
                    <>
                      <Loader className="spin" size={18} />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Сгенерировать контент с AI
                    </>
                  )}
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', fontSize: '14px' }}>
                  Текст лекции
                </label>
                <textarea
                  value={lectureForm.text}
                  onChange={e => setLectureForm({...lectureForm, text: e.target.value})}
                  placeholder="Введите или сгенерируйте текст лекции..."
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowLectureModal(false)}
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
                  onClick={handleSaveLecture}
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
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
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
          onClick={() => setShowTestModal(false)}
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
                Создать тест с AI
              </h2>
              <button 
                onClick={() => setShowTestModal(false)}
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
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', fontSize: '14px' }}>
                  Выберите лекцию
                </label>
                <select
                  value={testForm.lecture_id}
                  onChange={e => setTestForm({...testForm, lecture_id: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  {lectures.map(lecture => (
                    <option key={lecture.id} value={lecture.id}>
                      {lecture.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', fontSize: '14px' }}>
                  Количество вопросов
                </label>
                <input
                  type="number"
                  value={testForm.questionCount}
                  onChange={e => setTestForm({...testForm, questionCount: parseInt(e.target.value)})}
                  min="3"
                  max="20"
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', fontSize: '14px' }}>
                  Сложность
                </label>
                <select
                  value={testForm.difficulty}
                  onChange={e => setTestForm({...testForm, difficulty: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowTestModal(false)}
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
                  onClick={handleGenerateTestWithAI}
                  disabled={aiGenerating}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: aiGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    opacity: aiGenerating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {aiGenerating ? (
                    <>
                      <Loader className="spin" size={18} />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Сгенерировать тест
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

export default LecturesTestsDetail;
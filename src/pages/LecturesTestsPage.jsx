import React, { useState, useEffect } from 'react';
import { FileText, Plus, Sparkles, Edit2, Trash2, ClipboardList, Clock, Loader } from 'lucide-react';
import { lecturesAPI, testsAPI, subjectsAPI } from '../services/api';

const LecturesTestsPage = ({ subjectId }) => {
  const [activeTab, setActiveTab] = useState('lectures');
  const [subject, setSubject] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [lectureForm, setLectureForm] = useState({
    name: '',
    text: '',
    estimated_time: 60,
    subject_id: subjectId
  });

  const [testForm, setTestForm] = useState({
    lecture_id: '',
    questionCount: 5,
    difficulty: 'medium',
    types: ['multiple-choice']
  });

  useEffect(() => {
    loadData();
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
      
      const subjectLectures = lecturesRes.data.filter(l => l.subject_id == subjectId);
      setLectures(subjectLectures);
      
      const lectureIds = subjectLectures.map(l => l.id);
      const subjectTests = testsRes.data.filter(t => lectureIds.includes(t.lecture_id));
      setTests(subjectTests);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleCreateTest = () => {
    if (lectures.length === 0) {
      alert('Сначала создайте хотя бы одну лекцию');
      return;
    }
    
    setTestForm({
      lecture_id: lectures[0].id,
      questionCount: 5,
      difficulty: 'medium',
      types: ['multiple-choice']
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
        types: testForm.types
      });
      await loadData();
      setShowTestModal(false);
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
    }
  };

  const getLectureName = (lectureId) => {
    const lecture = lectures.find(l => l.id === lectureId);
    return lecture ? lecture.name : 'Неизвестная лекция';
  };

  if (loading) {
    return <div className="page-loading">Загрузка...</div>;
  }

  return (
    <div className="lectures-tests-page">
      <div className="page-header">
        <div>
          <h1>{subject?.name}</h1>
          <p className="subtitle">Управление лекциями и тестами</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'lectures' ? 'active' : ''}`}
          onClick={() => setActiveTab('lectures')}
        >
          <FileText size={18} />
          Лекции ({lectures.length})
        </button>
        <button 
          className={`tab ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          <ClipboardList size={18} />
          Тесты ({tests.length})
        </button>
      </div>

      {activeTab === 'lectures' && (
        <div className="content-section">
          <div className="section-header">
            <h2>Лекции</h2>
            <button className="btn-primary" onClick={handleCreateLecture}>
              <Plus size={18} />
              Создать лекцию
            </button>
          </div>

          {lectures.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>Нет лекций</h3>
              <p>Создайте первую лекцию для этого предмета</p>
            </div>
          ) : (
            <div className="items-list">
              {lectures.map(lecture => (
                <div key={lecture.id} className="item-card">
                  <div className="item-icon">
                    <FileText size={24} />
                  </div>
                  <div className="item-content">
                    <h3>{lecture.name}</h3>
                    <div className="item-meta">
                      <span>
                        <Clock size={14} />
                        {lecture.estimated_time} мин
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleDeleteLecture(lecture.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="content-section">
          <div className="section-header">
            <h2>Тесты</h2>
            <button className="btn-primary" onClick={handleCreateTest}>
              <Sparkles size={18} />
              Создать тест с AI
            </button>
          </div>

          {tests.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} />
              <h3>Нет тестов</h3>
              <p>Создайте первый тест используя AI</p>
            </div>
          ) : (
            <div className="items-list">
              {tests.map(test => (
                <div key={test.id} className="item-card">
                  <div className="item-icon">
                    <ClipboardList size={24} />
                  </div>
                  <div className="item-content">
                    <h3>{test.name}</h3>
                    <div className="item-meta">
                      <span>Лекция: {getLectureName(test.lecture_id)}</span>
                      <span>{test.questions?.length || 0} вопросов</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showLectureModal && (
        <div className="modal-overlay" onClick={() => setShowLectureModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Создать лекцию</h2>
              <button className="btn-close" onClick={() => setShowLectureModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Название лекции</label>
                <input
                  type="text"
                  value={lectureForm.name}
                  onChange={e => setLectureForm({...lectureForm, name: e.target.value})}
                  placeholder="Например: Введение в алгебру"
                />
              </div>

              <div className="form-group">
                <label>Предполагаемое время (минуты)</label>
                <input
                  type="number"
                  value={lectureForm.estimated_time}
                  onChange={e => setLectureForm({...lectureForm, estimated_time: parseInt(e.target.value)})}
                  min="15"
                  max="180"
                />
              </div>

              <div className="ai-section">
                <button 
                  className="btn-ai"
                  onClick={handleGenerateLectureWithAI}
                  disabled={aiGenerating}
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

              <div className="form-group">
                <label>Текст лекции</label>
                <textarea
                  value={lectureForm.text}
                  onChange={e => setLectureForm({...lectureForm, text: e.target.value})}
                  placeholder="Введите или сгенерируйте текст лекции..."
                  rows={12}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowLectureModal(false)}>
                  Отмена
                </button>
                <button className="btn-primary" onClick={handleSaveLecture}>
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Создать тест с AI</h2>
              <button className="btn-close" onClick={() => setShowTestModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Выберите лекцию</label>
                <select
                  value={testForm.lecture_id}
                  onChange={e => setTestForm({...testForm, lecture_id: parseInt(e.target.value)})}
                >
                  {lectures.map(lecture => (
                    <option key={lecture.id} value={lecture.id}>
                      {lecture.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Количество вопросов</label>
                <input
                  type="number"
                  value={testForm.questionCount}
                  onChange={e => setTestForm({...testForm, questionCount: parseInt(e.target.value)})}
                  min="3"
                  max="20"
                />
              </div>

              <div className="form-group">
                <label>Сложность</label>
                <select
                  value={testForm.difficulty}
                  onChange={e => setTestForm({...testForm, difficulty: e.target.value})}
                >
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowTestModal(false)}>
                  Отмена
                </button>
                <button 
                  className="btn-ai"
                  onClick={handleGenerateTestWithAI}
                  disabled={aiGenerating}
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

      <style jsx>{`
        .lectures-tests-page {
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
          margin-bottom: 24px;
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

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 2px solid #E5E7EB;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: none;
          border: none;
          color: #6B7280;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #374151;
        }

        .tab.active {
          color: #6366F1;
          border-bottom-color: #6366F1;
        }

        .content-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1F2937;
          margin: 0;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }

        .empty-state {
          text-align: center;
          padding: 64px 20px;
          color: #6B7280;
        }

        .empty-state svg {
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          color: #1F2937;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          margin: 0;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .item-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .item-card:hover {
          background: #F3F4F6;
        }

        .item-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366F1;
        }

        .item-content {
          flex: 1;
        }

        .item-content h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 6px 0;
        }

        .item-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #6B7280;
        }

        .item-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: #6B7280;
        }

        .btn-icon:hover {
          background: #FEE;
          border-color: #F44;
          color: #F44;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #E5E7EB;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .btn-close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          font-size: 28px;
          color: #6B7280;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #F3F4F6;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #6366F1;
        }

        .form-group textarea {
          resize: vertical;
        }

        .ai-section {
          margin-bottom: 20px;
        }

        .btn-ai {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-ai:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-ai:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #F9FAFB;
        }
      `}</style>
    </div>
  );
};

export default LecturesTestsPage;
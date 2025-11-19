const axios = require('axios');
const { HF_API_KEY } = require('./config.js');

const MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";

// ===== Универсальная функция для Chat Completions =====
async function chatCompletion(messages, max_tokens = 1000, temperature = 0.7) {
  try {
    const res = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model: MODEL,
        messages,
        max_tokens,
        temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data.choices?.[0]?.message?.content || '';
  } catch (e) {
    console.error('Ошибка запроса к HF Chat API:', e.response?.data || e);
    return '';
  }
}

// ===== Генерация расписания =====
async function generateScheduleWithAI(teacher, db) {
  const schedulePrompt = `
Преподаватель:
- Предметы: ${teacher.selected_subjects.map(id => {
    const s = db.subjects.find(sub => sub.id === id);
    return s ? s.name : "Unknown";
  }).join(', ')}
- Часы в неделю: ${teacher.hours_per_week}
- Длительность урока: ${teacher.lesson_duration} минут
- Минимальный перерыв: ${teacher.min_break} минут
- Рабочее время: ${teacher.work_start} - ${teacher.work_end}

Составь расписание на неделю (Monday-Friday) в формате JSON:
{
  "days": [
    {
      "day": "Monday",
      "lessons": [
        {"subject_id": 1, "lecture_id": 1, "start_time": "09:00", "end_time": "10:30"}
      ]
    }
  ]
}
`;

  const message = [
    { role: 'system', content: 'Ты — помощник по созданию учебного расписания.' },
    { role: 'user', content: schedulePrompt }
  ];

  const responseText = await chatCompletion(message, 1000);

  let scheduleJSON;
  try {
    scheduleJSON = JSON.parse(responseText || '{}');
  } catch (e) {
    console.error('Ошибка парсинга AI ответа:', e);
    scheduleJSON = { days: [] };
  }

  return {
    id: Date.now(),
    week_start: new Date().toISOString().split('T')[0],
    teacher_id: teacher.id,
    ...scheduleJSON
  };
}

// ===== Генерация лекции =====
async function generateLectureWithAI(title, subject) {
  const lecturePrompt = `
Создай лекцию по предмету "${subject.name}" с названием "${title}". 
Верни текст лекции в формате Markdown.
`;

  const message = [
    { role: 'system', content: 'Ты — ассистент по созданию лекций.' },
    { role: 'user', content: lecturePrompt }
  ];

  const responseText = await chatCompletion(message, 2000);

  return responseText || `Лекция по "${title}"`;
}

// ===== Генерация теста =====
async function generateTestWithAI(lecture, { questionCount = 5, difficulty = 'medium', types = ['multiple-choice'] } = {}) {
  const testPrompt = `
Создай тест по лекции "${lecture.name}" с ${questionCount} вопросами.
Сложность: ${difficulty}.
Типы вопросов: ${types.join(', ')}.
Верни JSON вида:
{
  "questions": [
    {"question": "текст", "type": "multiple-choice", "options": ["a", "b", "c"], "answer": "a"}
  ]
}
`;

  const message = [
    { role: 'system', content: 'Ты — ассистент по созданию тестов.' },
    { role: 'user', content: testPrompt }
  ];

  const responseText = await chatCompletion(message, 1500);

  try {
    const data = JSON.parse(responseText || '{}');
    return data.questions || [];
  } catch (e) {
    console.error('Ошибка парсинга теста AI ответа:', e);
    return [];
  }
}

module.exports = { generateScheduleWithAI, generateLectureWithAI, generateTestWithAI };
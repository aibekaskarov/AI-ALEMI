const axios = require('axios');
const { HF_API_KEY } = require('./config.js');

const MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";

function extractJSON(text) {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1) return null;
  return text.substring(first, last + 1);
}

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
  const subjectsList = teacher.selected_subjects.map(id => {
    const s = db.subjects.find(sub => sub.id === id);
    return s ? s.name : "Unknown";
  }).join(', ');

  const schedulePrompt = `
Ты — помощник по созданию учебного расписания. 
Составь расписание на неделю (Monday-Friday) для преподавателя в формате чистого JSON без лишнего текста или пояснений. 
Используй следующую структуру:

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

Информация о преподавателе:
- Предметы: ${subjectsList}
- Часы в неделю: ${teacher.hours_per_week}
- Длительность урока: ${teacher.lesson_duration} минут
- Минимальный перерыв: ${teacher.min_break} минут
- Рабочее время: ${teacher.work_start} - ${teacher.work_end}
`;

  const message = [
    { role: 'system', content: 'Ты — помощник по созданию учебного расписания.' },
    { role: 'user', content: schedulePrompt }
  ];

  const responseText = await chatCompletion(message, 1000);

  let scheduleJSON;
  try {
    // Попытка извлечь JSON из текста AI
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    scheduleJSON = jsonMatch ? JSON.parse(jsonMatch[0]) : { days: [] };
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
async function generateTestWithAI(
  lecture,
  { questionCount = 5, difficulty = 'medium', types = ['multiple-choice'] } = {}
) {
  const testPrompt = `
Ты — генератор тестов. 
Используй строго содержание лекции ниже для генерации вопросов.

ЛЕКЦИЯ:
"""
${lecture.text}
"""

Верни СТРОГО JSON.  
Без текста, без описаний, без пояснений, без Markdown-блоков.

СТРОГИЙ ФОРМАТ JSON:
{
  "questions": [
    {
      "question": "string",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "answer": 0
    }
  ]
}

Требования:
- Количество вопросов: ${questionCount}
- Сложность: ${difficulty}
- Типы вопросов: ${types.join(', ')}
- Все вопросы должны быть основаны ТОЛЬКО на содержании лекции.
- Ответ ВСЕГДА должен быть индексом (числом), а не текстом.
`;

  const message = [
    { role: 'system', content: 'Ты — строгий JSON-генератор тестов. Никакого текста вне JSON.' },
    { role: 'user', content: testPrompt }
  ];

  const responseText = await chatCompletion(message, 2500);

  // --- достаём JSON ---
  const jsonText = extractJSON(responseText);

  if (!jsonText) {
    console.error("AI не вернул JSON:", responseText);
    return [];
  }

  try {
    const parsed = JSON.parse(jsonText);
    return parsed.questions || [];
  } catch (e) {
    console.error("Ошибка парсинга теста:", e, "\nJSON:", jsonText);
    return [];
  }
}

module.exports = { generateScheduleWithAI, generateLectureWithAI, generateTestWithAI };
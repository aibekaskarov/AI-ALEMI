const axios = require('axios');
const { HF_API_KEY } = require('./config.js');

// ===== Генерация расписания =====
async function generateScheduleWithAI(teacher, db) {
    const prompt = `
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

    try {
        const res = await axios.post(
            'https://api-inference.huggingface.co/models/Qwen/Qwen3-Omni-30B-A3B-Instruct',
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        let scheduleJSON;
        try {
            scheduleJSON = JSON.parse(res.data.generated_text || res.data[0]?.generated_text || '{}');
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
    } catch (e) {
        console.error('Ошибка запроса к HF API:', e);
        return { id: Date.now(), week_start: new Date().toISOString().split('T')[0], teacher_id: teacher.id, days: [] };
    }
}

// ===== Генерация лекции =====
async function generateLectureWithAI(title, subject) {
    const prompt = `
Создай лекцию по предмету "${subject.name}" с названием "${title}". 
Верни текст лекции в формате Markdown.
`;

    try {
        const res = await axios.post(
            'https://api-inference.huggingface.co/models/Qwen/Qwen3-Omni-30B-A3B-Instruct',
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        return res.data.generated_text || res.data[0]?.generated_text || `Лекция по "${title}"`;
    } catch (e) {
        console.error('Ошибка генерации лекции:', e);
        return `Лекция по "${title}"`;
    }
}

// ===== Генерация теста =====
async function generateTestWithAI(lecture, { questionCount = 5, difficulty = 'medium', types = ['multiple-choice'] } = {}) {
    const prompt = `
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

    try {
        const res = await axios.post(
            'https://api-inference.huggingface.co/models/Qwen/Qwen3-Omni-30B-A3B-Instruct',
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        try {
            const data = JSON.parse(res.data.generated_text || res.data[0]?.generated_text || '{}');
            return data.questions || [];
        } catch {
            return [];
        }
    } catch (e) {
        console.error('Ошибка генерации теста:', e);
        return [];
    }
}

module.exports = { generateScheduleWithAI, generateLectureWithAI, generateTestWithAI };
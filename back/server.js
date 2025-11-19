const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { PORT } = require('./config.js');
const { generateScheduleWithAI, generateLectureWithAI, generateTestWithAI } = require('./ai.js');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const dbPath = path.join(__dirname, 'db.json');

async function readDB() {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
}

async function writeDB(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

// ===== CRUD =====

// ---------- SUBJECTS ----------
app.get('/subjects', async (req, res) => {
    const db = await readDB();
    res.json(db.subjects);
});

app.get('/subjects/:id', async (req, res) => {
    const db = await readDB();
    const subject = db.subjects.find(s => s.id == req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
});

app.post('/subjects', async (req, res) => {
    const db = await readDB();
    const newSubject = { id: Date.now(), ...req.body };
    db.subjects.push(newSubject);
    await writeDB(db);
    res.json(newSubject);
});

app.put('/subjects/:id', async (req, res) => {
    const db = await readDB();
    const idx = db.subjects.findIndex(s => s.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Subject not found' });
    db.subjects[idx] = { ...db.subjects[idx], ...req.body };
    await writeDB(db);
    res.json(db.subjects[idx]);
});

app.delete('/subjects/:id', async (req, res) => {
    const db = await readDB();
    db.subjects = db.subjects.filter(s => s.id != req.params.id);
    await writeDB(db);
    res.json({ message: 'Subject deleted' });
});

// ---------- LECTURES ----------
app.get('/lectures', async (req, res) => {
    const db = await readDB();
    res.json(db.lectures);
});

app.get('/lectures/:id', async (req, res) => {
    const db = await readDB();
    const lecture = db.lectures.find(l => l.id == req.params.id);
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' });
    res.json(lecture);
});

app.post('/lectures', async (req, res) => {
    const db = await readDB();
    const newLecture = { id: Date.now(), ...req.body };
    db.lectures.push(newLecture);
    await writeDB(db);
    res.json(newLecture);
});

app.put('/lectures/:id', async (req, res) => {
    const db = await readDB();
    const idx = db.lectures.findIndex(l => l.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Lecture not found' });
    db.lectures[idx] = { ...db.lectures[idx], ...req.body };
    await writeDB(db);
    res.json(db.lectures[idx]);
});

app.delete('/lectures/:id', async (req, res) => {
    const db = await readDB();
    db.lectures = db.lectures.filter(l => l.id != req.params.id);
    await writeDB(db);
    res.json({ message: 'Lecture deleted' });
});

// ---------- TESTS ----------
app.get('/tests', async (req, res) => {
    const db = await readDB();
    res.json(db.tests);
});

app.get('/tests/:id', async (req, res) => {
    const db = await readDB();
    const test = db.tests.find(t => t.id == req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
});

app.post('/tests', async (req, res) => {
    const db = await readDB();
    const newTest = { id: Date.now(), ...req.body };
    db.tests.push(newTest);
    await writeDB(db);
    res.json(newTest);
});

app.put('/tests/:id', async (req, res) => {
    const db = await readDB();
    const idx = db.tests.findIndex(t => t.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Test not found' });
    db.tests[idx] = { ...db.tests[idx], ...req.body };
    await writeDB(db);
    res.json(db.tests[idx]);
});

app.delete('/tests/:id', async (req, res) => {
    const db = await readDB();
    db.tests = db.tests.filter(t => t.id != req.params.id);
    await writeDB(db);
    res.json({ message: 'Test deleted' });
});

// ---------- TEACHERS ----------
app.get('/teachers', async (req, res) => {
    const db = await readDB();
    res.json(db.teachers);
});

app.get('/teachers/:id', async (req, res) => {
    const db = await readDB();
    const teacher = db.teachers.find(t => t.id == req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
});

app.post('/teachers', async (req, res) => {
    const db = await readDB();
    const newTeacher = { id: Date.now(), ...req.body };
    db.teachers.push(newTeacher);
    await writeDB(db);
    res.json(newTeacher);
});

app.put('/teachers/:id', async (req, res) => {
    const db = await readDB();
    const idx = db.teachers.findIndex(t => t.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Teacher not found' });
    db.teachers[idx] = { ...db.teachers[idx], ...req.body };
    await writeDB(db);
    res.json(db.teachers[idx]);
});

app.delete('/teachers/:id', async (req, res) => {
    const db = await readDB();
    db.teachers = db.teachers.filter(t => t.id != req.params.id);
    await writeDB(db);
    res.json({ message: 'Teacher deleted' });
});

// ---------- SCHEDULES ----------
app.get('/schedules', async (req, res) => {
    const db = await readDB();
    res.json(db.schedules);
});

app.get('/schedules/:id', async (req, res) => {
    const db = await readDB();
    const schedule = db.schedules.find(s => s.id == req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
});

app.post('/schedules/generate/:teacherId', async (req, res) => {
    const db = await readDB();
    const teacher = db.teachers.find(t => t.id == req.params.teacherId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    try {
        const schedule = await generateScheduleWithAI(teacher, db);
        db.schedules.push(schedule);
        await writeDB(db);
        res.json(schedule);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка генерации расписания' });
    }
});

app.delete('/schedules/:id', async (req, res) => {
    const db = await readDB();
    db.schedules = db.schedules.filter(s => s.id != req.params.id);
    await writeDB(db);
    res.json({ message: 'Schedule deleted' });
});


// Генерация лекции по названию и предмету
app.post('/ai/lectures', async (req, res) => {
    const { title, subjectId } = req.body;
    if (!title || !subjectId) return res.status(400).json({ error: 'Title and subjectId required' });

    try {
        const db = await readDB();
        const subject = db.subjects.find(s => s.id == subjectId);
        if (!subject) return res.status(404).json({ error: 'Subject not found' });

        // Предположим, что generateLectureWithAI возвращает объект лекции { name, content, ... }
        const newLectureContent = await generateLectureWithAI(title, subject);

        const newLecture = {
            id: Date.now(),
            name: title,
            content: newLectureContent,
            subjectId: subject.id
        };

        db.lectures.push(newLecture);
        await writeDB(db);

        res.json(newLecture);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка генерации лекции' });
    }
});

// Генерация теста по лекции
app.post('/ai/tests', async (req, res) => {
    const { lectureId, questionCount = 5, difficulty = 'medium', types = ['multiple-choice'] } = req.body;
    if (!lectureId) return res.status(400).json({ error: 'lectureId required' });

    try {
        const db = await readDB();
        const lecture = db.lectures.find(l => l.id == lectureId);
        if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

        // Предположим, что generateTestWithAI возвращает массив вопросов
        const questions = await generateTestWithAI(lecture, { questionCount, difficulty, types });

        const newTest = {
            id: Date.now(),
            lectureId: lecture.id,
            name: `Тест по лекции "${lecture.name}"`,
            questions
        };

        db.tests.push(newTest);
        await writeDB(db);

        res.json(newTest);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка генерации теста' });
    }
});

// ===== SERVER START =====
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

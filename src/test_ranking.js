async function test() {
  const BASE_URL = 'http://localhost:3000/api';
  try {
    const studentsRes = await fetch(`${BASE_URL}/users?role_id=3`);
    const students = await studentsRes.json();
    
    const coursesRes = await fetch(`${BASE_URL}/t_student_course?course_id=1`);
    const courses = await coursesRes.json();
    
    const badgesRes = await fetch(`${BASE_URL}/badges`);
    const badges = await badgesRes.json();

    const wonderingScoresRes = await fetch(`${BASE_URL}/t_wondering_score`);
    const wonderingScores = await wonderingScoresRes.json();

    const codeAnswersRes = await fetch(`${BASE_URL}/t_code_answer`);
    const codeAnswers = await codeAnswersRes.json();

    const essayAnswersRes = await fetch(`${BASE_URL}/t_essay_answer`);
    const essayAnswers = await essayAnswersRes.json();

    const codeQuestionsRes = await fetch(`${BASE_URL}/code_question`);
    const codeQuestions = await codeQuestionsRes.json();

    const essayQuestionsRes = await fetch(`${BASE_URL}/essay_question`);
    const essayQuestions = await essayQuestionsRes.json();

    const lessonsRes = await fetch(`${BASE_URL}/lessons?course_id=1`);
    const lessons = await lessonsRes.json();
    const lessonIds = lessons.map(l => Number(l.id));

    const subLessonsArrays = await Promise.all(
      lessonIds.map(lId => fetch(`${BASE_URL}/sublessons?lesson_id=${lId}`).then(r => r.json()))
    );
    const subLessons = subLessonsArrays.flat();
    const subLessonIds = subLessons.map(sl => Number(sl.id));

    const courseCodeQuestions = codeQuestions.filter(cq => subLessonIds.includes(Number(cq.sub_lesson_id)));
    const courseCodeQuestionIds = courseCodeQuestions.map(cq => Number(cq.id));

    const courseEssayQuestions = essayQuestions.filter(eq => {
      if (eq.sub_lesson_id) {
        return subLessonIds.includes(Number(eq.sub_lesson_id));
      }
      return courseCodeQuestionIds.includes(Number(eq.code_question_id));
    });
    const courseEssayQuestionIds = courseEssayQuestions.map(eq => Number(eq.id));

    const studentsCourses = students.map(student => {
      const matchedCourse = courses.find(
        course => course.student_id == student.id
      );
      let badge = matchedCourse?.badge_id ? badges.find(b => b.id == matchedCourse.badge_id) : null;
      
      const total = matchedCourse?.total_score || 0;

      if (!badge && badges && badges.length > 0) {
        badge = badges.find(b => total >= b.minScore && total <= b.maxScore) || badges[0];
      }

      const stdWondering = wonderingScores.filter(
        w => (w.userId == student.id || w.user_id == student.id) && subLessonIds.includes(Number(w.sub_lesson_id))
      );
      const readingScore = stdWondering.reduce((acc, curr) => acc + (curr.score || curr.wondering_score || 0), 0);

      const stdCodeAnswers = codeAnswers.filter(
        c => (c.userId == student.id || c.user_id == student.id) && courseCodeQuestionIds.includes(Number(c.code_question_id))
      );
      const codingScore = stdCodeAnswers.reduce((acc, curr) => acc + (curr.exploringScore || curr.exploring_score || 0), 0);

      const stdEssayAnswers = essayAnswers.filter(
        e => (e.userId == student.id || e.user_id == student.id) && courseEssayQuestionIds.includes(Number(e.essay_question_id))
      );
      let essayScore = 0;
      stdEssayAnswers.forEach(ea => {
         essayScore += (ea.keruntutan || 0) + (ea.kebenaran || 0) + (ea.konteks_penjelasan || ea.konteksPenjelasan || 0);
      });

      return {
        id: student.id,
        name: student.name,
        courseId: matchedCourse?.course_id || null,
        totalScore: total,
        badgeName: badge?.name || "No Badge",
        readingScore,
        codingScore,
        essayScore
      };
    });

    const filteredStudents = studentsCourses.filter(
      student => student.courseId !== null
    );

    console.log('--- Students Ranking Output ---');
    console.log(filteredStudents);
  } catch (e) {
    console.error(e);
  }
}

test();

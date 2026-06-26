const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const studentCourses = await prisma.studentCourse.findMany();
  console.log(`Found ${studentCourses.length} student course enrollments.`);

  for (const sc of studentCourses) {
    const studentId = sc.studentId;
    const courseId = sc.courseId;

    // Get all lessons & sublessons for this course
    const lessons = await prisma.lesson.findMany({ where: { courseId } });
    const lessonIds = lessons.map(l => l.id);

    const subLessons = await prisma.subLesson.findMany({
      where: { lessonId: { in: lessonIds } }
    });
    const subLessonIds = subLessons.map(sl => sl.id);

    // 1. Reading Score: completed progress * 10
    const completedProgress = await prisma.studentProgress.findMany({
      where: { userId: studentId, courseId, status: 'completed' }
    });
    const readScore = completedProgress.length * 10;

    // 2. Coding Score: sum of exploringScore for this student on code questions of this course
    const codeQuestions = await prisma.codeQuestion.findMany({
      where: { subLessonId: { in: subLessonIds } }
    });
    const codeQuestionIds = codeQuestions.map(cq => cq.id);

    const codeAnswers = await prisma.codeAnswer.findMany({
      where: { userId: studentId, codeQuestionId: { in: codeQuestionIds } }
    });
    const codingScore = codeAnswers.reduce((acc, curr) => acc + (curr.exploringScore || 0), 0);

    // 3. Essay Score: sum of essay answers scores
    const essayQuestions = await prisma.essayQuestion.findMany({
      where: {
        OR: [
          { subLessonId: { in: subLessonIds } },
          { codeQuestionId: { in: codeQuestionIds } }
        ]
      }
    });
    const essayQuestionIds = essayQuestions.map(eq => eq.id);

    const essayAnswers = await prisma.essayAnswer.findMany({
      where: { userId: studentId, essayQuestionId: { in: essayQuestionIds } }
    });
    const essayScore = essayAnswers.reduce((acc, curr) => {
      return acc + (curr.konteksPenjelasan || 0) + (curr.keruntutan || 0) + (curr.kebenaran || 0);
    }, 0);

    const totalScore = readScore + codingScore + essayScore;

    console.log(`Student ID ${studentId}, Course ID ${courseId}: Reading=${readScore}, Coding=${codingScore}, Essay=${essayScore} => Total=${totalScore} (old total=${sc.totalScore})`);

    // Update StudentCourse
    await prisma.studentCourse.update({
      where: { id: sc.id },
      data: { totalScore }
    });
  }

  console.log('Database total scores synced successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());

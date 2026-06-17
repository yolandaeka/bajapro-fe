import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return jsonResponse({}, 200);
}

// Map helpers to convert Prisma models to legacy snake_case format expected by frontend
function mapCourse(c: any) {
  return {
    id: c.id,
    course_name: c.courseName,
    description: c.description,
    img_thumbnail: c.imgThumbnail,
    published: c.published,
    isactive: c.isActive,
  };
}

function mapLesson(l: any) {
  return {
    id: l.id,
    course_id: l.courseId,
    level_id: l.levelId,
    title: l.title,
    description: l.description,
    position: l.position,
    img_thumbnail: l.imgThumbnail,
    published: l.published,
    isactive: l.isActive,
  };
}

function mapSubLesson(sl: any) {
  return {
    id: sl.id,
    lesson_id: sl.lessonId,
    title: sl.title,
    order_position: sl.orderPosition,
    isactive: sl.isActive,
  };
}

function mapStudentCourse(sc: any) {
  return {
    id: sc.id,
    student_id: sc.studentId,
    course_id: sc.courseId,
    badge_id: sc.badgeId,
    total_score: sc.totalScore,
    isactive: sc.isActive,
  };
}

function mapStudentProgress(sp: any) {
  return {
    id: sp.id,
    user_id: sp.userId,
    course_id: sp.courseId,
    sub_lesson_id: sp.subLessonId,
    status: sp.status,
  };
}

function mapWonderingScore(ws: any) {
  return {
    id: ws.id,
    user_id: ws.userId,
    course_id: ws.courseId,
    sub_lesson_id: ws.subLessonId,
    wondering_score: ws.wonderingScore,
  };
}

function mapCodeAnswer(ca: any) {
  return {
    id: ca.id,
    user_id: ca.userId,
    code_question_id: ca.codeQuestionId,
    source_code: ca.sourceCode,
    exploring_score: ca.exploringScore,
  };
}

function mapEssayAnswer(ea: any) {
  return {
    id: ea.id,
    user_id: ea.userId,
    essay_question_id: ea.essayQuestionId,
    essay_answer: ea.essayAnswer,
    konteks_penjelasan: ea.konteksPenjelasan,
    keruntutan: ea.keruntutan,
    kebenaran: ea.kebenaran,
    is_approved_by_teacher: ea.isApprovedByTeacher,
    feedback_note: ea.feedbackNote,
  };
}

function mapCodeQuestion(cq: any) {
  return {
    id: cq.id,
    sub_lesson_id: cq.subLessonId,
    question_text: cq.questionText,
    input_format: cq.inputFormat,
    output_format: cq.outputFormat,
    sample_input: cq.sampleInput,
    sample_output: cq.sampleOutput,
    test_cases: cq.testCases,
  };
}

function mapEssayQuestion(eq: any) {
  return {
    id: eq.id,
    sub_lesson_id: eq.subLessonId,
    question_text: eq.questionText,
    sample_answer: eq.sampleAnswer,
    keywords: eq.keywords,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const route = path.join('/');
  const searchParams = req.nextUrl.searchParams;

  try {
    // 1. Courses
    if (route === 'courses') {
      const courses = await prisma.course.findMany({ orderBy: { id: 'asc' } });
      return jsonResponse(courses.map(mapCourse));
    }

    // 2. Lessons
    if (route === 'lessons') {
      const courseId = searchParams.get('course_id');
      const whereClause: any = {};
      if (courseId) {
        whereClause.courseId = Number(courseId);
      }
      const lessons = await prisma.lesson.findMany({
        where: whereClause,
        orderBy: { position: 'asc' },
      });
      return jsonResponse(lessons.map(mapLesson));
    }

    // 3. Sublessons
    if (route === 'sublessons') {
      const lessonId = searchParams.get('lesson_id');
      const whereClause: any = {};
      if (lessonId) {
        whereClause.lessonId = Number(lessonId);
      }
      const sublessons = await prisma.subLesson.findMany({
        where: whereClause,
        orderBy: { orderPosition: 'asc' },
      });
      return jsonResponse(sublessons.map(mapSubLesson));
    }

    // 4. t_student_course
    if (route === 't_student_course') {
      const courseId = searchParams.get('course_id');
      const studentId = searchParams.get('student_id');
      const whereClause: any = {};
      if (courseId) {
        whereClause.courseId = Number(courseId);
      }
      if (studentId) {
        whereClause.studentId = Number(studentId);
      }
      const items = await prisma.studentCourse.findMany({ where: whereClause });
      return jsonResponse(items.map(mapStudentCourse));
    }

    // 5. t_student_progress
    if (route === 't_student_progress') {
      const userId = searchParams.get('user_id');
      const courseId = searchParams.get('course_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      if (courseId) {
        whereClause.courseId = Number(courseId);
      }
      const items = await prisma.studentProgress.findMany({ where: whereClause });
      return jsonResponse(items.map(mapStudentProgress));
    }

    // 6. t_wondering_score
    if (route === 't_wondering_score') {
      const userId = searchParams.get('user_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      const items = await prisma.wonderingScore.findMany({ where: whereClause });
      return jsonResponse(items.map(mapWonderingScore));
    }

    // 7. t_code_answer
    if (route === 't_code_answer') {
      const userId = searchParams.get('user_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      const items = await prisma.codeAnswer.findMany({ where: whereClause });
      return jsonResponse(items.map(mapCodeAnswer));
    }

    // 8. t_essay_answer
    if (route === 't_essay_answer') {
      const userId = searchParams.get('user_id');
      const essayQuestionId = searchParams.get('essay_question_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      if (essayQuestionId) {
        whereClause.essayQuestionId = Number(essayQuestionId);
      }
      const items = await prisma.essayAnswer.findMany({ where: whereClause });
      return jsonResponse(items.map(mapEssayAnswer));
    }

    // 9. code_question
    if (route === 'code_question') {
      const items = await prisma.codeQuestion.findMany();
      return jsonResponse(items.map(mapCodeQuestion));
    }

    // 10. essay_question
    if (route === 'essay_question') {
      const items = await prisma.essayQuestion.findMany();
      return jsonResponse(items.map(mapEssayQuestion));
    }

    return jsonResponse({ error: `Route /api/${route} not found` }, 404);
  } catch (error: any) {
    console.error(`Error in GET /api/${route}:`, error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

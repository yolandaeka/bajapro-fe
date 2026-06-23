import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, code, studentId, codeQuestionId } = body;

    const formData = new URLSearchParams();
    formData.append('user', user || 'student');
    formData.append('code', code || '');

    const res = await fetch('http://labai.polinema.ac.id:90/online-compiler/compiler/run', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();
    
    // Save to CodeHistoryLog
    if (studentId && codeQuestionId) {
      let isError = false;
      let logs = "";
      if (data.error) {
        isError = true;
        logs = `Server Error: ${data.error}`;
      } else {
        const output = data.output || {};
        if (output.java && output.java.includes("failed")) isError = true;
        else if (output.test_output && output.test_output.includes("FAILED")) isError = true;
        
        logs = `[Test Output]\n${output.test_output || ''}`;
      }

      try {
        await prisma.codeHistoryLog.create({
          data: {
            userId: Number(studentId),
            codeQuestionId: Number(codeQuestionId),
            timeCount: data.output?.point || 0, // Store points here or actual time? Usually timeCount implies something else, but we can store points or 0
            message: logs.substring(0, 500),
            isError: isError,
            isActive: true,
          }
        });
      } catch (dbError) {
        console.error("Failed to save history log:", dbError);
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Compiler run error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

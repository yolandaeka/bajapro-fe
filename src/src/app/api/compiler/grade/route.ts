import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { essays } = body; 
    // essays diharapkan array of object: { question: string, answer: string }

    const formData = new URLSearchParams();
    
    // Berdasarkan error Django, API mengharapkan:
    // esay_question, esay_answer, esay_question2, esay_answer2, dst.
    if (essays && Array.isArray(essays)) {
      essays.forEach((essay, index) => {
        const suffix = index === 0 ? '' : (index + 1).toString();
        formData.append(`esay_question${suffix}`, essay.question || '');
        formData.append(`esay_answer${suffix}`, essay.answer || '');
      });
    }

    const res = await fetch('http://labai.polinema.ac.id:90/online-compiler/compiler/generate/grade', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch(e) {
      // Jika error HTML dari Django
      console.error('Grade HTML response:', text.substring(0, 500));
      return NextResponse.json({ error: 'Format response dari Django salah', raw: text }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Compiler grade error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ganti URL ini dengan URL asli Django compiler Anda
    // Disarankan untuk menaruhnya di .env sebagai COMPILER_API_URL
    const compilerUrl = 'http://labai.polinema.ac.id:90';

    const response = await fetch(compilerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to compile', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Compiler proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error while connecting to compiler' },
      { status: 500 }
    );
  }
}

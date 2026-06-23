const testGrade = async () => {
  const formData = new URLSearchParams();
  formData.append('esay_question', 'Apa fungsi dari public static void main?');
  formData.append('esay_answer', 'Sebagai titik awal eksekusi program java');
  formData.append('esay_answer2', 'Sebagai entry point program java');
  formData.append('esay_answer3', 'Untuk menjalankan program pertama kali');
  formData.append('esay_answer4', 'Method utama di java');
  formData.append('user_answer', 'Ini adalah method utama untuk menjalankan program java');
  
  try {
    const res = await fetch('http://labai.polinema.ac.id:90/online-compiler/compiler/generate/grade', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log('GRADE status:', res.status);
    console.log('GRADE response:', await res.text());
  } catch (e) { console.error(e); }
};
testGrade();

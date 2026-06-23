const testGrade = async () => {
  const formData = new URLSearchParams();
  formData.append('esay_answer', 'Programmer uses print to output text');
  formData.append('esay_question', 'How to output text in python?');
  
  try {
    const res = await fetch('http://labai.polinema.ac.id:90/online-compiler/compiler/generate/grade', {
      method: 'POST',
      body: formData
    });
    console.log('GRADE status:', res.status);
    console.log('GRADE response:', await res.text());
  } catch (e) { console.error(e); }
};
testGrade();

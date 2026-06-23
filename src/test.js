const testRun = async () => {
  const formData = new URLSearchParams();
  formData.append('user', 'test_user');
  formData.append('code', 'public class Main { public static void main(String[] args) { System.out.println("Hello"); } }');
  
  try {
    const res = await fetch('http://labai.polinema.ac.id:90/online-compiler/compiler/run', {
      method: 'POST',
      body: formData
    });
    console.log('RUN status:', res.status);
    console.log('RUN response:', await res.text());
  } catch (e) { console.error(e); }
};
testRun();

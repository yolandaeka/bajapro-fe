async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/student/dashboard?student_id=17');
    const data = await res.json();
    console.log('--- Student Dashboard Response (top5Leaderboard) ---');
    console.log(data.top5Leaderboard);
  } catch (e) {
    console.error(e);
  }
}

test();

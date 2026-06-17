# BAJAPRO — Design Document (Pelajar Role)
> Gunakan file ini sebagai konteks di awal setiap sesi ngoding.
> Total frame role Pelajar: 14 frame

---

## 1. Design Tokens

### Warna
```
Primary Purple   : #5B21B6 / #7C3AED  (sidebar active, button utama, header banner)
Primary Yellow   : #F59E0B / #FBBF24  (logo "PRO", badge, aksen)
Text Primary     : #1F2937            (heading)
Text Secondary   : #6B7280            (body, label)
Text Muted       : #9CA3AF            (placeholder, info)
Background Page  : #F3F4F6            (abu terang, background utama)
Background Card  : #FFFFFF            (card, panel)
Sidebar BG       : #FFFFFF            (sidebar putih, border kanan)
Sidebar Active   : #EDE9FE            (item aktif, teks #5B21B6)
Success Green    : #10B981            (badge "Selesai", checkmark)
Warning Yellow   : #FBBF24            (badge "Sedang Aktif", pending)
Danger Red       : #EF4444            (logout, error)
Score Card Teal  : #A7F3D0 / #D1FAE5  (card Reading Score)
Score Card Purple: #EDE9FE            (card Coding Score)
Score Card Yellow: #FEF3C7            (card Essay Score)
Score Card Gold  : #F59E0B            (card Total Score, bold)
Progress Bar     : #7C3AED            (fill), #E5E7EB (track)
Code Block BG    : #1E1E1E            (dark, font monospace putih)
Gradient Cover   : orange → pink → purple (gambar thumbnail course)
Gradient Progress: #F97316 → #EC4899  (card "Your Progress" di sidebar materi)
```

### Typography
```
Font Family  : Inter (sans-serif)
Logo         : "BAJA" bold hitam + "PRO" bold kuning #F59E0B
Heading H1   : 28–32px, font-weight 700, #1F2937
Heading H2   : 20–24px, font-weight 700, #1F2937
Heading H3   : 16–18px, font-weight 600
Body         : 14–15px, font-weight 400, #4B5563
Label/Caption: 12px, font-weight 500, #6B7280
Code         : font-family monospace, 13px, background #1E1E1E
```

### Spacing & Radius
```
Border Radius Card    : 12–16px
Border Radius Button  : 8–12px (pill untuk beberapa button)
Border Radius Input   : 8px
Border Radius Badge   : 9999px (pill)
Padding Card          : 20–24px
Gap antar card        : 16–20px
Sidebar width         : 240px (desktop)
```

---

## 2. Layout Global

### Pola layout halaman dalam (authenticated)
```
┌─────────────────────────────────────────────────────┐
│  TOPBAR: Logo kiri | Page Title tengah | Avatar kanan│
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │           MAIN CONTENT                  │
│ 240px    │           flex-1                        │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Topbar
- Kiri: Logo BAJAPRO + hamburger icon (≡)
- Tengah: Page title (teks hitam, font-weight 600)
- Kanan: Avatar circle kuning + nama user + chevron dropdown
- Background: putih, border-bottom tipis

### Sidebar
- Background: putih
- Menu items: icon + label, padding 12px 16px
- Active state: background #EDE9FE, teks & icon #5B21B6, font-weight 600
- Item: Dashboard (home icon), Course (book icon), Leaderboard (chart icon)
- Bawah: Logout (merah, door-exit icon)
- Divider tipis antar item

### Layout halaman materi (Course Detail)
```
┌────────────────────────────────────────────────────────────────┐
│  TOPBAR: Logo | "Home  Course  Leaderboard" nav tengah | Avatar│
├──────────────┬─────────────────────────────────────────────────┤
│ LEFT PANEL   │  STEP INDICATOR (Video Tutorial → Reading →Quiz)│
│ 280px        │─────────────────────────────────────────────────│
│ Course label │                                                 │
│ Your Progress│           CONTENT AREA                         │
│ (gradient)   │                                                 │
│ List Material│                                                 │
│ accordion    │                                                 │
│              │                                                 │
│ Kembali link │  [Prev]          [Next / Let's Test]            │
└──────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Komponen Global (Reusable)

### Button
```
Primary   : bg #5B21B6, text putih, radius 8px, py-10 px-20
            hover: bg #4C1D95
Outline   : border #5B21B6, text #5B21B6, bg putih
            contoh: "View Report"
Pill CTA  : radius 9999px, bg #5B21B6, contoh: "Lanjutkan Belajar"
Danger    : bg merah, contoh logout
Icon+Text : icon di kiri, contoh "▶ Resume", "← Prev", "Next →"
Submit    : bg #0F766E (teal gelap), radius pill, pojok kanan bawah
            contoh: "Submit Test ✈"
Run Button: bg #F59E0B kuning, text hitam, contoh "Run ▶"
```

### Badge / Pill Status
```
Selesai      : bg #D1FAE5, text #065F46, icon ✓ hijau
Sedang Aktif : bg #FEF3C7, text #92400E, font-weight 600
Terkunci     : bg #F3F4F6, text #9CA3AF, icon 🔒
Approve      : border hijau, text hijau
Pending      : border kuning, text kuning-gelap
Error        : bg merah, text putih
Success      : bg hijau, text putih
INTERMEDIATE : bg #DBEAFE, text #1E40AF, font 10px uppercase
BEGINNER     : bg #D1FAE5, text #065F46
```

### Progress Bar
```html
<!-- Contoh struktur -->
<div class="progress-track">  <!-- bg #E5E7EB, h-2, rounded-full -->
  <div class="progress-fill" style="width: 7%">  <!-- bg #7C3AED -->
</div>
<span class="progress-label">7%</span>
```

### Avatar Circle
```
Ukuran   : 36–40px
Shape    : circle (rounded-full)
BG       : kuning #F59E0B
Text     : inisial huruf, putih, font-weight 700
```

### Step Indicator (3 langkah di materi)
```
Step 1 (selesai): ✓ icon hijau + label teks aktif
Step 2 (aktif)  : nomor circle outline ungu + label bold
Step 3 (belum)  : nomor circle abu + label abu
Connector       : garis horizontal abu
```

### Accordion List Material (sidebar kiri materi)
```
Parent (Bab): chevron icon + judul bold
Child (Sub Lesson): 
  - Selesai     : ✓ circle hijau
  - Sedang      : circle outline ungu (in-progress)
  - Terkunci    : 🔒 abu
  - Active item : background #EDE9FE highlight
```

### Code Block
```
Background : #1E1E1E
Font       : monospace 13px
Text       : putih / syntax highlight (merah untuk keyword, kuning untuk string)
Radius     : 8px
Padding    : 16px
Line height: 1.6
```

### Score Card (di Report)
```
4 card sejajar: Reading | Coding | Essay | Total Score
Masing-masing: icon atas + label kecil + angka besar
Reading  : bg #D1FAE5 (teal muda)
Coding   : bg #EDE9FE (ungu muda)
Essay    : bg #FEF3C7 (kuning muda)
Total    : bg #F59E0B (kuning solid), text putih, lebih besar
```

---

## 4. Frame Inventory — Role Pelajar

### F01 — Sign Up
**Route:** `/signup`  
**Layout:** Split screen (50/50)
- Kiri: panel ungu solid #5B21B6, ilustrasi coding, teks "Sign up to BAJAPRO"
- Kanan: form putih, logo pojok kanan atas

**Komponen form:**
- Tab toggle: "Student" (aktif, bg ungu) | "Teacher" (tidak aktif)
- Input fields: Name, Email, Kode Kelas, Password, Confirm Password
  - Border: #10B981 hijau saat terisi valid + ✓ icon kanan
  - Label: floating label (label naik saat focus/filled)
  - Password: toggle show/hide icon (👁 slash)
- CTA button: "Daftar Sebagai Pelajar" (full width, ungu)
- Link bawah: "Already have an account? **Login**" (Login berwarna ungu)

**State yang terlihat:** Semua field terisi (filled state)

---

### F02 — Dashboard
**Route:** `/dashboard`  
**Navbar:** topbar standar  
**Sidebar:** Dashboard aktif

**Konten utama (3 kolom):**

Kolom kiri-tengah:
- Greeting: "Selamat Datang, [Nama]! 👋" (H1 bold) + sub-teks motivasi
- 3 stat card: Enrolled Course, Materials Done, Overall Progress
  - Card ungu muda, card teal muda, card biru muda
  - Angka besar + label kecil

- Section "Lesson History":
  - List item: thumbnail gambar + badge level (INTERMEDIATE/BEGINNER) + judul materi + progress bar + tombol "Lanjutkan"

Kolom kanan:
- Achievement card (bg gradient orange, rounded): badge icon, nama badge, rank, score
- Leaderboard preview card: top 3 avatar + nama + skor + link "See Leaderboard"

---

### F03 — Course List (Belum Enroll)
**Route:** `/course`  
**Sidebar:** Course aktif

**Konten:**
- Heading: "Take Your Lesson now!" + sub-teks
- Course card: thumbnail gradient + judul "Java" + deskripsi singkat + "15 Bab  25 Sub Bab"
- CTA button: **"Enroll Course"** (full width, ungu solid)

---

### F04 — Course List (Sudah Enroll)
**Route:** `/course`  
**Sama dengan F03, perbedaan:**
- Tambah progress bar + persentase "5%"
- 2 button: **"▶ Resume"** (ungu solid) + **"View Report"** (outline)

---

### F05 — Level Selection
**Route:** `/course/[courseId]/level`  
**Topbar:** tombol "← Kembali ke Daftar Course"  
**Heading:** "**Start**Your Adventure**Now!**" (kata Start ungu, Now kuning)

**Layout konten:** timeline vertikal center, card zigzag kiri-kanan

**Level card states:**
```
Selesai      : card normal + badge "Selesai" hijau + connector hijau
Sedang Aktif : card lebih besar/elevated + badge "Sedang Aktif" kuning + button "Lanjutkan Belajar"
Terkunci     : card greyed out + badge "Terkunci" abu + 🔒 connector
```

**Card isi:** icon level + judul (Beginner/Intermediate/Advanced) + sub-label bahasa Indonesia + "X Lesson  X Sub Leson"

**Dekorasi:** bintang ⭐ outline di sisi luar card aktif, icon kode { } dan >_ di sisi luar card lain

---

### F06 — Materi Video (Step 1: Video Tutorial)
**Route:** `/course/[courseId]/[levelId]/[sublesonId]/video`  
**Layout:** 2-panel (left panel + content area)

**Left panel (Your Progress card):**
- Background gradient orange-pink
- Label "Your Progress", progress bar putih, persentase
- 2 mini card: Current Badge + Total Score
- Section "List Material": accordion bab + sub-lesson dengan status icon

**Content area:**
- Step indicator: ① Video Tutorial (aktif) → ② Reading Material → ③ Practice Quiz
- Video player: thumbnail dark + play button circle ungu + timestamp "04:12 / 14:35" + controls
- Video title: "Video Pembelajaran: Sintaks Dasar Java" + sub: "Module 2 :: Sintaks Pemilihan IF ELSE"
- Navigasi: tombol **"Next →"** saja (kanan bawah, ungu)

---

### F07 — Materi Teks (Step 2: Reading Material) — State Pertengahan
**Route:** `/course/[courseId]/[levelId]/[sublesonId]/reading`

**Sama dengan F06 layout, perbedaan content area:**
- Step indicator: ✓ Video Tutorial → ② Reading Material (aktif) → ③ Practice Quiz
- Konten teks: judul H2 + body paragraf + blockquote (border kiri abu, italic)
- Code block: dark background, syntax highlight
- Navigasi: **"← Prev"** + **"Next →"**

---

### F08 — Materi Teks (Step 2: Reading Material) — State Terakhir
**Route:** sama dengan F07  
**Perbedaan:** tombol Next diganti **"Let's Test 🖱"** (teal gelap, pill shape) → menandakan ini sub-lesson terakhir sebelum quiz

---

### F09 — Practice Quiz / Test (Step 3)
**Route:** `/course/[courseId]/[levelId]/[sublesonId]/test`  
**Layout:** 2 kolom (kiri soal + kanan code editor), tanpa sidebar kiri panel progress  
**Topbar:** hanya step indicator (semua ✓ kecuali ③ aktif) + banner header ungu

**Banner header:** "Course: Java" label kecil + judul sub-lesson + tombol "← Kembali"

**Kolom kiri:**
- Section ⚡ **Exploring**: judul "Studi Kasus" + instruksi + code block read-only (template kode)
- Section ✏️ **Explaining**: soal essay 1–3 + textarea "Type your answer here" per soal

**Kolom kanan:**
- Panel **Code Editor** (dark, bg #1E1E1E): area edit kode + tombol **"Run ▶"** (kuning)
- Panel **Run Output** (dark): area output hasil run

**Footer:** tombol **"Submit Test ✈"** (pojok kanan bawah, teal gelap pill)

---

### F10 — Report Course (Daftar Sub-Lesson)
**Route:** `/course/[courseId]/report`  
**Sidebar:** Course aktif

**Header area:**
- "Report Course: **Java**" (Java berwarna ungu) + tombol "⊕ Kembali" (biru)
- 4 stat card: Current Badge + Total Score + Progress + Finished Test (X/25)

**Tabel:**
| Kolom | Keterangan |
|-------|-----------|
| No | nomor urut |
| Sub Lesson | nama sub-lesson |
| Total Score | angka |
| Read Score | angka |
| Coding Score | angka |
| Essay Score | angka |
| Status | badge Approve (hijau outline) / Pending (kuning outline) |
| Action | tombol "Detail" (ungu solid) |

- Pagination di kanan bawah tabel

---

### F11 — Detail Report Sub-Lesson (Tab: Code Test Report)
**Route:** `/course/[courseId]/report/[sublesonId]`  
**Sidebar:** Course aktif

**Header banner:** ungu, "Course: Java" + judul sub-lesson + "← Kembali"

**Score Overview:** 4 card (Reading 85, Coding 90, Essay 78, Total 800) + badge status "Pending"

**Soal:** label "Soal" kecil + "Studi Kasus" judul ungu + instruksi bullet + code block soal

**Tab:** "Code Test Report" (aktif, underline ungu) | "Essay Test Report"

**Isi Code Test:**
- Test Summary: 3 kolom (ERRORS merah / SUCCESS teal / SCORE ungu)
- Exercise Logs: badge "Error" merah + log teks error monospace, atau badge "Success" hijau + output

---

### F12 — Detail Report Sub-Lesson (Tab: Essay Test Report) — Tampilan Pelajar
**Route:** sama dengan F11, tab berganti  
**Perbedaan:** Tab "Essay Test Report" aktif

**Isi Essay Test:**
- Per soal: label "Question N" pill ungu + teks pertanyaan + badge Score (teal)
- Card "Your Answer": avatar icon + teks jawaban pelajar
- Card "Teacher Notes": ikon seru merah + catatan guru
- Tombol **"✏️ Edit Jawaban"** (ungu outline) di bawah tiap soal

---

### F13 — Detail Report Sub-Lesson (Tab: Essay Test Report) — Tampilan dengan Answer Key
**Route:** sama dengan F12  
**Perbedaan:** Setiap soal tampilkan 2 kolom:
- Kiri: "Your Answer" (avatar icon + teks jawaban)
- Kanan: "Answer Key" (icon centang hijau + teks kunci jawaban)
- Badge Score di pojok kanan atas tiap soal card

---

### F14 — Leaderboard
**Route:** `/leaderboard`  
**Sidebar:** Leaderboard aktif  
**Background:** gradient putih → kuning muda → hijau muda (halus)

**Konten:**
- Heading: "Leaderboard 🏆" (ungu, H1 bold) + sub-teks
- Banner motivasi: bg teal muda, teks "🎉 You're doing great, [Nama]! The top is within reach!"

**Filter bar:** 2 tombol (Global Rankings aktif ungu | My Class outline) + dropdown "FILTER COURSE*"

**Podium Top 3:**
```
#2 (kiri, lebih kecil): card putih shadow, avatar kotak kuning, nama, poin, badge
#1 (tengah, lebih besar + elevated): card putih shadow tebal, avatar kotak ungu, badge "MVP" kuning, nama, poin, badge "Gold Master"
#3 (kanan, lebih kecil): card putih shadow, avatar kotak hijau
```

**Tabel Other Rankings (#4 dst):**
- Kolom: Rank (angka berwarna) | Avatar+Nama | Badge pill | Reading | Coding | Essay | Total Score (bold ungu)
- Search input pojok kanan: "Search student..."
- Pagination + info "SHOWING 4-8 OF 45 STUDENTS"

---

## 5. Alur Navigasi Pelajar

```
/signup
    └─> /login
            └─> /dashboard
                    ├─> /course
                    │       ├─> (belum enroll) → Enroll → refresh card
                    │       └─> (sudah enroll) → Resume → /course/[id]/level
                    │               └─> pilih level → /course/[id]/[levelId]/[subId]/video
                    │                       └─> Next → /reading
                    │                               └─> Next/Let's Test → /test
                    │                                       └─> Submit → /course/[id]/report
                    │                                               └─> Detail → /report/[subId]
                    └─> /leaderboard
```

---

## 6. Catatan Perubahan UI (Hasil Usability Test)

| Issue | Frame | Perubahan |
|-------|-------|-----------|
| Tab "Essay Score" tidak terdeteksi | F11, F12 | Tab strip visible dengan underline aktif ungu |
| Navigasi antar step tidak jelas | F06–F09 | Step indicator 3 langkah eksplisit di atas konten |
| Level locked tidak jelas | F05 | Badge "Terkunci" + icon 🔒 + card greyed out |
| CTA enroll vs resume membingungkan | F03, F04 | Beda button: "Enroll Course" vs "Resume" + "View Report" |

---

## 7. Catatan untuk Developer

- Semua halaman authenticated wajib cek session (middleware Next.js)
- Role `pelajar` tidak bisa akses route `/pengajar/*` dan `/admin/*`
- Progress bar & badge dihitung dari data di database, bukan hardcode
- Code editor di F09 perlu library (contoh: CodeMirror atau Monaco)
- Video player: embed iframe atau `<video>` tag tergantung sumber video
- Leaderboard bisa berat query-nya, pertimbangkan caching atau pagination server-side

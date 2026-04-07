// 1. Tipe data untuk membaca list level di Tabel & dari API
export interface LevelData {
  id: string;
  no: number;
  level: string;
  deskripsi: string;
  isactive: string; // Bisa diganti 'boolean' (true/false) kalau dari backend maunya begitu
}

// 2. Tipe data untuk inputan Form (Tambah & Edit)
export interface LevelFormData {
  levelName: string;
  description: string;
}
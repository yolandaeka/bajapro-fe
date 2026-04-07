export interface UserData {
  id: string;
  name: string;
  role: string;
  email: string;
  isactive: number; // 1 untuk aktif, 0 untuk nonaktif
  instansi?: string;
  kelas?: string;
}

export interface UserFormData {
  name: string;
  role: string;
  email: string;
  password?: string; // Opsional saat edit
  instansi?: string; // Opsional (hanya Pengajar)
  kelas?: string;    // Opsional (hanya Pelajar)
}
import { LevelData, LevelFormData } from "../types";

// Ambil alamat URL dari file .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const USE_REAL_API = false; 

// --- DATA DUMMY (Abaikan saja, ini untuk sementara) ---
let dummyLevels: LevelData[] = [
  { id: "1", no: 1, level: "Easy", deskripsi: "Materi dasar", isactive: "Active" },
  { id: "2", no: 2, level: "Medium", deskripsi: "Materi lanjutan", isactive: "Active" },
  { id: "3", no: 3, level: "Hard", deskripsi: "Materi sulit", isactive: "Nonactive" },
];


// 1. GET ALL
export const getLevelsApi = async (): Promise<LevelData[]> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels`);
    if (!response.ok) throw new Error("Gagal mengambil data");
    return response.json();
  } else {
   
    return new Promise((resolve) => setTimeout(() => resolve([...dummyLevels]), 0));
  }
};

// 2. GET BY ID
export const getLevelByIdApi = async (id: string): Promise<LevelData> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels/${id}`);
    if (!response.ok) throw new Error("Gagal mengambil detail data");
    return response.json();
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = dummyLevels.find(item => item.id === id);
        resolve(found as LevelData);
      }, 0);
    });
  }
};

// 3. POST (TAMBAH)
export const createLevelApi = async (data: LevelFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal menyimpan data");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLevel: LevelData = {
          id: Math.random().toString(36).substring(7),
          no: dummyLevels.length + 1,
          level: data.levelName,
          deskripsi: data.description,
          isactive: "Aktif"
        };
        dummyLevels.push(newLevel);
        resolve();
      }, 0);
    });
  }
};

// 4. PUT (EDIT)
export const updateLevelApi = async (id: string, data: LevelFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal mengupdate data");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyLevels = dummyLevels.map(item => 
          item.id === id ? { ...item, level: data.levelName, deskripsi: data.description } : item
        );
        resolve();
      }, 0);
    });
  }
};

// 5. DELETE (HAPUS)
export const deleteLevelApi = async (id: string): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Gagal menghapus data");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyLevels = dummyLevels.filter(item => item.id !== id);
        resolve();
      }, 0);
    });
  }
};
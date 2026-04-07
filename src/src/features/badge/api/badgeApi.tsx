import { BadgeData, BadgeFormData } from "../types";

// Ambil alamat URL dari file .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const USE_REAL_API = false; 

let dummyBadges: BadgeData[] = [
  { id: "1", name: "Pemula Hebat", image: "/assets/gamification/lv 1.png", minScore: 0, maxScore: 50, isactive: "Aktif" },
  { id: "2", name: "Si Jagoan", image: "/assets/gamification/lv 2.png", minScore: 51, maxScore: 100, isactive: "Aktif" },
];

// 1. GET ALL
export const getBadgesApi = async (): Promise<BadgeData[]> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/badges`);
    if (!response.ok) throw new Error("Gagal mengambil data badge");
    return response.json();
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([...dummyBadges]), 0));
  }
};

// 2. GET BY ID
export const getBadgeByIdApi = async (id: string): Promise<BadgeData> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/badges/${id}`);
    if (!response.ok) throw new Error("Gagal mengambil detail badge");
    return response.json();
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = dummyBadges.find(item => item.id === id);
        resolve(found as BadgeData);
      }, 0);
    });
  }
};

// 3. POST (TAMBAH)
export const createBadgeApi = async (data: BadgeFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/badges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal menyimpan data badge");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBadge: BadgeData = {
          id: Math.random().toString(36).substring(7),
          name: data.name,
          image: data.image || "https://via.placeholder.com/50",
          minScore: data.minScore,
          maxScore: data.maxScore,
          isactive: "Aktif"
        };
        dummyBadges.push(newBadge);
        resolve();
      }, 0);
    });
  }
};

// 4. PUT (EDIT)
export const updateBadgeApi = async (id: string, data: BadgeFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/badges/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal mengupdate data badge");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyBadges = dummyBadges.map(item => 
          item.id === id ? { 
            ...item, 
            name: data.name, 
            image: data.image, 
            minScore: data.minScore, 
            maxScore: data.maxScore 
          } : item
        );
        resolve();
      }, 0);
    });
  }
};

// 5. DELETE (HAPUS)
export const deleteBadgeApi = async (id: string): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/badges/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Gagal menghapus data badge");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyBadges = dummyBadges.filter(item => item.id !== id);
        resolve();
      }, 0);
    });
  }
};
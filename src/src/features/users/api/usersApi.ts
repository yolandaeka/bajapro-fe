import { UserData, UserFormData } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const USE_REAL_API = false; // Ubah ke true jika backend sudah siap

// --- DATA DUMMY ---
let dummyUsers: UserData[] = [
  { id: "1", name: "Yolanda Ekaputri S", role: "Admin", email: "yolanda@gmail.com", isactive: 1 },
  { id: "2", name: "Fida Cahya", role: "Pengajar", email: "fida@gmail.com", isactive: 1, instansi: "Polinema" },
  { id: "3", name: "Yovi Dwicho", role: "Pelajar", email: "yovi@gmail.com", isactive: 1, kelas: "12 IPA 1" },
  { id: "4", name: "Budi Santoso", role: "Pelajar", email: "budi@gmail.com", isactive: 0, kelas: "12 IPA 2" },
];

export const getUsersApi = async (): Promise<UserData[]> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/users`);
    if (!response.ok) throw new Error("Gagal mengambil data user");
    return response.json();
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([...dummyUsers]), 300));
  }
};

export const getUserByIdApi = async (id: string): Promise<UserData> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error("Gagal mengambil detail user");
    return response.json();
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = dummyUsers.find((item) => item.id === id);
        resolve(found as UserData);
      }, 300);
    });
  }
};

export const createUserApi = async (data: UserFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal menyimpan user");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = dummyUsers.length > 0 
          ? Math.max(...dummyUsers.map(user => Number(user.id))) + 1 
          : 1;

        const newUser: UserData = {
          id: nextId.toString(),
          name: data.name,
          role: data.role,
          email: data.email,
          isactive: 1, 
          instansi: data.instansi,
          kelas: data.kelas,
        };
        dummyUsers.push(newUser);
        resolve();
      }, 500);
    });
  }
};

export const updateUserApi = async (id: string, data: UserFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal mengupdate user");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyUsers = dummyUsers.map((item) =>
          item.id === id
            ? { ...item, name: data.name, role: data.role, email: data.email, instansi: data.instansi, kelas: data.kelas }
            : item
        );
        resolve();
      }, 500);
    });
  }
};

export const deleteUserApi = async (id: string): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Gagal menghapus user");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyUsers = dummyUsers.filter((item) => item.id !== id);
        resolve();
      }, 500);
    });
  }
};


export const getInstansiOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) {
    // Nanti ganti endpoint sesuai buatan Backend
    const response = await fetch(`${BASE_URL}/instansi-options`);
    return response.json();
  } else {
    // Data Dummy Instansi
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: "Polinema", value: "Polinema" },
          { label: "SMAN 1 Malang", value: "SMAN 1 Malang" },
          { label: "Universitas Brawijaya", value: "Universitas Brawijaya" },
        ]);
      }, 300);
    });
  }
};

export const getKelasOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) {
    // Nanti ganti endpoint sesuai buatan Backend
    const response = await fetch(`${BASE_URL}/kelas-options`);
    return response.json();
  } else {
    // Data Dummy Kelas
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: "10 IPA 1", value: "10 IPA 1" },
          { label: "11 IPS 2", value: "11 IPS 2" },
          { label: "12 Bahasa", value: "12 Bahasa" },
        ]);
      }, 300);
    });
  }
};

export const getRoleOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/role-options`);
    return response.json();
  } else {
    // Data Dummy Role
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: "Admin", value: "Admin" },
          { label: "Pengajar", value: "Pengajar" },
          { label: "Pelajar", value: "Pelajar" },
        ]);
      }, 300);
    });
  }
};
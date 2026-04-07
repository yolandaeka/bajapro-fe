import { RoleData, RoleFormData } from "../types";

// Ambil alamat URL dari file .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const USE_REAL_API = false; 

let dummyRoles: RoleData[] = [
  { id: "1", role_name: "Admin", isactive: "Aktif" },
  { id: "2", role_name: "Pengajar", isactive: "Aktif" },
   { id: "3", role_name: "Pelajar", isactive: "Aktif" },
];

// 1. GET ALL
export const getRolesApi = async (): Promise<RoleData[]> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/roles`);
    if (!response.ok) throw new Error("Gagal mengambil data role");
    return response.json();
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([...dummyRoles]), 0));
  }
};

// 2. GET BY ID
export const getRoleByIdApi = async (id: string): Promise<RoleData> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/roles/${id}`);
    if (!response.ok) throw new Error("Gagal mengambil detail badge");
    return response.json();
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = dummyRoles.find(item => item.id === id);
        resolve(found as RoleData);
      }, 0);
    });
  }
};

// 3. POST (TAMBAH)
export const createRoleApi = async (data: RoleFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal menyimpan data role");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRole: RoleData = {
          id: Math.random().toString(36).substring(7),
          role_name: data.role_name,
          isactive: "Aktif"
        };
        dummyRoles.push(newRole);
        resolve();
      }, 0);
    });
  }
};

// 4. PUT (EDIT)
export const updateRoleApi = async (id: string, data: RoleFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal mengupdate data role");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyRoles = dummyRoles.map(item => 
          item.id === id ? { 
            ...item, 
            role_name: data.role_name 
          } : item
        );
        resolve();
      }, 0);
    });
  }
};

// 5. DELETE (HAPUS)
export const deleteRoleApi = async (id: string): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/roles/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Gagal menghapus data role");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyRoles = dummyRoles.filter(item => item.id !== id);
        resolve();
      }, 0);
    });
  }
};
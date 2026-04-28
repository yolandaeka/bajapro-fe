import { ClassData, ClassFormData } from "../types";

const USE_REAL_API = false;
const BASE_URL = "http://localhost:5000/api";

// DUMMY DATA YANG SUDAH DISESUAIKAN
let dummyKelas: ClassData[] = [
  { id: "1", class_name: "10 IPA 1", class_code: "IPA1-X8Z", school_name: "SMAN 1 Malang", teacher_id: "p1", teacher_name: "Budi Santoso", isactive: 1 },
  { id: "2", class_name: "11 IPS 2", class_code: "IPS2-M9Q", school_name: "SMAN 1 Malang", teacher_id: "p1", teacher_name: "Budi Santoso", isactive: 1 },
  { id: "3", class_name: "12 Bahasa", class_code: "BHS-K2L", school_name: "Polinema", teacher_id: "p2", teacher_name: "Siti Aminah", isactive: 1 },
];

export const getClassApi= async (): Promise<ClassData[]> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/kelas`);
    return response.json();
  }
  return new Promise((resolve) => setTimeout(() => resolve([...dummyKelas]), 500));
};

export const createClassApi= async (data: ClassFormData): Promise<ClassData> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/kelas`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    return response.json();
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const newKelas: ClassData = {
        ...data,
        id: Math.random().toString(),
        teacher_id: "p1", // Simulasi user (Pengajar) yang sedang login
        teacher_name: "Budi Santoso",
        isactive: 1,
      };
      dummyKelas.push(newKelas);
      resolve(newKelas);
    }, 500);
  });
};

export const updateClassApi= async (id: string, data: ClassFormData): Promise<ClassData> => {
  if (USE_REAL_API) {
    return {} as ClassData; // Nanti isi dengan fetch PUT
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = dummyKelas.findIndex((k) => k.id === id);
      if (index !== -1) dummyKelas[index] = { ...dummyKelas[index], ...data };
      resolve(dummyKelas[index]);
    }, 500);
  });
};

export const deleteClassApi= async (id: string): Promise<void> => {
  if (USE_REAL_API) {
    return; // Nanti isi dengan fetch DELETE
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      dummyKelas = dummyKelas.filter((k) => k.id !== id);
      resolve();
    }, 500);
  });
};

// Opsional: Untuk filter nama guru bagi Admin
export const getGuruOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) return fetch(`${BASE_URL}/guru-options`).then((res) => res.json());
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { label: "Budi Santoso", value: "Budi Santoso" },
      { label: "Siti Aminah", value: "Siti Aminah" },
    ]), 300);
  });
};

export const getInstansiOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) return fetch(`${BASE_URL}/instansi-options`).then((res) => res.json());
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { label: "SMAN 1 Malang", value: "SMAN 1 Malang" },
      { label: "Polinema", value: "Polinema" },
    ]), 300);
  });
};
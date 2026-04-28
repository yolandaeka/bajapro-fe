import { TeacherRecord } from "../types";
import React from "react";

// Ambil alamat URL dari file .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const USE_REAL_API = false; 

// Gunakan let agar data dummy bisa diubah saat simulasi
let dummyData: TeacherRecord[] = [
  { key: "1", no: 1, nama: "Yolanda Ekaputri Setyawan", email: "yolandaeka47@gmail.com", instansi: "Politeknik Negeri Malang", nip: "199001012019032011", is_approved_by_admin: 1 },
  { key: "2", no: 2, nama: "Fida Cahya", email: "fida@gmail.com", instansi: "SMK 6 Malang", nip: "198505122010012005", is_approved_by_admin: 2 },
  { key: "3", no: 3, nama: "Yovi Dwicho Setyawan", email: "yovi@gmail.com", instansi: "SMK 7 MALANG", nip: "199208172020121008", is_approved_by_admin: 0 },
  { key: "4", no: 4, nama: "Karvin", email: "karvin@gmail.com", instansi: "SMKN 8 MALANG", nip: "198811222015041002", is_approved_by_admin: 0 },
];

// 1. GET ALL (Ambil List Pengajar)
export const fetchPengajarApi = async (): Promise<TeacherRecord[]> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/admin/approval-pengajar`);
    if (!response.ok) throw new Error("Gagal mengambil data pengajar");
    return response.json();
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([...dummyData]), 500)); // Simulasi loading 0.5s
  }
};

// 2. POST / PUT (APPROVE PENGAJAR)
export const approvePengajarApi = async (keys: React.Key[]): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/admin/approval-pengajar/approve`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    });
    if (!response.ok) throw new Error("Gagal meng-approve data pengajar");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyData = dummyData.map((item) =>
          keys.includes(item.key) ? { ...item, is_approved_by_admin: 1 } : item
        );
        resolve();
      }, 300);
    });
  }
};

// 3. POST / PUT (REJECT PENGAJAR)
export const rejectPengajarApi = async (keys: React.Key[]): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/admin/approval-pengajar/reject`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }), 
    });
    if (!response.ok) throw new Error("Gagal menolak data pengajar");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyData = dummyData.map((item) =>
          keys.includes(item.key) ? { ...item, is_approved_by_admin: 2 } : item
        );
        resolve();
      }, 300);
    });
  }
};
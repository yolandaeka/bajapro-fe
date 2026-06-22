import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname(); // Re-fetch setiap navigasi ke halaman baru
  const [permissions, setPermissions] = useState<any[]>([]);
  const [permLoading, setPermLoading] = useState(true);

  // Langsung baca dari session
  const user = session?.user as any;

  const fetchPermissions = useCallback(async () => {
    if (!session?.user) {
      setPermLoading(false);
      return;
    }
    try {
      setPermLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || '/api'}/permission/permissions`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Gagal mengambil permission');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPermissions(data);
      } else if (data && Array.isArray(data.data)) {
        setPermissions(data.data);
      } else {
        setPermissions([]);
      }
    } catch {
      setPermissions([]);
    } finally {
      setPermLoading(false);
    }
  }, [session]);

  // Re-fetch saat: session berubah, status berubah, atau navigasi ke halaman lain
  useEffect(() => {
    if (status === 'loading') return;
    fetchPermissions();
  }, [status, pathname, fetchPermissions]);

  // Listen event 'permission-updated' — dikirim dari halaman Permission setelah save
  useEffect(() => {
    const handler = () => fetchPermissions();
    window.addEventListener('permission-updated', handler);
    return () => window.removeEventListener('permission-updated', handler);
  }, [fetchPermissions]);

  /**
   * Cek apakah user punya izin tertentu.
   * - Admin (role_id=1) selalu true.
   * - Role lain dicek dari daftar permission yang diambil dari API.
   */
  const can = (permissionName: string): boolean => {
    const roleId = Number(user?.role_id);

    // Bypass mutlak untuk Admin agar tidak pernah kehilangan akses ke menu utama.
    if (roleId === 1) return true;

    // Selama permission belum selesai dimuat, tahan dulu
    if (permLoading) return false;

    if (!Array.isArray(permissions) || permissions.length === 0) return false;

    const perm = permissions.find(p => p?.name === permissionName.toLowerCase());
    if (!perm) return false;
    if (!perm.role_ids) return false;

    return perm.role_ids.map(Number).includes(roleId);
  };

  const loading = status === 'loading' || permLoading;

  return { user, can, loading, refetchPermissions: fetchPermissions };
};

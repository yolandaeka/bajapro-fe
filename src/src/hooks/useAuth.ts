import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      setUser(session.user);

      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/permission/permissions`)
        .then(res => {
          if (!res.ok) throw new Error("Gagal mengambil permission");
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            setPermissions(data);
          } else if (data && Array.isArray(data.data)) {
            setPermissions(data.data);
          } else {
            setPermissions([]);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session, status]);

  /**
   * Fungsi untuk mengecek izin
   * Contoh penggunaan: can('course.create')
   */
  const can = (permissionName: string) => {
    const roleId = Number(user?.role_id);
    if (roleId === 1) return true; 

    if (!Array.isArray(permissions)) return false;

    const perm = permissions.find(p => p?.name === permissionName.toLowerCase());
    if (!perm) return false;

    if (!perm.role_ids) return false;
    return perm.role_ids.map(Number).includes(roleId);
  };

  return { user, can, loading };
};

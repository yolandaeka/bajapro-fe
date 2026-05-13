import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
    if (userCookie) {
      try {
        const decoded = decodeURIComponent(userCookie).replace(/^"|"$/g, '');
        const userData = JSON.parse(decoded);
        setUser(userData);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`)
          .then(res => res.json())
          .then(data => {
            setPermissions(data);
            setLoading(false);
          });
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Fungsi untuk mengecek izin
   * Contoh penggunaan: can('course.create')
   */
  const can = (permissionName: string) => {
    const roleId = Number(user?.role_id);
    if (roleId === 1) return true; 

    const perm = permissions.find(p => p.name === permissionName.toLowerCase());
    if (!perm) return false;

    return perm.role_ids.map(Number).includes(roleId);
  };

  return { user, can, loading };
};

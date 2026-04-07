import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { UserData, UserFormData } from "../types";
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi } from "../api/usersApi";

export const useUser = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsersApi();
      setUsers(data);
    } catch (error) {
      messageApi.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (values: UserFormData) => {
    setLoading(true);
    try {
      await createUserApi(values);
      messageApi.success("User berhasil ditambahkan!");
      await fetchUsers(); 
      return true;
    } catch (error) {
      messageApi.error("Gagal menambahkan user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (id: string, values: UserFormData) => {
    setLoading(true);
    try {
      await updateUserApi(id, values);
      messageApi.success("User berhasil diupdate!");
      await fetchUsers(); 
      return true;
    } catch (error) {
      messageApi.error("Gagal mengupdate user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    try {
      await deleteUserApi(id);
      messageApi.success("User berhasil dihapus");
      await fetchUsers(); 
    } catch (error) {
      messageApi.error("Gagal menghapus user");
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, addUser, editUser, deleteUser, contextHolder };
};
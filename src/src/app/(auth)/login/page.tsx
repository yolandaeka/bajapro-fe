"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";


const { Title, Text } = Typography;

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  return (
    <>
      <style>{`
        /* Memaksa background terang sejak HTML pertama kali dimuat */
        html, body {
          background-color: #ffffff !important;
          color-scheme: light !important;
          margin: 0;
          padding: 0;
        }
        
        .auth-container {
          display: flex;
          min-height: 100vh;
          background-color: #ffffff; 
          overflow: hidden;
        }

        /* Form di Kiri */
        .form-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 10%;
          position: relative;
          background-color: #ffffff;
          overflow-y: auto;
        }

        /* Banner di Kanan */
        .banner-side {
          flex: 1;
          background-color: #5B21B6;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          padding: 40px;
        }

        .logo-container {
          position: absolute;
          top: 40px;
          left: 10%; /* Mengikuti padding form-side */
        }

        /* MEDIA QUERIES UNTUK RESPONSIVE */
        @media (max-width: 992px) {
          .banner-side {
            display: none; /* Banner hilang di layar HP/Tablet */
          }
          
          .form-side {
            padding: 40px 24px;
            align-items: center;
          }

          .form-content {
            width: 100%;
            max-width: 480px;
          }

          .logo-container {
            position: relative;
            top: 0;
            left: 0;
            margin-bottom: 32px;
            text-align: center;
            width: 100%;
          }
        }
      `}</style>

      <div className="auth-container">
        
        {/* BAGIAN KIRI: FORM */}
        <div className="form-side">
          <div className="form-content" style={{ maxWidth: 400, width: "100%" }}>
            
            {/* Logo Kiri Atas (Pindah ke tengah di HP) */}
            <div className="logo-container">
              <Title level={3} style={{ color: "#5B21B6", margin: 0 }}>
                BAJAPRO
              </Title>
            </div>

            <Title level={2}>Login</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 32 }}>
              Login to access your bajapro account
            </Text>

            <Form layout="vertical" onFinish={handleLogin} requiredMark={false}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email wajib diisi" },
                  { type: "email", message: "Format email salah" },
                ]}
              >
                <Input size="large" placeholder="john.doe@gmail.com" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Password wajib diisi" }]}
              >
                <Input.Password
                  size="large"
                  placeholder="••••••••••••••••"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  background: "linear-gradient(90deg, #5B21B6 0%, #7C3AED 100%)",
                  marginTop: 16,
                  border: "none",
                  borderRadius: 8,
                }}
              >
                Login
              </Button>
            </Form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Text>
                Dont have an account?{" "}
                {/* Sesuaikan link ke /register jika router kamu di luar auth */}
                <Link href="/register" style={{ color: "#EF4444" }}>
                  Sign up
                </Link>
              </Text>
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: BANNER UNGU */}
        <div className="banner-side">
          <div
            style={{
              width: 400,
              height: 300,
              backgroundColor: "#ffffff20",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 40,
              padding: 20, // Tambah padding biar gambar gak terlalu mepet border
            }}
          >
            <Image
              src="/assets/login-img.png"
              alt="Illustration"
              width={400}
              height={300}
              style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
              priority
            />
          </div>
          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <Title level={2} style={{ color: "white", marginBottom: 16 }}>
              Sign in to BAJAPRO
            </Title>
            <Text style={{ color: "#E5E7EB", fontSize: 16 }}>
              Platform belajar Java interaktif membantu kuasai logika pemrograman
              secara mendalam dan sistematis.
            </Text>
          </div>
        </div>

      </div>
    </>
  );
}
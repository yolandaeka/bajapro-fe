import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return jsonResponse({}, 200);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get('email');
  const roleId = searchParams.get('role_id');

  try {
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (!user) {
        return jsonResponse([]);
      }
      return jsonResponse([{
        id: user.id,
        role_id: user.roleId,
        class_id: user.classId,
        name: user.name,
        email: user.email,
        password: user.password,
        is_approved_by_admin: user.isApprovedByAdmin,
        instansi_sekolah: user.instansiSekolah,
        nip: user.nip,
        isactive: user.isActive,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      }]);
    }

    const whereClause: any = {};
    if (roleId) {
      whereClause.roleId = Number(roleId);
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
    });

    return jsonResponse(
      users.map((u: any) => ({
        id: u.id,
        role_id: u.roleId,
        class_id: u.classId,
        name: u.name,
        email: u.email,
        password: u.password,
        is_approved_by_admin: u.isApprovedByAdmin,
        instansi_sekolah: u.instansiSekolah,
        isactive: u.isActive,
        created_at: u.createdAt,
        updated_at: u.updatedAt,
      }))
    );
  } catch (error: any) {
    console.error('Error in GET /api/users:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Hash password with bcrypt
    const hashedPassword = bcrypt.hashSync(body.password, 10);
    
    // Menentukan roleId berdasarkan string role atau body.role_id
    let parsedRoleId = 3; // Pelajar default
    if (body.role === 'Admin') parsedRoleId = 1;
    else if (body.role === 'Pengajar') parsedRoleId = 2;
    else if (body.role_id !== undefined) parsedRoleId = Number(body.role_id);
    
    // Cek email duplikat
    const existingUser = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existingUser) {
      return jsonResponse({ error: 'Email sudah terdaftar' }, 400);
    }

    const created = await prisma.user.create({
      data: {
        roleId: parsedRoleId,
        classId: body.class_id ? Number(body.class_id) : null,
        name: body.name,
        email: body.email.toLowerCase(),
        password: hashedPassword,
        isApprovedByAdmin: body.is_approved_by_admin !== undefined ? Number(body.is_approved_by_admin) : 0,
        instansiSekolah: body.instansi_sekolah || '',
        nip: body.nip || null,
        isActive: body.isactive === undefined ? true : Boolean(body.isactive),
      },
    });

    return jsonResponse({
      id: created.id,
      role_id: created.roleId,
      class_id: created.classId,
      name: created.name,
      email: created.email,
      password: created.password,
      is_approved_by_admin: created.isApprovedByAdmin,
      instansi_sekolah: created.instansiSekolah,
      isactive: created.isActive,
      created_at: created.createdAt,
      updated_at: created.updatedAt,
    }, 201);
  } catch (error: any) {
    console.error('Error in POST /api/users:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

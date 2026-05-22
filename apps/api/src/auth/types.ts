import { UserRole } from '@prisma/client';

export type JwtUser = {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  areaId: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    tenantId: string | null;
    areaId: string | null;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
};

export interface LoginRequest {
  tenantSlug: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: 'Admin' | 'Recruiter' | 'HiringManager';
    tenantId: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Candidate {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  previousCompanyName?: string | null;
  noOfYearExperience?: number | null;
  instituteName: string;
  subject: string;
  expectedSalary?: number | null;
  salaryCurrency: string;

  resumeUrl?: string | null;
  resumeFileName?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface JobPosting {
  id: string;
  tenantId: string;
  title: string;
  department: string;
  location?: string | null;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  tenantId: string;
  candidateId: string;
  jobPostingId: string;
  status: string;
  notes?: string | null;

  expectedSalary?: number | null;
  salaryCurrency: string;

  resumeUrlSnapshot?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFilterQuery {
  status?: string;
  keyword?: string;
  minSalary?: number;
  maxSalary?: number;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

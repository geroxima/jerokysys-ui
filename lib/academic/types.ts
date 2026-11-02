export type PagedFilter = {
  page: number;
  size: number;
  sort?: string;
  direction?: "ASC" | "DESC";
};

export type PageResult<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type ResponseWrapper<T> = {
  data: T;
  message: string | null;
  code: string | null;
  status: number;
  success: boolean;
};

export type ExamDTO = {
  id: number | null;
  danceClassId: number;
  examName: string;
  examDate: string;
};

export type ExamResultDTO = {
  id: number | null;
  examId: number | null;
  studentId: number | null;
  score: string | number | null;
  remarks: string | null;
};

export type EnrollmentDTO = {
  id: number | null;
  studentId: number;
  classId: number;
  enrollmentDate: string;
  agreedPrice: number | null;
  status: "ACTIVE" | "INACTIVE" | "DROPPED" | "COMPLETED" | null;
};

export type DisciplineDTO = {
  id: number | null;
  name: string;
  description: string | null;
};

export type DanceClassDTO = {
  id: number | null;
  disciplineId: number;
  level: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  monthlyPrice: number;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED" | "SUSPENDED" | null;
};

export const EnrollmentStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DROPPED: "DROPPED",
  COMPLETED: "COMPLETED",
} as const;

export const DanceClassStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  CANCELLED: "CANCELLED",
  SUSPENDED: "SUSPENDED",
} as const;

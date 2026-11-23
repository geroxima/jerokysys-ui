import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiWrite } from "@/lib/api-client";

export const USER_ROLES = ["ADMIN", "PROFESSOR", "SECRETARY"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserResponse = {
  id: number;
  username: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export type CreateUserInput = {
  username: string;
  password: string;
  role: UserRole;
};

export const userKeys = {
  all: ["users"] as const,
};

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserInput) =>
      apiWrite<UserResponse>("/users", "POST", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

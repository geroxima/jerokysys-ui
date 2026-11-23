import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiWrite } from "@/lib/api-client";
import type { InstructorDTO } from "@/lib/personas/types";

export const instructorKeys = {
  all: ["instructors"] as const,
};

export function useCreateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<InstructorDTO, "id">) =>
      apiWrite<InstructorDTO>("/instructors", "POST", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorKeys.all }),
  });
}

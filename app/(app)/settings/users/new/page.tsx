import { UserForm } from "@/components/users/user-form";
import { requirePermission } from "@/lib/auth";

export const instant = false;

export default async function NewUserPage() {
  await requirePermission("users:manage");

  return <UserForm />;
}

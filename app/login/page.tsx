import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — JerokySys",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex w-80 flex-col items-center">
        <Image
          src="/jerokysys-logo.svg"
          alt="JerokySys"
          width={150}
          height={26}
          priority
          unoptimized
          className="mb-10"
        />
        <LoginForm />
      </div>
    </main>
  );
}

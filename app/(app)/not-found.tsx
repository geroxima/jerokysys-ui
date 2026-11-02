import { NotFoundPage } from "@/components/not-found-page";

export default function AppNotFound() {
  return (
    <NotFoundPage
      title="No encontramos este contenido"
      description="El registro no existe o ya no está disponible."
      href="/dash"
      actionLabel="Volver al panel"
    />
  );
}

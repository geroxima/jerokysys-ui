import { NotFoundPage } from "@/components/not-found-page";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Página no encontrada"
      description="La dirección puede ser incorrecta o la página pudo haberse movido."
      href="/"
      actionLabel="Ir al inicio"
    />
  );
}

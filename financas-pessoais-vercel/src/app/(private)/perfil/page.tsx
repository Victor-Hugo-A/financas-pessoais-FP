import { getCurrentUser } from "@/lib/session";
import { formatDateBR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Perfil</h1>
          <p>Dados básicos da sua conta.</p>
        </div>
      </header>

      <section className="card">
        <p className="card-title">Nome</p>
        <p className="card-value">{user?.name}</p>
      </section>

      <section className="card">
        <p className="card-title">E-mail</p>
        <p className="card-value">{user?.email}</p>
      </section>

      <section className="card">
        <p className="card-title">Conta criada em</p>
        <p className="card-value">{user?.createdAt ? formatDateBR(user.createdAt) : "-"}</p>
      </section>
    </>
  );
}

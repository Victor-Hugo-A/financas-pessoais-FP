import { PasswordForm } from "@/components/PasswordForm";
import { formatDateBR } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Perfil</h1>
          <p>Dados da conta e acesso.</p>
        </div>
      </header>

      <section className="profile-layout">
        <section className="profile-panel profile-hero">
          <div className="profile-avatar">{initials}</div>
          <div>
            <p className="profile-kicker">Conta ativa</p>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
        </section>

        <div className="profile-grid">
          <section className="profile-panel">
            <div className="profile-panel-header">
              <div>
                <p className="profile-kicker">Cadastro</p>
                <h2>Informações da conta</h2>
              </div>
            </div>

            <dl className="profile-details">
              <div>
                <dt>Nome</dt>
                <dd>{user?.name}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{user?.email}</dd>
              </div>
              <div>
                <dt>Conta criada em</dt>
                <dd>{user?.createdAt ? formatDateBR(user.createdAt) : "Não informado"}</dd>
              </div>
            </dl>
          </section>

          <PasswordForm />
        </div>
      </section>
    </>
  );
}

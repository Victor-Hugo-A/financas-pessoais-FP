import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}

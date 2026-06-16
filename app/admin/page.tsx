import { cookies } from "next/headers";
import AdminLoginForm from "@/components/admin/admin-login-form";
import AdminDashboard from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const isAuthenticated = session === "authenticated";

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <AdminLoginForm />
      </main>
    );
  }

  return <AdminDashboard />;
}

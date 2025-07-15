import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/app/(auth)/auth";
import { checkAdminRole } from "@/lib/middleware/admin-auth";

import AdminNavigation from "./components/admin-navigation";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

	const isAdmin = await checkAdminRole(session.user.id);
	if (!isAdmin) {
		redirect("/unauthorized");
	}

	return (
		<AdminNavigation userEmail={session.user?.email || ""} userName={session.user?.name || ""}>
			{children}
		</AdminNavigation>
	);
};

export default AdminLayout;

import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

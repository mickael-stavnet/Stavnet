import { AdminEntityEditor } from "@/components/admin/admin-workspace";

export default async function AdminOrganizationPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminEntityEditor entityType="organizations" id={id} />; }

import { AdminEntityEditor } from "@/components/admin/admin-workspace";

export default async function AdminPersonPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminEntityEditor entityType="persons" id={id} />; }

import { AdminEntityEditor } from "@/components/admin/admin-workspace";

export default async function AdminBookPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminEntityEditor entityType="books" id={id} />; }

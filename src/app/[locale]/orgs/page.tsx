'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/home/navbar"
import { Input } from "@/components/ui/input"
import { Search, Building2, Tag, Globe2, CalendarDays, Users, BookOpenText } from "lucide-react"
import { useTranslations } from 'next-intl'
import { fixEncoding } from '@/lib/encoding'

interface Organisme {
  id: string
  Organisme: string
  Type: string | null
  Pays: string | null
  Date_Creation: string | null
  Nb_Auteurs: number | null
  Nb_Titres: number | null
}

export default function OrgsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const t = useTranslations('Orgs')
  const [data, setData] = useState<Organisme[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const pageSize = 20

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch(`/api/orgs?page=${page}&search=${encodeURIComponent(search)}`)
        const result = await response.json()
        if (result.data) {
          setData(result.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, search])

  return (
    <div className="flex flex-col min-h-screen bg-background/30 backdrop-blur-[2px]">
      <Navbar />

      <main className="flex-1 container max-w-5xl mx-auto py-16">
        <section className="flex flex-col items-center text-center gap-6 mb-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-[#1e1e1e]">
            {t('title')}
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl leading-relaxed">
            {t('description')}
          </p>
          <div className="relative w-full max-w-sm mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder={t('searchPlaceholder')} 
              className="pl-9" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 h-12 text-foreground font-semibold"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {t('table.organisme')}</div></TableHead>
                <TableHead className="px-6 h-12 text-foreground font-semibold"><div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /> {t('table.type')}</div></TableHead>
                <TableHead className="px-6 h-12 text-foreground font-semibold"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-muted-foreground" /> {t('table.pays')}</div></TableHead>
                <TableHead className="px-6 h-12 text-foreground font-semibold"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /> {t('table.dateCreation')}</div></TableHead>
                <TableHead className="px-6 h-12 text-foreground font-semibold"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> {t('table.nbAuteurs')}</div></TableHead>
                <TableHead className="px-6 h-12 text-foreground font-semibold"><div className="flex items-center gap-2"><BookOpenText className="h-4 w-4 text-muted-foreground" /> {t('table.nbTitres')}</div></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j} className="px-6 py-4"><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                data.map((org) => (
                  <TableRow key={org.id} className="hover:bg-muted/30">
                    <TableCell className="px-6 py-4 font-medium">{fixEncoding(org.Organisme)}</TableCell>
                    <TableCell className="px-6 py-4">{fixEncoding(org.Type)}</TableCell>
                    <TableCell className="px-6 py-4">{fixEncoding(org.Pays)}</TableCell>
                    <TableCell className="px-6 py-4">{fixEncoding(org.Date_Creation)}</TableCell>
                    <TableCell className="px-6 py-4 font-mono">{org.Nb_Auteurs}</TableCell>
                    <TableCell className="px-6 py-4 font-mono">{org.Nb_Titres}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
            </PaginationItem>
            {Array.from({ length: 5 }).map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink 
                  onClick={() => setPage(i + 1)} 
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => p + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </main>
    </div>
  )
}

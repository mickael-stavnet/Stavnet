'use client'

import { useDeferredValue, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpenText, Building2, CalendarDays, Globe2, Search, Tag, Users } from 'lucide-react'
import { Navbar } from '@/components/home/navbar'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

interface OrgsResponse {
  data?: Organisme[]
  error?: string
}

function MobileInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: number | string | null
}) {
  if (value === null || value === '') {
    return null
  }

  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#382e60]" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export default function OrgsPage() {
  const t = useTranslations('Orgs')
  const [data, setData] = useState<Organisme[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const pageSize = 20

  useEffect(() => {
    const controller = new AbortController()

    async function fetchData() {
      setLoading(true)

      try {
        const response = await fetch(
          `/api/orgs?page=${page}&search=${encodeURIComponent(deferredSearch)}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          setData([])
          return
        }

        const result: OrgsResponse = await response.json()
        setData(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setData([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void fetchData()

    return () => controller.abort()
  }, [deferredSearch, page])

  return (
    <div className="flex min-h-screen flex-col bg-background/30 backdrop-blur-[2px]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <section className="mb-8 flex flex-col items-center gap-5 text-center sm:mb-12 sm:gap-6">
          <h1 className="text-3xl font-bold tracking-tighter text-[#382e60] sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="max-w-[700px] text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
            {t('description')}
          </p>
          <div className="relative mt-2 w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="h-12 pl-10 focus-visible:ring-[#e6be1e]"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </div>
        </section>

        <div className="space-y-4 md:hidden">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <Skeleton className="h-6 w-2/3" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            ))
          ) : (
            data.map((org, index) => (
              <article key={`${org.id}-${index}`} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{fixEncoding(org.Organisme)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{fixEncoding(org.Type) || '—'}</p>
                  </div>

                  <div className="grid gap-3">
                    <MobileInfo icon={Tag} label={t('table.type')} value={fixEncoding(org.Type)} />
                    <MobileInfo icon={Globe2} label={t('table.pays')} value={fixEncoding(org.Pays)} />
                    <MobileInfo icon={CalendarDays} label={t('table.dateCreation')} value={fixEncoding(org.Date_Creation)} />
                    <MobileInfo icon={Users} label={t('table.nbAuteurs')} value={org.Nb_Auteurs} />
                    <MobileInfo icon={BookOpenText} label={t('table.nbTitres')} value={org.Nb_Titres} />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#382e60] text-white">
                <TableRow className="hover:bg-[#382e60]">
                  <TableHead className="h-12 px-6 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t('table.organisme')}
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {t('table.type')}
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4" />
                      {t('table.pays')}
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {t('table.dateCreation')}
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t('table.nbAuteurs')}
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <BookOpenText className="h-4 w-4" />
                      {t('table.nbTitres')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: pageSize }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 6 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex} className="px-6 py-4">
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  data.map((org, index) => (
                    <TableRow key={`${org.id}-${index}`} className="hover:bg-muted/30">
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
        </div>

        <Pagination className="mt-6">
          <PaginationContent className="flex flex-wrap justify-center gap-2">
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} />
            </PaginationItem>
            {Array.from({ length: 5 }).map((_, index) => (
              <PaginationItem key={index + 1}>
                <PaginationLink
                  onClick={() => setPage(index + 1)}
                  isActive={page === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage((currentPage) => currentPage + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </main>
    </div>
  )
}

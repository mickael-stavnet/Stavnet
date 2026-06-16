'use client'

import { useDeferredValue, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { Navbar } from '@/components/home/navbar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fixEncoding } from '@/lib/encoding'

interface Person {
  id: string
  'Prénom Nom': string | null
  'Nom Prénom': string | null
  'Code Langue': string | null
  'Nb. Fiches Base': number | null
  'Nb. Fiches Trouvées': number | null
  'Si Date Décès': string | null
  'Si Lieu Décès': string | null
  'Nb. Contributions Auteurs': number | null
  'Nb. Contributions Titres': number | null
  'Activité Professionnelle': string | null
  'Biographie': string | null
  'Date de Décès': string | null
  'Date de Naissance': number | null
  'Lieu de Décès': string | null
  'Pays de Résidence': string | null
  'Ville de Naissance': string | null
  'Année Publication': string | null
  'Auteur Original': string | null
  'Cote Livre': string | null
  'Langue Traduction': string | null
  'Titre': string | null
  'Type Contribution': string | null
  'Nb. Langues Traduction': number | null
  'Nb. Titres Originaux': number | null
  'Nb. Titres Traduits': number | null
  'Nb. Pays Publication': number | null
  'Nb. Rééditions Poche': number | null
  'Nb. Rééditions Régulières': number | null
  'Nb. Prix Distinctions': number | null
  'Langue Écriture': string | null
  'Type Personne': string | null
}

interface PersonsResponse {
  data?: Person[]
  error?: string
}

function TruncatedCell({ text, limit = 30 }: { text: string | null; limit?: number }) {
  const content = fixEncoding(text)

  if (!content) {
    return null
  }

  if (content.length <= limit) {
    return <>{content}</>
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="min-h-11 text-left text-xs text-primary hover:underline">
          {content.substring(0, limit)}...
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détail</DialogTitle>
          <DialogDescription className="mt-2 text-foreground">{content}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

function MobileStat({
  label,
  value,
}: {
  label: string
  value: number | string | null
}) {
  if (value === null || value === '') {
    return null
  }

  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export default function PersonsPage() {
  const t = useTranslations('Persons')
  const [data, setData] = useState<Person[]>([])
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
          `/api/persons?page=${page}&search=${encodeURIComponent(deferredSearch)}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          setData([])
          return
        }

        const result: PersonsResponse = await response.json()
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

      <main className="mx-auto flex w-full max-w-[95rem] flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
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
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            ))
          ) : (
            data.map((person, index) => (
              <article key={`${person.id}-${index}`} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {fixEncoding(person['Prénom Nom'] || person['Nom Prénom']) || t('table.nomPrenom')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {fixEncoding(person['Type Personne']) || fixEncoding(person['Activité Professionnelle']) || '—'}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{t('table.titre')}:</span>{' '}
                      <span className="text-muted-foreground">{fixEncoding(person['Titre']) || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{t('table.auteurOriginal')}:</span>{' '}
                      <span className="text-muted-foreground">{fixEncoding(person['Auteur Original']) || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{t('table.biographie')}:</span>{' '}
                      <span className="text-muted-foreground">{fixEncoding(person['Biographie']) || '—'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MobileStat label={t('table.codeLangue')} value={fixEncoding(person['Code Langue'])} />
                    <MobileStat label={t('table.langueEcriture')} value={fixEncoding(person['Langue Écriture'])} />
                    <MobileStat label={t('table.nbFichesBase')} value={person['Nb. Fiches Base']} />
                    <MobileStat label={t('table.nbFichesTrouvees')} value={person['Nb. Fiches Trouvées']} />
                    <MobileStat label={t('table.nbContribAuteurs')} value={person['Nb. Contributions Auteurs']} />
                    <MobileStat label={t('table.nbContribTitres')} value={person['Nb. Contributions Titres']} />
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
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.auteurOriginal')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.titre')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.langueTrad')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.coteLivre')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.typeContrib')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nomPrenom')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.codeLangue')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbFichesBase')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbFichesTrouvees')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.siDateDeces')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.siLieuDeces')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbContribAuteurs')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbContribTitres')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.activitePro')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.biographie')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.dateDeces')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.dateNaissance')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.lieuDeces')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.paysResidence')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.villeNaissance')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.anneePub')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbLanguesTrad')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbTitresOrig')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbTitresTrad')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbPaysPub')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbReedPoche')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbReedReg')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.nbPrix')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.langueEcriture')}</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-white">{t('table.typePersonne')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: pageSize }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 30 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex} className="px-6 py-4">
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  data.map((person, index) => (
                    <TableRow key={`${person.id}-${index}`} className="hover:bg-muted/30">
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Auteur Original'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Titre'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Langue Traduction'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Cote Livre'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Type Contribution'])}</TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-2 font-medium">
                        <TruncatedCell text={person['Prénom Nom'] || person['Nom Prénom']} limit={20} />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Code Langue'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Fiches Base']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Fiches Trouvées']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Si Date Décès']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Si Lieu Décès']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Contributions Auteurs']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Contributions Titres']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">
                        <TruncatedCell text={fixEncoding(person['Activité Professionnelle'])} limit={15} />
                      </TableCell>
                      <TableCell className="max-w-[150px] px-3 py-2 text-xs truncate">
                        <TruncatedCell text={fixEncoding(person['Biographie'])} limit={25} />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Date de Décès']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Date de Naissance']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Lieu de Décès'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Pays de Résidence'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Ville de Naissance'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Année Publication']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Langues Traduction']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Titres Originaux']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Titres Traduits']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Pays Publication']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Rééditions Poche']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Rééditions Régulières']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{person['Nb. Prix Distinctions']}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Langue Écriture'])}</TableCell>
                      <TableCell className="px-3 py-2 text-xs">{fixEncoding(person['Type Personne'])}</TableCell>
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

'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/home/navbar"
import { Input } from "@/components/ui/input"
import { Search, User, Briefcase, Globe2, FileText } from "lucide-react"
import { useTranslations } from 'next-intl'
import { fixEncoding } from '@/lib/encoding'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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

function TruncatedCell({ text, limit = 30 }: { text: string | null, limit?: number }) {
  const content = fixEncoding(text)
  if (!content) return null
  
  if (content.length <= limit) return <>{content}</>
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-primary hover:underline text-left text-xs">
          {content.substring(0, limit)}...
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détail</DialogTitle>
          <DialogDescription className="text-foreground mt-2">{content}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default function PersonsPage() {
  const t = useTranslations('Persons')
  const [data, setData] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const pageSize = 20

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch(`/api/persons?page=${page}&search=${encodeURIComponent(search)}`)
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

      <main className="flex-1 container max-w-[95rem] mx-auto py-16">
        <section className="flex flex-col items-center text-center gap-6 mb-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-[#382e60]">
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
              className="pl-9 focus-visible:ring-[#e6be1e]" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#382e60] text-white">
              <TableRow className="hover:bg-[#382e60]">
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.auteurOriginal')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.titre')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.langueTrad')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.coteLivre')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.typeContrib')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nomPrenom')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.codeLangue')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbFichesBase')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbFichesTrouvees')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.siDateDeces')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.siLieuDeces')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbContribAuteurs')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbContribTitres')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.activitePro')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.biographie')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.dateDeces')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.dateNaissance')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.lieuDeces')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.paysResidence')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.villeNaissance')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.anneePub')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbLanguesTrad')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbTitresOrig')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbTitresTrad')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbPaysPub')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbReedPoche')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbReedReg')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.nbPrix')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.langueEcriture')}</TableHead>
                <TableHead className="px-6 h-12 text-white font-semibold">{t('table.typePersonne')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 30 }).map((_, j) => (
                      <TableCell key={j} className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                data.map((p, i) => (
                  <TableRow key={`${p.id}-${i}`} className="hover:bg-muted/30">
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Auteur Original'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Titre'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Langue Traduction'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Cote Livre'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Type Contribution'])}</TableCell>
                    <TableCell className="px-3 py-2 whitespace-nowrap font-medium"><TruncatedCell text={p['Prénom Nom'] || p['Nom Prénom']} limit={20} /></TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Code Langue'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Fiches Base']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Fiches Trouvées']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Si Date Décès']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Si Lieu Décès']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Contributions Auteurs']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Contributions Titres']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs"><TruncatedCell text={fixEncoding(p['Activité Professionnelle'])} limit={15} /></TableCell>
                    <TableCell className="px-3 py-2 text-xs max-w-[150px] truncate"><TruncatedCell text={fixEncoding(p['Biographie'])} limit={25} /></TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Date de Décès']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Date de Naissance']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Lieu de Décès'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Pays de Résidence'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Ville de Naissance'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Année Publication']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Langues Traduction']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Titres Originaux']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Titres Traduits']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Pays Publication']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Rééditions Poche']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Rééditions Régulières']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{p['Nb. Prix Distinctions']}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Langue Écriture'])}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{fixEncoding(p['Type Personne'])}</TableCell>
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

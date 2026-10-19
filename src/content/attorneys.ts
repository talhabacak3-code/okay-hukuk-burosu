import type { AttorneyInput } from "@/lib/content/attorney-schema"

/**
 * Avukat profilleri — GEÇİCİ yerel kaynak. Yönetim paneli (Supabase) devreye girdiğinde
 * veri `attorneys` tablosundan okunacak (bkz. supabase/migrations) ve bu dosya kaldırılacak.
 *
 * Kaynak: kullanıcı tarafından sağlanan büro bilgileri (17 Ekim 2026) — ad soyad, unvan ve
 * kurucu rolü. Baro, sicil, eğitim, mesleki geçmiş, faaliyet alanları ve fotoğraf henüz
 * sağlanmadı; bu alanlar `null` / `[]` kalır ve sitede "Eklenecek" olarak görünür.
 * Arabulucu sicil numarası teyit edilmediği için `mediator` boştur (unvanda "Arabulucu"
 * ifadesi sağlanan bilgiye dayanır; sicil bilgisi teyitle eklenecek).
 */
export const attorneyRecords: AttorneyInput[] = [
  {
    slug: "mustafa-okay",
    fullName: "Av. Mustafa OKAY",
    title: "Kurucu Avukat",
    summary: null,
    barAssociation: null,
    barRegistrationNo: null,
    photo: null,
    education: [],
    experience: [],
    practiceAreas: [],
    mediator: null,
    sortOrder: 1,
    published: true,
  },
  {
    slug: "fatma-okay",
    fullName: "Arb. Av. Fatma OKAY",
    title: "Kurucu Avukat, Arabulucu",
    summary: null,
    barAssociation: null,
    barRegistrationNo: null,
    photo: null,
    education: [],
    experience: [],
    practiceAreas: [],
    mediator: null,
    sortOrder: 2,
    published: true,
  },
]

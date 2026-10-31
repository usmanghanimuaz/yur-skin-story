import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LOCALES = [
  { code: "en", label: "English" }, { code: "es", label: "Español" }, { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" }, { code: "de", label: "Deutsch" }, { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" }, { code: "ur", label: "اردو" }, { code: "ur-Latn", label: "Urdu (Roman)" },
] as const;
export type Locale = (typeof LOCALES)[number]["code"];
export const isRtl = (l: string) => l === "ur";

type Keys = "overview" | "checkins" | "compare" | "routine" | "catalogue" | "newCheckin" | "managePeople" | "skinProfile" | "settings" | "export" | "securityLog" | "signOut" | "admin" | "help" | "language" | "disclaimer" | "next" | "back" | "finish" | "deleteAccount";
const en: Record<Keys, string> = { overview: "Overview", checkins: "My check-ins", compare: "Compare", routine: "My routine", catalogue: "Catalogue", newCheckin: "New check-in", managePeople: "Manage people", skinProfile: "Skin profile", settings: "Settings", export: "Export data", securityLog: "Security log", signOut: "Sign out", admin: "Admin", help: "Need a little help?", language: "Language", disclaimer: "Cosmetic guidance only — not a medical diagnosis.", next: "Continue", back: "Back", finish: "Finish", deleteAccount: "Delete my account" };
const dict: Record<Locale, Record<Keys, string>> = {
  en,
  es: { overview: "Resumen", checkins: "Mis registros", compare: "Comparar", routine: "Mi rutina", catalogue: "Catálogo", newCheckin: "Nuevo registro", managePeople: "Gestionar personas", skinProfile: "Perfil de piel", settings: "Ajustes", export: "Exportar datos", securityLog: "Registro de seguridad", signOut: "Cerrar sesión", admin: "Administración", help: "¿Necesitas ayuda?", language: "Idioma", disclaimer: "Solo orientación cosmética, no un diagnóstico médico.", next: "Continuar", back: "Atrás", finish: "Terminar", deleteAccount: "Eliminar mi cuenta" },
  fr: { overview: "Aperçu", checkins: "Mes bilans", compare: "Comparer", routine: "Ma routine", catalogue: "Catalogue", newCheckin: "Nouveau bilan", managePeople: "Gérer les personnes", skinProfile: "Profil de peau", settings: "Paramètres", export: "Exporter", securityLog: "Journal de sécurité", signOut: "Se déconnecter", admin: "Administration", help: "Besoin d'aide ?", language: "Langue", disclaimer: "Conseils cosmétiques uniquement, pas un diagnostic médical.", next: "Continuer", back: "Retour", finish: "Terminer", deleteAccount: "Supprimer mon compte" },
  it: { overview: "Panoramica", checkins: "I miei check-in", compare: "Confronta", routine: "La mia routine", catalogue: "Catalogo", newCheckin: "Nuovo check-in", managePeople: "Gestisci persone", skinProfile: "Profilo pelle", settings: "Impostazioni", export: "Esporta dati", securityLog: "Registro sicurezza", signOut: "Esci", admin: "Amministrazione", help: "Serve aiuto?", language: "Lingua", disclaimer: "Solo indicazioni cosmetiche, non una diagnosi medica.", next: "Continua", back: "Indietro", finish: "Fine", deleteAccount: "Elimina il mio account" },
  de: { overview: "Übersicht", checkins: "Meine Check-ins", compare: "Vergleichen", routine: "Meine Routine", catalogue: "Katalog", newCheckin: "Neuer Check-in", managePeople: "Personen verwalten", skinProfile: "Hautprofil", settings: "Einstellungen", export: "Daten exportieren", securityLog: "Sicherheitsprotokoll", signOut: "Abmelden", admin: "Verwaltung", help: "Brauchst du Hilfe?", language: "Sprache", disclaimer: "Nur kosmetische Hinweise – keine medizinische Diagnose.", next: "Weiter", back: "Zurück", finish: "Fertig", deleteAccount: "Mein Konto löschen" },
  pt: { overview: "Visão geral", checkins: "Meus registos", compare: "Comparar", routine: "Minha rotina", catalogue: "Catálogo", newCheckin: "Novo registo", managePeople: "Gerir pessoas", skinProfile: "Perfil da pele", settings: "Definições", export: "Exportar dados", securityLog: "Registo de segurança", signOut: "Sair", admin: "Administração", help: "Precisa de ajuda?", language: "Idioma", disclaimer: "Apenas orientação cosmética, não um diagnóstico médico.", next: "Continuar", back: "Voltar", finish: "Concluir", deleteAccount: "Eliminar a minha conta" },
  nl: { overview: "Overzicht", checkins: "Mijn check-ins", compare: "Vergelijken", routine: "Mijn routine", catalogue: "Catalogus", newCheckin: "Nieuwe check-in", managePeople: "Personen beheren", skinProfile: "Huidprofiel", settings: "Instellingen", export: "Gegevens exporteren", securityLog: "Beveiligingslog", signOut: "Uitloggen", admin: "Beheer", help: "Hulp nodig?", language: "Taal", disclaimer: "Alleen cosmetisch advies, geen medische diagnose.", next: "Doorgaan", back: "Terug", finish: "Klaar", deleteAccount: "Mijn account verwijderen" },
  ur: { overview: "جائزہ", checkins: "میرے چیک اِن", compare: "موازنہ", routine: "میرا معمول", catalogue: "فہرست", newCheckin: "نیا چیک اِن", managePeople: "افراد کا انتظام", skinProfile: "جلد کی پروفائل", settings: "ترتیبات", export: "ڈیٹا ڈاؤن لوڈ", securityLog: "سکیورٹی ریکارڈ", signOut: "سائن آؤٹ", admin: "منتظم", help: "مدد چاہیے؟", language: "زبان", disclaimer: "صرف کاسمیٹک رہنمائی — طبی تشخیص نہیں۔", next: "آگے", back: "واپس", finish: "مکمل", deleteAccount: "میرا اکاؤنٹ حذف کریں" },
  "ur-Latn": { overview: "Jaiza", checkins: "Mere check-in", compare: "Muqabla", routine: "Mera maamool", catalogue: "Fehrist", newCheckin: "Naya check-in", managePeople: "Afraad ka intezam", skinProfile: "Jild ki profile", settings: "Settings", export: "Data download", securityLog: "Security record", signOut: "Sign out", admin: "Muntazim", help: "Madad chahiye?", language: "Zaban", disclaimer: "Sirf cosmetic rehnumai — tibbi tashkhees nahi.", next: "Aage", back: "Wapas", finish: "Mukammal", deleteAccount: "Mera account hazf karein" },
};

export function translate(locale: string, key: Keys): string {
  return (dict as Record<string, Record<Keys, string>>)[locale]?.[key] ?? en[key];
}

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (k: Keys) => string };
const I18n = createContext<Ctx>({ locale: "en", setLocale: () => {}, t: (k) => en[k] });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setL] = useState<Locale>("en");
  useEffect(() => { const s = localStorage.getItem("skintwin-locale"); if (s && LOCALES.some((l) => l.code === s)) setL(s as Locale); }, []);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr"; }, [locale]);
  const setLocale = (l: Locale) => { localStorage.setItem("skintwin-locale", l); setL(l); };
  return <I18n.Provider value={{ locale, setLocale, t: (k) => translate(locale, k) }}>{children}</I18n.Provider>;
}
export const useI18n = () => useContext(I18n);

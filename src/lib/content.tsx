import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { contentOverrides } from "@/lib/admin.functions";
import { contentWithOverride, toContentMap, type ContentMap } from "@/lib/content-overrides";
import { CONTENT_DEFAULTS } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

type Ctx = { c: (page: string, key: string) => string; map: ContentMap };

const Content = createContext<Ctx>({ c: (page, key) => CONTENT_DEFAULTS[page]?.[key] ?? key, map: {} });

/** Loads maintainer-written page wording once and hands every page a reader that follows the chosen language. */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<ContentMap>({});
  const { locale } = useI18n();
  useEffect(() => { contentOverrides().then((rows) => setMap(toContentMap(rows))).catch(() => {}); }, []);
  const c = (page: string, key: string) => contentWithOverride(map, locale, page, key, CONTENT_DEFAULTS[page]?.[key] ?? key);
  return <Content.Provider value={{ c, map }}>{children}</Content.Provider>;
}

export const useContent = () => useContext(Content);

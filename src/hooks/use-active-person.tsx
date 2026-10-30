import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { peopleOptions, type Person } from "@/lib/data";

type Ctx = { people: Person[]; active: Person | null; setActiveId: (id: string) => void; loading: boolean };
const ActivePerson = createContext<Ctx>({ people: [], active: null, setActiveId: () => {}, loading: true });

export function ActivePersonProvider({ children }: { children: ReactNode }) {
  const { data: people = [], isLoading } = useQuery(peopleOptions);
  const [activeId, setActive] = useState("");
  useEffect(() => setActive(localStorage.getItem("skintwin-person") ?? ""), []);
  const setActiveId = (id: string) => { localStorage.setItem("skintwin-person", id); setActive(id); };
  const active = people.find((p) => p.id === activeId) ?? people.find((p) => p.is_me) ?? people[0] ?? null;
  return <ActivePerson.Provider value={{ people, active, setActiveId, loading: isLoading }}>{children}</ActivePerson.Provider>;
}
export const useActivePerson = () => useContext(ActivePerson);
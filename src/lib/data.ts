import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Person = Database["public"]["Tables"]["person_profiles"]["Row"];
export type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];
export type Product = Database["public"]["Tables"]["skin_products"]["Row"];
export type Account = Database["public"]["Tables"]["profiles"]["Row"];

export const accountOptions = queryOptions({
  queryKey: ["account"],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please sign in.");
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (error) throw error;
    return { account: data, user };
  },
});
export const peopleOptions = queryOptions({
  queryKey: ["people"],
  queryFn: async () => {
    const { data, error } = await supabase.from("person_profiles").select("*").order("created_at");
    if (error) throw error;
    return data;
  },
});
export const checkInsOptions = (profileId: string, limit = 50) => queryOptions({
  queryKey: ["check-ins", profileId, limit],
  queryFn: async () => {
    if (!profileId) return [];
    const { data, error } = await supabase.from("check_ins").select("*").eq("profile_id", profileId).order("check_in_date", { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  },
});
export const productsOptions = (profileId: string) => queryOptions({
  queryKey: ["products", profileId],
  queryFn: async () => {
    if (!profileId) return [];
    const { data, error } = await supabase.from("skin_products").select("*").eq("profile_id", profileId).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
export const activityOptions = queryOptions({
  queryKey: ["activity"],
  queryFn: async () => {
    const { data, error } = await supabase.from("account_activity").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return data;
  },
});
export async function logActivity(event: "sign_in" | "password_changed" | "settings_updated" | "data_export" | "data_access", detail?: string) {
  await supabase.from("account_activity").insert({ event, detail });
}
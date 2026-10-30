import { describe,it,expect } from 'vitest';
import { buildAdvice } from '@/lib/advice';
import { normalizeYoucamScores, ANALYSIS_LIMITS } from '@/lib/skin';
import { productImpact } from '@/lib/products';
describe('Skin safety and real measurements',()=>{
 it('does not invent scores from an unrecognised result',()=>expect(normalizeYoucamScores({status:'success'})).toBeNull());
 it('excludes retinol in pregnancy',()=>expect(buildAdvice({fine_lines:10},{pregnancy:true},10).some(r=>r.ingredient==='retinol')).toBe(false));
 it('excludes salicylates for aspirin allergy',()=>expect(buildAdvice({clarity:10},{pregnancy:false,allergies:'aspirin'},10).some(r=>r.ingredient==='salicylic acid')).toBe(false));
 it('needs measured check-ins on both sides of a product start',()=>expect(productImpact({id:'p',started_date:'2026-10-10',stopped_date:null},[]).enoughData).toBe(false));
 it('keeps explicit provisional fair use limits',()=>expect(ANALYSIS_LIMITS).toEqual({perTenMinutes:3,perDay:10,appPerDay:500}));
});

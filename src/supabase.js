import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY;
function publicKey(value) {
  if(value?.startsWith('sb_secret_'))return false;
  if(value?.startsWith('sb_publishable_'))return true;
  try{return JSON.parse(atob(value.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon';}catch{return false;}
}
export const configured=!!url&&/^https?:\/\//.test(url)&&publicKey(key);
export const supabase=configured?createClient(url,key,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}}):null;

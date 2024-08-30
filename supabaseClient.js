// /src/js/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://eosldzhkdxgyirkguezf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2xkemhrZHhneWlya2d1ZXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MjAxOTMsImV4cCI6MjAzOTA5NjE5M30.BSDQzPpZgDyU6pcavB95z-HaM-nBc2DZVCQAxJGvaQ4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


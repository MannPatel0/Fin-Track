import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtjqzwqaoribjbqapybe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0anF6d3Fhb3JpYmpicWFweWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NDc3MTEsImV4cCI6MjA1NTIyMzcxMX0.UBSC6ylMp2x8dI_-aAo6u_-uhIq5rAVwUalDD-ykYH0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
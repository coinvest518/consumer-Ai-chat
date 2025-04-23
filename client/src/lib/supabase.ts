import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffvvesrqtdktayjwurwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdnZlc3JxdGRrdGF5and1cndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzODAxMDksImV4cCI6MjA2MDk1NjEwOX0._zC7055iriJSN3-HUTj71Bn_-auGn1WfrWDwqLPPUU4';

export const supabase = createClient(supabaseUrl, supabaseKey);
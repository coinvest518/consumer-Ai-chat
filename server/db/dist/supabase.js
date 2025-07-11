"use strict";
exports.__esModule = true;
exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
// Use environment variables (server-side naming)
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ffvvesrqtdktayjwurwm.supabase.co';
var supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdnZlc3JxdGRrdGF5and1cndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzODAxMDksImV4cCI6MjA2MDk1NjEwOX0._zC7055iriJSN3-HUTj71Bn_-auGn1WfrWDwqLPPUU4';
exports.supabase = supabase_js_1.createClient(supabaseUrl, supabaseKey);

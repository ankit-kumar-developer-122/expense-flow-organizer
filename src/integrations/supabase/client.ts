// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://roeimgzylfaknufaxmot.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZWltZ3p5bGZha251ZmF4bW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDQzNDksImV4cCI6MjA1OTI4MDM0OX0.Pd0RiI321CRM2LJKWjM2eBE6vYqwyabj_HkY_bUnBy4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
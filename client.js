import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://qepfefzbdqtpicaeyjcu.supabase.co'
const supabasePublishableKey = 'sb_publishable_5IxAFqMSm17tjN8xBYcd1w_elk8WDoF'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

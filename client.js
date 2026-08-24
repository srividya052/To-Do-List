import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qepfefzbdqtpicaeyjcu.supabase.co'
const supabasePublishableKey = 'sb_publishable_5IxAFqMSm17tjN8xBYcd1w_elk8WDoF'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

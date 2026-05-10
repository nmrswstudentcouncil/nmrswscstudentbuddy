import { createClient } from '@supabase/supabase-js'

// ใส่ URL และ Key ที่ได้จากหน้า Settings ของ Supabase
const supabaseUrl = 'https://lxoakwhyeohaggpnxlqw.supabase.co'
const supabaseAnonKey = 'sb_publishable_Nq4htSpnHWfxT8Y2CUdDCQ_G5Lyf7vY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
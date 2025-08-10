export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_plan: 'basic' | 'pro'
          subscription_status: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id: string | null
          admin_language: 'en' | 'hr' | 'de' | 'it'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          subscription_plan?: 'basic' | 'pro'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id?: string | null
          admin_language?: 'en' | 'hr' | 'de' | 'it'
        }
        Update: {
          email?: string
          full_name?: string | null
          subscription_plan?: 'basic' | 'pro'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id?: string | null
          admin_language?: 'en' | 'hr' | 'de' | 'it'
        }
      }
      hotels: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          description: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          primary_language: 'en' | 'hr' | 'de' | 'it'
          secondary_language: 'en' | 'hr' | 'de' | 'it'
          supported_languages: string[]
          custom_background_color: string
          custom_accent_color: string
          custom_text_color: string
          custom_font_family: string
          custom_welcome_title: string
          custom_welcome_subtitle: string
          custom_phone_instructions: string
          logo_asset_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          owner_id: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          primary_language?: 'en' | 'hr' | 'de' | 'it'
          secondary_language?: 'en' | 'hr' | 'de' | 'it'
          supported_languages?: string[]
          custom_background_color?: string
          custom_accent_color?: string
          custom_text_color?: string
          custom_font_family?: string
          custom_welcome_title?: string
          custom_welcome_subtitle?: string
          custom_phone_instructions?: string
          logo_asset_id?: string | null
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          primary_language?: 'en' | 'hr' | 'de' | 'it'
          secondary_language?: 'en' | 'hr' | 'de' | 'it'
          supported_languages?: string[]
          custom_background_color?: string
          custom_accent_color?: string
          custom_text_color?: string
          custom_font_family?: string
          custom_welcome_title?: string
          custom_welcome_subtitle?: string
          custom_phone_instructions?: string
          logo_asset_id?: string | null
        }
      }
      hotel_content: {
        Row: {
          id: string
          hotel_id: string
          language: 'en' | 'hr' | 'de' | 'it'
          section_type: 'welcome' | 'dining' | 'services' | 'activities' | 'contact'
          title: string
          content: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          hotel_id: string
          language: 'en' | 'hr' | 'de' | 'it'
          section_type: 'welcome' | 'dining' | 'services' | 'activities' | 'contact'
          title: string
          content?: string | null
          order_index?: number
          is_active?: boolean
        }
        Update: {
          title?: string
          content?: string | null
          order_index?: number
          is_active?: boolean
        }
      }
      hotel_assets: {
        Row: {
          id: string
          hotel_id: string
          file_name: string
          file_path: string
          file_type: 'image' | 'pdf'
          file_size: number | null
          section_type: 'welcome' | 'dining' | 'services' | 'activities' | 'contact' | 'general' | null
          language: 'en' | 'hr' | 'de' | 'it' | null
          created_at: string
        }
        Insert: {
          hotel_id: string
          file_name: string
          file_path: string
          file_type: 'image' | 'pdf'
          file_size?: number | null
          section_type?: 'welcome' | 'dining' | 'services' | 'activities' | 'contact' | 'general' | null
          language?: 'en' | 'hr' | 'de' | 'it' | null
        }
        Update: {
          file_name?: string
          section_type?: 'welcome' | 'dining' | 'services' | 'activities' | 'contact' | 'general' | null
          language?: 'en' | 'hr' | 'de' | 'it' | null
        }
      }
      accordion_sections: {
        Row: {
          id: string
          hotel_id: string
          language: 'en' | 'hr' | 'de' | 'it'
          title: string
          section_key: string
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          hotel_id: string
          language: 'en' | 'hr' | 'de' | 'it'
          title: string
          section_key: string
          order_index?: number
          is_active?: boolean
        }
        Update: {
          title?: string
          section_key?: string
          order_index?: number
          is_active?: boolean
        }
      }
      accordion_blocks: {
        Row: {
          id: string
          section_id: string
          title: string
          description: string | null
          image_asset_id: string | null
          external_url: string | null
          custom_image_url: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          section_id: string
          title: string
          description?: string | null
          image_asset_id?: string | null
          external_url?: string | null
          custom_image_url?: string | null
          order_index?: number
          is_active?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          image_asset_id?: string | null
          external_url?: string | null
          custom_image_url?: string | null
          order_index?: number
          is_active?: boolean
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Hotel = Database['public']['Tables']['hotels']['Row']
export type HotelContent = Database['public']['Tables']['hotel_content']['Row']
export type HotelAsset = Database['public']['Tables']['hotel_assets']['Row']
export type AccordionSection = Database['public']['Tables']['accordion_sections']['Row']
export type AccordionBlock = Database['public']['Tables']['accordion_blocks']['Row']

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          excerpt: string | null
          description: string | null
          category: string
          language: string
          author: string | null
          cover_image: string | null
          image_alt: string | null
          keywords: string[] | null
          tags: string[] | null
          date: string
          published: boolean
          featured: boolean | null
          read_time: string | null
          generated_by: string | null
          score: number | null
          sources: Json | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          excerpt?: string | null
          description?: string | null
          category: string
          language?: string
          author?: string | null
          cover_image?: string | null
          image_alt?: string | null
          keywords?: string[] | null
          tags?: string[] | null
          date: string
          published?: boolean
          featured?: boolean | null
          read_time?: string | null
          generated_by?: string | null
          score?: number | null
          sources?: Json | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          excerpt?: string | null
          description?: string | null
          category?: string
          language?: string
          author?: string | null
          cover_image?: string | null
          image_alt?: string | null
          keywords?: string[] | null
          tags?: string[] | null
          date?: string
          published?: boolean
          featured?: boolean | null
          read_time?: string | null
          generated_by?: string | null
          score?: number | null
          sources?: Json | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

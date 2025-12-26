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
      },
      post_likes: {
        Row: {
          id: string
          post_slug: string
          user_ip: string
          created_at: string
        }
        Insert: {
          id?: string
          post_slug: string
          user_ip: string
          created_at?: string
        }
        Update: {
          id?: string
          post_slug?: string
          user_ip?: string
          created_at?: string
        }
        Relationships: []
      },
      post_stats: {
        Row: {
          id: string
          slug: string
          title: string
          views: number
          likes: number
          last_viewed_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          views?: number
          likes?: number
          last_viewed_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          views?: number
          likes?: number
          last_viewed_at?: string | null
        }
        Relationships: []
      },
      post_views: {
        Row: {
          id: string
          post_slug: string
          viewed_at: string
          user_ip: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          post_slug: string
          viewed_at?: string
          user_ip?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          post_slug?: string
          viewed_at?: string
          user_ip?: string | null
          user_agent?: string | null
        }
        Relationships: []
      },
      comments: {
        Row: {
          id: string
          post_slug: string
          author_name: string
          author_email: string
          author_website: string | null
          content: string
          approved: boolean
          spam_score: number
          created_at: string
          updated_at: string
          approved_at: string | null
          user_ip: string | null
        }
        Insert: {
          id?: string
          post_slug: string
          author_name: string
          author_email: string
          author_website?: string | null
          content: string
          approved?: boolean
          spam_score?: number
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          user_ip?: string | null
        }
        Update: {
          id?: string
          post_slug?: string
          author_name?: string
          author_email?: string
          author_website?: string | null
          content?: string
          approved?: boolean
          spam_score?: number
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_post_views: {
        Args: {
          p_slug: string
          p_ip?: string | null
          p_user_agent?: string | null
        }
        Returns: void
      },
      toggle_post_like: {
        Args: {
          p_slug: string
          p_user_ip?: string | null
        }
        Returns: { liked: boolean; action: 'added' | 'removed' }
      },
      get_post_stats: {
        Args: {
          p_slug: string
        }
        Returns: { views: number; likes: number; slug: string; title: string | null; last_viewed_at: string | null }
      },
      refresh_post_stats: {
        Args: Record<string, never>
        Returns: void
      },
      approve_comment: {
        Args: {
          comment_id: string
        }
        Returns: void
      },
      search_posts: {
        Args: {
          search_query: string
          search_language: string
          max_results: number
        }
        Returns: {
          slug: string
          title: string
          excerpt: string
          category: string
          date: string
          cover_image: string | null
          rank: number
        }[]
      },
      get_related_posts: {
        Args: {
          p_slug: string
          p_limit: number
        }
        Returns: {
          slug: string
          title: string
          excerpt: string
          cover_image: string | null
          similarity_score: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * Tipos de la base de datos de Supabase.
 *
 * Mantener en sincronía con `supabase/schema.sql`. Si cambias el esquema,
 * puedes regenerar este archivo con:
 *   npx supabase gen types typescript --project-id TU_PROJECT_ID --schema public
 * (y luego re-exportar los alias de dominio del final).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Tipos de dominio
// ---------------------------------------------------------------------------

export type PlanNegocio = "web" | "mantenimiento" | "premium";

export type TipoClick =
  | "whatsapp"
  | "llamada"
  | "sitio_web"
  | "como_llegar"
  | "vista_ficha";

export type FuenteClick = "ficha" | "listado" | "busqueda" | "home";

export type DiaSemana = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

/** Resultado de un evento de sincronización CRM → Directorio. */
export type ResultadoSync =
  | "procesando"
  | "publicado"
  | "sin_match"
  | "duplicado"
  | "error";

/** Pregunta frecuente de una página editorial categoría×zona. */
export interface FaqZonal {
  pregunta: string;
  respuesta: string;
}

/** Franja de atención de un día. `null` = cerrado ese día. */
export interface FranjaHoraria {
  /** Hora de apertura en formato HH:mm (24h). */
  abre: string;
  /** Hora de cierre en formato HH:mm (24h). */
  cierra: string;
}

/** Horarios semanales: `{"lun": {"abre":"08:00","cierra":"18:00"}, "dom": null}` */
export type Horarios = Partial<Record<DiaSemana, FranjaHoraria | null>>;

// ---------------------------------------------------------------------------
// Esquema Supabase
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string;
          nota: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          nota?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          nota?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      zonas: {
        Row: {
          id: string;
          slug: string;
          nombre: string;
          ciudad: string;
          departamento: string;
          descripcion_seo: string;
          lat: number;
          lng: number;
          zoom: number;
          activa: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          nombre: string;
          ciudad: string;
          departamento: string;
          descripcion_seo: string;
          lat: number;
          lng: number;
          zoom?: number;
          activa?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          nombre?: string;
          ciudad?: string;
          departamento?: string;
          descripcion_seo?: string;
          lat?: number;
          lng?: number;
          zoom?: number;
          activa?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      categorias: {
        Row: {
          id: string;
          slug: string;
          nombre: string;
          icono: string;
          descripcion_seo: string;
          orden: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          nombre: string;
          icono?: string;
          descripcion_seo?: string;
          orden?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          nombre?: string;
          icono?: string;
          descripcion_seo?: string;
          orden?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      negocios: {
        Row: {
          id: string;
          slug: string;
          nombre: string;
          categoria_id: string;
          zona_id: string;
          descripcion_corta: string;
          descripcion_larga: string;
          direccion: string;
          barrio: string | null;
          lat: number;
          lng: number;
          telefono: string | null;
          whatsapp: string | null;
          sitio_web: string | null;
          email: string | null;
          instagram: string | null;
          facebook: string | null;
          horarios: Json;
          logo_url: string | null;
          foto_portada_url: string | null;
          galeria: string[];
          servicios: string[];
          palabras_clave: string[];
          destacado: boolean;
          verificado: boolean;
          es_ejemplo: boolean;
          activo: boolean;
          plan: PlanNegocio;
          fecha_ingreso: string;
          created_at: string;
          updated_at: string;
          busqueda: unknown;
        };
        Insert: {
          id?: string;
          slug: string;
          nombre: string;
          categoria_id: string;
          zona_id: string;
          descripcion_corta: string;
          descripcion_larga: string;
          direccion: string;
          barrio?: string | null;
          lat: number;
          lng: number;
          telefono?: string | null;
          whatsapp?: string | null;
          sitio_web?: string | null;
          email?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          horarios?: Json;
          logo_url?: string | null;
          foto_portada_url?: string | null;
          galeria?: string[];
          servicios?: string[];
          palabras_clave?: string[];
          destacado?: boolean;
          verificado?: boolean;
          es_ejemplo?: boolean;
          activo?: boolean;
          plan?: PlanNegocio;
          fecha_ingreso?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          nombre?: string;
          categoria_id?: string;
          zona_id?: string;
          descripcion_corta?: string;
          descripcion_larga?: string;
          direccion?: string;
          barrio?: string | null;
          lat?: number;
          lng?: number;
          telefono?: string | null;
          whatsapp?: string | null;
          sitio_web?: string | null;
          email?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          horarios?: Json;
          logo_url?: string | null;
          foto_portada_url?: string | null;
          galeria?: string[];
          servicios?: string[];
          palabras_clave?: string[];
          destacado?: boolean;
          verificado?: boolean;
          es_ejemplo?: boolean;
          activo?: boolean;
          plan?: PlanNegocio;
          fecha_ingreso?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "negocios_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "negocios_zona_id_fkey";
            columns: ["zona_id"];
            isOneToOne: false;
            referencedRelation: "zonas";
            referencedColumns: ["id"];
          },
        ];
      };
      resenas: {
        Row: {
          id: string;
          negocio_id: string;
          nombre_autor: string;
          calificacion: number;
          comentario: string | null;
          aprobada: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          negocio_id: string;
          nombre_autor: string;
          calificacion: number;
          comentario?: string | null;
          aprobada?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          negocio_id?: string;
          nombre_autor?: string;
          calificacion?: number;
          comentario?: string | null;
          aprobada?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resenas_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks: {
        Row: {
          id: number;
          negocio_id: string;
          tipo: TipoClick;
          fuente: FuenteClick;
          created_at: string;
        };
        Insert: {
          id?: never;
          negocio_id: string;
          tipo: TipoClick;
          fuente?: FuenteClick;
          created_at?: string;
        };
        Update: {
          id?: never;
          negocio_id?: string;
          tipo?: TipoClick;
          fuente?: FuenteClick;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clicks_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["id"];
          },
        ];
      };
      sync_eventos: {
        Row: {
          evento_id: string;
          origen: string;
          resultado: ResultadoSync;
          negocio_id: string | null;
          payload: Json;
          detalle: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          evento_id: string;
          origen: string;
          resultado?: ResultadoSync;
          negocio_id?: string | null;
          payload: Json;
          detalle?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          evento_id?: string;
          origen?: string;
          resultado?: ResultadoSync;
          negocio_id?: string | null;
          payload?: Json;
          detalle?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sync_eventos_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["id"];
          },
        ];
      };
      // Tablas de Fábrica de Demos (misma base de datos, otra app).
      // Solo LECTURA desde este proyecto; el schema lo administra ese repo.
      demo_negocios: {
        Row: {
          id: string;
          slug: string;
          nombre: string;
          sector_id: string;
          telefono: string | null;
          whatsapp: string | null;
          direccion: string;
          ciudad: string;
          zona: string | null;
          latitud: number | null;
          longitud: number | null;
          foto_fachada_url: string | null;
          logo_url: string | null;
          estado: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      demo_sectores: {
        Row: {
          id: string;
          nombre: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      contenido_zonal: {
        Row: {
          id: string;
          categoria_id: string;
          zona_id: string;
          intro_html: string;
          faqs: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria_id: string;
          zona_id: string;
          intro_html: string;
          faqs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          categoria_id?: string;
          zona_id?: string;
          intro_html?: string;
          faqs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contenido_zonal_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contenido_zonal_zona_id_fkey";
            columns: ["zona_id"];
            isOneToOne: false;
            referencedRelation: "zonas";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      buscar_negocios: {
        Args: {
          q: string;
          p_zona?: string | null;
          p_limite?: number;
        };
        Returns: {
          id: string;
          slug: string;
          nombre: string;
          descripcion_corta: string;
          logo_url: string | null;
          foto_portada_url: string | null;
          destacado: boolean;
          verificado: boolean;
          zona_id: string;
          categoria_id: string;
          relevancia: number;
        }[];
      };
      es_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      f_unaccent: {
        Args: { texto: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ---------------------------------------------------------------------------
// Alias de dominio (los que usa la aplicación)
// ---------------------------------------------------------------------------

export type Zona = Database["public"]["Tables"]["zonas"]["Row"];
export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type Negocio = Database["public"]["Tables"]["negocios"]["Row"];
export type Resena = Database["public"]["Tables"]["resenas"]["Row"];
export type Click = Database["public"]["Tables"]["clicks"]["Row"];

export type NegocioInsert = Database["public"]["Tables"]["negocios"]["Insert"];
export type NegocioUpdate = Database["public"]["Tables"]["negocios"]["Update"];

export type SyncEvento = Database["public"]["Tables"]["sync_eventos"]["Row"];
export type DemoNegocio = Database["public"]["Tables"]["demo_negocios"]["Row"];
export type DemoSector = Database["public"]["Tables"]["demo_sectores"]["Row"];

/** Resultado de la RPC buscar_negocios. */
export type ResultadoBusqueda =
  Database["public"]["Functions"]["buscar_negocios"]["Returns"][number];

/** Negocio con su zona y categoría anidadas (select con joins). */
export type NegocioConRelaciones = Negocio & {
  zona: Zona;
  categoria: Categoria;
};

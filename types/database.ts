export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          order_number: number;
          created_at: string;
          customer_name: string;
          email: string;
          phone: string | null;
          status: string;
          currency: string;
          subtotal_cents: number;
          shipping_cents: number;
          gst_cents: number;
          total_cents: number;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          notes: string | null;
          shipping_address_line1: string | null;
          shipping_address_line2: string | null;
          shipping_city: string | null;
          shipping_state: string | null;
          shipping_postcode: string | null;
          shipping_country: string | null;
        };
        Insert: {
          id?: string;
          order_number?: number;
          created_at?: string;
          customer_name: string;
          email: string;
          phone?: string | null;
          status?: string;
          currency?: string;
          subtotal_cents?: number;
          shipping_cents?: number;
          gst_cents?: number;
          total_cents?: number;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          notes?: string | null;
          shipping_address_line1?: string | null;
          shipping_address_line2?: string | null;
          shipping_city?: string | null;
          shipping_state?: string | null;
          shipping_postcode?: string | null;
          shipping_country?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_files: {
        Row: {
          id: string;
          order_id: string;
          created_at: string;
          original_filename: string;
          storage_path: string;
          mime_type: string | null;
          file_size_bytes: number;
          validation_status: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          created_at?: string;
          original_filename: string;
          storage_path: string;
          mime_type?: string | null;
          file_size_bytes: number;
          validation_status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_files"]["Insert"]>;
      };
      quote_inputs: {
        Row: {
          id: string;
          order_id: string;
          file_id: string | null;
          original_filename: string | null;
          material: string;
          colour: string | null;
          layer_height_mm: number | null;
          infill_percent: number | null;
          quantity: number;
          bounding_box_x_mm: number | null;
          bounding_box_y_mm: number | null;
          bounding_box_z_mm: number | null;
          estimated_volume_cm3: number | null;
          estimated_print_time_minutes: number | null;
          shipping_method: string | null;
          line_total_cents: number | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          file_id?: string | null;
          original_filename?: string | null;
          material: string;
          colour?: string | null;
          layer_height_mm?: number | null;
          infill_percent?: number | null;
          quantity?: number;
          bounding_box_x_mm?: number | null;
          bounding_box_y_mm?: number | null;
          bounding_box_z_mm?: number | null;
          estimated_volume_cm3?: number | null;
          estimated_print_time_minutes?: number | null;
          shipping_method?: string | null;
          line_total_cents?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["quote_inputs"]["Insert"]>;
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["order_status_history"]["Insert"]
        >;
      };
      colours: {
        Row: {
          id: string;
          name: string;
          hex: string;
          available: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          hex?: string;
          available?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["colours"]["Insert"]>;
      };
    };
  };
}

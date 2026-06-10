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
 profiles: {
 Row: {
 id: string;
 user_id: string;
 name: string | null;
 avatar_url: string | null;
 role: "admin" | "user";
 created_at: string;
 };
 Insert: {
 id?: string;
 user_id: string;
 name?: string | null;
 avatar_url?: string | null;
 role?: "admin" | "user";
 created_at?: string;
 };
 Update: {
 id?: string;
 user_id?: string;
 name?: string | null;
 avatar_url?: string | null;
 role?: "admin" | "user";
 created_at?: string;
 };
 Relationships: [];
 };
 nuclei: {
 Row: {
 id: string;
 name: string;
 created_by: string;
 created_at: string;
 };
 Insert: {
 id?: string;
 name: string;
 created_by: string;
 created_at?: string;
 };
 Update: {
 id?: string;
 name?: string;
 created_by?: string;
 created_at?: string;
 };
 Relationships: [];
 };
 nuclei_members: {
 Row: {
 id: string;
 nuclei_id: string;
 user_id: string;
 role: "father" | "mother" | "guardian" | "child" | "member";
 created_at: string;
 };
 Insert: {
 id?: string;
 nuclei_id: string;
 user_id: string;
 role?: "father" | "mother" | "guardian" | "child" | "member";
 created_at?: string;
 };
 Update: {
 id?: string;
 nuclei_id?: string;
 user_id?: string;
 role?: "father" | "mother" | "guardian" | "child" | "member";
 created_at?: string;
 };
 Relationships: [];
 };
 tasks: {
 Row: {
 id: string;
 nuclei_id: string;
 created_by: string;
 title: string;
 description: string | null;
 section: "inbox" | "today" | "upcoming" | "anytime" | "someday";
 due_date: string | null;
 project_id: string | null;
 area_id: string | null;
 is_completed: boolean;
 completed_at: string | null;
 position: number | null;
 created_at: string;
 updated_at: string;
 };
 Insert: {
 id?: string;
 nuclei_id: string;
 created_by: string;
 title: string;
 description?: string | null;
 section?: "inbox" | "today" | "upcoming" | "anytime" | "someday";
 due_date?: string | null;
 project_id?: string | null;
 area_id?: string | null;
 is_completed?: boolean;
 completed_at?: string | null;
 position?: number | null;
 created_at?: string;
 updated_at?: string;
 };
 Update: {
 id?: string;
 nuclei_id?: string;
 created_by?: string;
 title?: string;
 description?: string | null;
 section?: "inbox" | "today" | "upcoming" | "anytime" | "someday";
 due_date?: string | null;
 project_id?: string | null;
 area_id?: string | null;
 is_completed?: boolean;
 completed_at?: string | null;
 position?: number | null;
 created_at?: string;
 updated_at?: string;
 };
 Relationships: [];
 };
 projects: {
 Row: {
 id: string;
 nuclei_id: string;
 name: string;
 area_id: string | null;
 position: number | null;
 created_at: string;
 };
 Insert: {
 id?: string;
 nuclei_id: string;
 name: string;
 area_id?: string | null;
 position?: number | null;
 created_at?: string;
 };
 Update: {
 id?: string;
 nuclei_id?: string;
 name?: string;
 area_id?: string | null;
 position?: number | null;
 created_at?: string;
 };
 Relationships: [];
 };
 areas: {
 Row: {
 id: string;
 nuclei_id: string;
 name: string;
 position: number | null;
 created_at: string;
 };
 Insert: {
 id?: string;
 nuclei_id: string;
 name: string;
 position?: number | null;
 created_at?: string;
 };
 Update: {
 id?: string;
 nuclei_id?: string;
 name?: string;
 position?: number | null;
 created_at?: string;
 };
 Relationships: [];
 };
 audit_logs: {
 Row: {
 id: string;
 user_id: string;
 event_type: string;
 metadata: Json | null;
 created_at: string;
 };
 Insert: {
 id?: string;
 user_id: string;
 event_type: string;
 metadata?: Json | null;
 created_at?: string;
 };
 Update: {
 id?: string;
 user_id?: string;
 event_type?: string;
 metadata?: Json | null;
 created_at?: string;
 };
 Relationships: [];
 };
 };
 Views: Record<string, never>;
 Functions: Record<string, never>;
 Enums: Record<string, never>;
 };
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  timezone: string;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  user_id: string;
  is_primary: boolean;
  google_calendar_id?: string | null;
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface SharedCalendar {
  id: string;
  calendar_id: string;
  shared_with: string;
  permission_level: 'view' | 'edit' | 'admin';
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  calendar_id?: string;
  org_id?: string;
  user_id: string;
  color?: string;
  created_at: string;
  updated_at: string;
  timezone: string;
  recurrence_rule?: string;
}

export interface EventTag {
  event_id: string;
  tag_name: string;
}

export interface OrgTag {
  org_id: string;
  tag_name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  calendar_id: string;
  created_at: string;
  updated_at: string;
}

export interface Orgs {
  id: string;
  name: string;
  description: string;
  location: string;
  link: string;
  color: string;
  visibility: string;
  audience: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: 'admin' | 'member';
}

export interface User {
  id: string;
  email: string;
}
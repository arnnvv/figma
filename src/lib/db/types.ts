export type EditAccessStatus = "pending" | "accepted" | "declined";

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  verified: boolean;
  picture: string | null;
}

export interface NewUser {
  username: string;
  email: string;
  password?: string;
  verified?: boolean;
  picture?: string | null;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: Date;
}

export interface NewSession {
  id: string;
  user_id: number;
  expires_at: Date;
}

export interface EmailVerificationRequest {
  id: number;
  user_id: number;
  email: string;
  code: string;
  expires_at: Date;
}

export interface NewEmailVerificationRequest {
  user_id: number;
  email: string;
  code: string;
  expires_at: Date;
}

export interface Room {
  id: string;
  owner_id: number;
}

export interface NewRoom {
  id: string;
  owner_id: number;
}

export interface EditAccess {
  id: number;
  requester_id: number;
  room_id_requested_for: string;
  status: EditAccessStatus;
}

export interface NewEditAccess {
  requester_id: number;
  room_id_requested_for: string;
  status: EditAccessStatus;
}

export interface SessionValidationResultRaw {
  session: Session | null;
  user: User | null;
}

export interface EditAccessRequestWithRoomOwner {
  id: number;
  requester_id: number;
  room_id: string;
  status: EditAccessStatus;
  room_owner_id: number;
  requester_username: string;
}

export interface EditableRoomInfo {
  id: string;
  owner_id: number;
}

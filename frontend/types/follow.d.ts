export type FollowStatus = "none" | "requested" | "accepted";

export interface FollowResponse {
  success: boolean;
  status: number;
  message: string;
  data?: {
    followStatus: FollowStatus;
  };
}

export interface FollowRequest {
  followerId: string;
  followingId: string;
}

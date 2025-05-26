// Follow Types
type FollowStatus = "requested" | "accepted";

// Interaction Types
type InteractionType = "like" | "favorite";

// Interaction Payload
interface InteractionPayload {
  type: InteractionType;
  postId: string;
}

// Interaction Response
type InteractionResponse = {
  id: number;
  postId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
};

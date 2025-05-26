import { SERVER_URL } from "@/lib/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const interactionEndpoints = {
  like: (postId: string) => `/posts/${postId}/like`,
  favorite: (postId: string) => `/posts/${postId}/favorite`,
};

export const usePostInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, postId }: InteractionPayload) => {
      const endpoint = interactionEndpoints[type];
      const url = `${SERVER_URL}/api/post-machine/interactions${endpoint(
        postId
      )}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Interaction failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

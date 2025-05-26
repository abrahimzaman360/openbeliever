import { notFound } from "next/navigation";

export default function ViewConversation({
  params,
}: {
  params: { conversation_id: string };
}) {
  if (!params.conversation_id) {
    return notFound();
  }
  return <div>You&apos;re looking at: {params.conversation_id}</div>;
}

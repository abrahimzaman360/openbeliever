import React from "react";

export default function IndivisualPostView({
  params,
}: {
  params: { id: string };
}) {
  return <div>PostView {params.id}</div>;
}

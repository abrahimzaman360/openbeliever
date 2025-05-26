import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export default function FeedTrendingTopic() {
  // Sample data for trending topics
  const trendingTopics = [
    { id: 1, name: "Technology", hit: "97.5K" },
    { id: 2, name: "Sports", hit: "87.3K" },
    { id: 3, name: "Politics", hit: "67.8K" },
    { id: 4, name: "Entertainment", hit: "45.2K" },
    { id: 5, name: "Science", hit: "34.1K" },
  ];
  return (
    <>
      <Card className="p-4">
        <h2 className="mb-4 text-xl font-bold">Trending</h2>
        <div className="space-y-4">
          {trendingTopics.map((topic) => (
            <div
              key={topic.id}
              className="group cursor-pointer flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trending</p>
                <p className="font-semibold group-hover:underline">
                  {topic.name}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{topic.hit}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

import SearchUsers from "../shared/search-user";
import FeedSuggestedFollows from "./feed-suggested-follows";
import FeedTrendingTopic from "./feed-trending-topic";

export default function RightSideBar() {
  return (
    <div className="sticky top-0 h-screen max-w-md w-full p-4 hidden lg:block border-l border-border">
      <div className="flex h-full flex-col justify-start space-y-4">
        <SearchUsers />
        <FeedSuggestedFollows />
        <FeedTrendingTopic />
      </div>
    </div>
  );
}

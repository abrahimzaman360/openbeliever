import Link from "next/link";
import fs from "fs";
import path from "path";
import Image from "next/image";

export const dynamic = "force-static";
export const revalidate = false;

interface Post {
  slug: string;
  metadata: {
    title: string;
    description: string;
    publishDate: string;
    author: string;
    image: string;
  };
}

async function getAllPosts(): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), "content/posts");
  const fileNames = fs.readdirSync(postsDirectory);

  const posts = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.mdx$/, "");
      const post = await import(`@/content/posts/${fileName}`);

      return {
        slug,
        metadata: {
          title: post.metadata?.title || "",
          description: post.metadata?.description || "",
          publishDate: post.metadata?.publishDate || new Date().toISOString(),
          author: post.metadata?.author || "",
          image: post.metadata?.image || "",
        },
      };
    })
  );

  return posts.sort((a, b) => {
    const dateA = new Date(a.metadata.publishDate).getTime();
    const dateB = new Date(b.metadata.publishDate).getTime();
    return dateB - dateA;
  });
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto px-4">
      <div className="px-4 pt-8 md:pt-16 pb-6 bg-background container">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-4 col-span-2 flex-1">
              <h1 className="text-4xl md:text-5xl font-bold">
                OpenBeliever Blog
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                News, stories, and guides from our team. Subscribe to stay
                updated.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="p-4 group flex flex-col rounded-xl border hover:shadow-lg transition-all duration-200">
            <article className="overflow-hidden">
              {post.metadata.image && (
                <Image
                  src={post.metadata.image}
                  alt={post.metadata.title}
                  width={800}
                  height={400}
                  className="aspect-video object-cover rounded-lg transition-all duration-200 group-hover:scale-105"
                />
              )}
              <div className="p-2">
                <h2 className="text-xl font-semibold mb-2">
                  {post.metadata.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-2">
                  {post.metadata.description}
                </p>
                <div className="text-xs text-gray-500">
                  By {post.metadata.author} •{" "}
                  {new Date(post.metadata.publishDate).toLocaleDateString()}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-start mt-8 max-w-6xl w-full mx-auto">
        <Link
          href={"/"}
          className="underline text-blue-500 hover:text-blue-700">
          Go back to Home
        </Link>
      </div>
    </div>
  );
}

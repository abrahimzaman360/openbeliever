import Image from "next/image";
import Link from "next/link";

const components = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-semibold tracking-tight mt-4 py-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold tracking-tight my-4 text-gray-800">
      {children}
    </h2>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="leading-6 [&:not(:first-child)]:mt-6 text-gray-600">
      {children}
    </p>
  ),
  article: ({ children }: { children: React.ReactNode }) => (
    <article className="prose prose-lg prose-gray max-w-none mx-auto px-4 py-12">
      {children}
    </article>
  ),
  img: ({ src, alt }: { src: string; alt: string }) => {
    // Ensure the path starts with the correct public directory structure
    return (
      <Image
        src={src}
        alt={alt}
        width={400}
        height={400}
        loading="lazy"
        className="w-full h-[400px] object-cover object-center rounded-lg my-8 max-w-4xl mx-auto md:mx-0"
        draggable={false}
        overrideSrc="/images/seo.png"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  },
  a: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline">
      {children}
    </a>
  ),
};

interface PostHeader {
  title: string;
  author: string;
}

const Header = ({ author }: PostHeader) => (
  <div className="sticky top-0 bg-white border-b z-10 border-x px-2">
    <div className="container flex flex-col sm:flex-row items-start sm:items-center gap-y-2 justify-between mx-auto px-2 py-3">
      <Link
        href={"/blog"}
        className="text-2xl font-normal hover:text-blue-500 text-green-400  bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        OpenBeliever.com/blog
      </Link>
      <div className="flex flex-col items-start">
        <p className="text-gray-600">
          Author: <span className="font-semibold">{author}</span>
        </p>
        <p className="text-gray-600">
          Date:{" "}
          <span className="font-semibold">{new Date().toDateString()}</span>
        </p>
      </div>
    </div>
  </div>
);

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const { default: Post, metadata } = await import(
    `@/content/posts/${slug}.mdx`
  );

  return (
    <div className="container mx-auto">
      <Header title={metadata.title} author={metadata.author} />
      <div className="px-8 border-x border-y pb-4 mb-3">
        <Post components={components} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return [{ slug: "welcome" }, { slug: "about" }];
}

export const dynamicParams = false;

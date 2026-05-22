import { notFound } from 'next/navigation';
import { getPostBySlugFromS3 } from '@/lib/s3';
import BlogForm from '@/components/admin/BlogForm';

type Props = { params: Promise<{ slug: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlugFromS3(slug);
  if (!post) notFound();

  return <BlogForm mode="edit" initialPost={post} />;
}

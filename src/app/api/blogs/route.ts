import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

const META_REGEX = /^<!--\s*taxmate-meta:(\{[\s\S]*?\})\s*-->\s*/;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseBlogRow(row: any, authorMap: Map<string, any>) {
  const rawContent = String(row.content || '');
  let category = 'Tax & Compliance';
  let tags: string[] = [];
  let body = rawContent;

  const metaMatch = rawContent.match(META_REGEX);
  if (metaMatch) {
    try {
      const parsedMeta = JSON.parse(metaMatch[1]);
      if (typeof parsedMeta.category === 'string' && parsedMeta.category.trim()) {
        category = parsedMeta.category.trim();
      }
      if (Array.isArray(parsedMeta.tags)) {
        tags = parsedMeta.tags.map((t: any) => String(t).trim()).filter(Boolean);
      }
      body = rawContent.replace(META_REGEX, '').trim();
    } catch {
      body = rawContent;
    }
  }

  const wordCount = body ? body.split(/\s+/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const author = authorMap.get(String(row.user_id)) || null;
  const publishedDate = row.published_at || row.created_at;

  return {
    id: String(row.id),
    userId: String(row.user_id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: row.excerpt || (body ? `${body.replace(/[#>*_`]/g, '').slice(0, 180)}...` : ''),
    content: body,
    featuredImageUrl: row.featured_image_url || null,
    category,
    tags,
    published: Boolean(row.published),
    publishedAt: publishedDate,
    readTime: `${readMinutes} min read`,
    author: {
      id: author?.id ? String(author.id) : String(row.user_id),
      name: author?.full_name || 'TaxMate Editorial Team',
      role: author?.role === 'CA' ? 'Chartered Accountant' : author?.role === 'SUPER_ADMIN' || author?.role === 'ADMIN' ? 'Editorial Lead' : 'Tax Specialist',
      avatar: author?.avatar_url || null,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function encodeContentWithMeta(content: string, category?: string, tags?: string[]) {
  const cleanBody = content.replace(META_REGEX, '').trim();
  const cleanTags = Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [];
  if (!category && cleanTags.length === 0) {
    return cleanBody;
  }
  const meta = JSON.stringify({
    category: category || 'Tax & Compliance',
    tags: cleanTags,
  });
  return `<!-- taxmate-meta:${meta} -->\n${cleanBody}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    let allowUnpublished = false;
    if (includeUnpublished) {
      const user = await getSessionUser(request);
      if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        allowUnpublished = true;
      }
    }

    const supabase = getServiceClient();
    let query = supabase
      .from('blog_posts')
      .select('id, user_id, title, slug, content, excerpt, featured_image_url, published, published_at, created_at, updated_at')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (!allowUnpublished) {
      query = query.eq('published', true);
    }

    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const list = rows || [];
    const authorIds = Array.from(new Set(list.map((r: any) => String(r.user_id)).filter(Boolean)));
    const authorMap = new Map<string, any>();

    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, name, avatar_url, role')
        .in('id', authorIds);
      for (const a of authors || []) {
        authorMap.set(String(a.id), { ...a, full_name: a.name });
      }
    }

    let posts = list.map((row: any) => parseBlogRow(row, authorMap));

    if (category && category.toLowerCase() !== 'all') {
      posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.excerpt.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    if (slug) {
      const post = posts[0] || null;
      if (!post) {
        return NextResponse.json({ success: false, error: 'Article not found', post: null }, { status: 404 });
      }
      return NextResponse.json({ success: true, post });
    }

    return NextResponse.json({ success: true, posts, total: posts.length });
  } catch (error: any) {
    console.error('Blogs GET error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'CA'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const content = String(body.content || '').trim();
    const excerpt = String(body.excerpt || '').trim();
    const category = String(body.category || 'Tax & Compliance').trim();
    const tags = Array.isArray(body.tags)
      ? body.tags.map((t: any) => String(t).trim()).filter(Boolean)
      : typeof body.tags === 'string'
      ? body.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];
    const published = Boolean(body.published);
    const baseSlug = slugify(String(body.slug || title));

    if (!title || title.length < 4) {
      return NextResponse.json({ success: false, error: 'Article title must be at least 4 characters' }, { status: 400 });
    }
    if (!content || content.length < 20) {
      return NextResponse.json({ success: false, error: 'Article content must be at least 20 characters' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const uniqueSlug = baseSlug || `article-${Date.now()}`;
    const { data: existingSlug } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', uniqueSlug)
      .maybeSingle();

    const finalSlug = existingSlug ? `${uniqueSlug}-${Date.now().toString(36)}` : uniqueSlug;
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        user_id: user.userId,
        title,
        slug: finalSlug,
        content: encodeContentWithMeta(content, category, tags),
        excerpt: excerpt || `${content.slice(0, 160)}...`,
        featured_image_url: body.featuredImageUrl || body.featured_image_url || null,
        published,
        published_at: published ? nowIso : null,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select('*')
      .single();

    if (error) throw error;

    const authorMap = new Map([[user.userId, { id: user.userId, full_name: user.email || 'Editorial Team', avatar_url: null, role: user.role }]]);
    return NextResponse.json({ success: true, post: parseBlogRow(data, authorMap) }, { status: 201 });
  } catch (error: any) {
    console.error('Blogs POST error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to publish blog post' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const id = String(body.id || '').trim();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Post id is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && String(existing.user_id) !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.excerpt !== undefined) updates.excerpt = String(body.excerpt).trim();
    if (body.featuredImageUrl !== undefined) updates.featured_image_url = body.featuredImageUrl || null;
    if (body.published !== undefined) {
      updates.published = Boolean(body.published);
      updates.published_at = updates.published ? existing.published_at || new Date().toISOString() : null;
    }

    if (body.content !== undefined || body.category !== undefined || body.tags !== undefined) {
      const existingParsed = parseBlogRow(existing, new Map());
      const nextBody = body.content !== undefined ? String(body.content) : existingParsed.content;
      const nextCategory = body.category !== undefined ? String(body.category) : existingParsed.category;
      const nextTags = Array.isArray(body.tags) ? body.tags : existingParsed.tags;
      updates.content = encodeContentWithMeta(nextBody, nextCategory, nextTags);
    }

    const { data: updated, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, post: parseBlogRow(updated, new Map()) });
  } catch (error: any) {
    console.error('Blogs PATCH error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id')?.trim();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Post id is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing } = await supabase.from('blog_posts').select('id, user_id').eq('id', id).maybeSingle();
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && String(existing.user_id) !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Blogs DELETE error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete post' }, { status: 500 });
  }
}

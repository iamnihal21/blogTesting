import type { CollectionConfig } from 'payload'
import { generateBlog } from '@/endpoints/generateBlog'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'status', 'publishedAt'],
    listSearchableFields: ['title', 'slug', 'excerpt'],
    components: {
      beforeList: ['@/components/admin/AIBlogGenerator#AIBlogGenerator'],
    },
  },
  endpoints: [
    {
      path: '/ai-generate',
      method: 'post',
      handler: generateBlog,
    },
  ],
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of the title. Used in the blog URL.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'A short summary of the post. Used in listings and SEO meta description.',
      },
      maxLength: 300,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'The main image for the blog post. Used in listings and as OG image.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: false,
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Set the publication date. Defaults to current date if left blank upon publishing.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (!value && (siblingData?.status === 'published' || siblingData?._status === 'published')) {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
          admin: {
            description: 'Custom title for search engines. Leave blank to use the post title.',
          },
          maxLength: 70,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
          admin: {
            description: 'Custom description for search engines. Leave blank to use the excerpt.',
          },
          maxLength: 160,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'OG Image',
          admin: {
            description: 'Custom image for social sharing. Leave blank to use the featured image.',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          label: 'Canonical URL',
          admin: {
            description: 'Set a canonical URL if this content exists elsewhere.',
          },
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 300,
      },
    },
  },
  timestamps: true,
}


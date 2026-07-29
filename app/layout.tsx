import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promptlens.ai';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PromptLens AI - Free AI Image to Prompt Generator & Extractor',
    template: '%s | PromptLens AI',
  },
  description: 'Upload any AI image to instantly extract accurate text prompts formatted for Midjourney v6, Flux.1, SDXL, GPT Image, Ideogram, & Leonardo AI. Free online AI vision tool.',
  keywords: [
    'ai image to prompt generator',
    'reverse image prompt finder',
    'image to prompt converter',
    'extract prompt from image online',
    'midjourney prompt generator from image',
    'flux prompt generator',
    'sdxl prompt extractor',
    'free image to text prompt ai',
    'ai art prompt analyzer',
    'reverse prompt engineering tool',
    'inkling ai vision'
  ],
  authors: [{ name: 'PromptLens AI Team' }],
  creator: 'PromptLens AI',
  publisher: 'PromptLens AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'PromptLens AI - Image to Prompt Generator & AI Vision Extractor',
    description: 'Upload any AI artwork and get high-accuracy prompts formatted for Midjourney v6, Flux, SDXL, and DALL-E 3.',
    url: siteUrl,
    siteName: 'PromptLens AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/images/cyberpunk_portrait.png`,
        width: 1200,
        height: 630,
        alt: 'PromptLens AI - Convert AI Art to Reusable Prompts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptLens AI - Reverse Image Prompt Generator',
    description: 'Convert any uploaded AI picture into accurate Midjourney, Flux, & SDXL prompts.',
    images: [`${siteUrl}/images/cyberpunk_portrait.png`],
    creator: '@promptlensai',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/site.webmanifest',
};

const jsonLdSoftwareApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PromptLens AI',
  operatingSystem: 'All',
  applicationCategory: 'DesignApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: 'Online AI vision tool that extracts detailed, reusable text prompts from uploaded AI images for Midjourney, Flux, SDXL, and GPT Image.',
  url: siteUrl,
};

const jsonLdFaqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can PromptLens AI recover the exact original prompt?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PromptLens AI uses advanced computer vision models to analyze the visual metadata (subject, camera angle, lens, lighting, style, rendering tags) and generates a structured prompt that reproduces a visually identical high-quality result.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my uploaded images saved or stored on a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Images are processed in-memory in real time to extract visual characteristics and are automatically discarded immediately after processing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which AI image generators are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PromptLens AI includes prompt formatting adapters for Midjourney (v6 flags), Flux.1, Stable Diffusion XL (SDXL), OpenAI GPT Image / DALL-E 3, Leonardo AI, and Ideogram.',
      },
    },
    {
      '@type': 'Question',
      name: 'What file formats and image sizes are allowed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We support JPG, PNG, and WEBP formats up to 20 MB in size.',
      },
    },
  ],
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaqPage) }}
        />
      </head>
      <body className="min-h-screen bg-[#07090e] text-gray-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


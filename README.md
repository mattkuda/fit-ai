# Fit AI

A fast-launch AI demo app that lets users upload a photo of themselves and preview how they'd look wearing different pieces of clothing.

## Features

- Upload your photo
- Preview how you'd look in 4 different clothing items
- AI-powered image generation using OpenAI's GPT Image API
- Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- OpenAI GPT Image API
- Vercel (for deployment)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click on any clothing item's "Try It On" button
2. Upload a photo of yourself
3. Wait for the AI to generate an image of you wearing the selected item
4. The generated image will replace the original product image

## Deployment

The app is ready to be deployed on Vercel. Just push your code to a GitHub repository and import it into Vercel.

## License

MIT

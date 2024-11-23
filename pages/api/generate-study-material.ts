// pages/api/generate-study-material.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileContent } = req.body;

  if (!fileContent) {
    return res.status(400).json({ error: 'No file content provided' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use 'gpt-4' if you have access
      messages: [
        {
          role: 'system',
          content: 'You are an expert study guide generator.',
        },
        {
          role: 'user',
          content: `Generate a study guide based on the following content:\n\n${fileContent}`,
        },
      ],
      max_tokens: 1500,
    });

    const messageContent = response.choices[0].message?.content;

    if (!messageContent) {
      throw new Error('No study material generated');
    }

    res.status(200).json({ studyMaterial: messageContent.trim() });
  } catch (error) {
    console.error('Error generating study material:', error);
    res.status(500).json({ error: 'Failed to generate study material' });
  }
}
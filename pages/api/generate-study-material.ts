// pages/api/generate-study-material.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import pdf from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileContent } = req.body;

  if (!fileContent) {
    return res.status(400).json({ error: 'No file content provided' });
  }

  const fileContentSizeBytes = Buffer.byteLength(fileContent, 'utf8');
  const fileContentSizeMB = fileContentSizeBytes / (1024 * 1024);
  console.log(`File content size: ${fileContentSizeMB} MB`);

  try {
    // Convert base64 file content to a Buffer
    const pdfBuffer = Buffer.from(fileContent, 'base64');

    // Extract text from the PDF buffer
    const pdfData = await pdf(pdfBuffer);
    const extractedText = pdfData.text;

    if (!extractedText) {
      throw new Error('Failed to extract text from PDF');
    }
    console.log('Extracted text:', extractedText);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use 'gpt-4' if you have access
      messages: [
        {
          role: 'system',
          content: 'You are an expert practice test generator.',
        },
        {
          role: 'user',
          content: `Generate a practice test based on the following content:\n\n${extractedText}. The practice test should be multiple choice, with four choices and a "correct answer" line containing the letter corresponding to the correct answer.
                    Do not return anything other than the practice test itself. Ensure that there is a line as such: --- between each question and that each question is numbered. Do not return asterisks in your answer. The questions should be formatted as such: 
                    1. What does it mean if SAT is in co-NP? 
                    A) SAT is NP-complete
                    B) SAT's complement is in NP
                    C) NP and co-NP are equal
                    D) All languages in NP can be reduced to SAT
                    Correct answer: B
                    
                    ---

                    2. If P = NP, what can be said about every language in P? 
                    A) They are all decidable
                    B) They are all NP-complete except for ∅ and Σ*
                    C) They can be solved in exponential time
                    D) They have no relationship to NP-completeness
                    Correct answer: B

                    `,
        },
      ],
      max_tokens: 1500,
    });

    const messageContent = response.choices[0].message?.content;

    if (!messageContent) {
      throw new Error('No study material generated');
    }
    console.log('Study material generated:', messageContent.trim());
    console.log('Response:', response);
    res.status(200).json({ studyMaterial: messageContent.trim() });
  } catch (error) {
    console.error('Error generating study material:', error);
    res.status(500).json({ error: 'Failed to generate study material' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

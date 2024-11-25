// generateFlashCards.ts
import axios from 'axios';
import { toast } from 'sonner';
import { arrayBufferToBase64 } from './array-buffer-util';

export async function generateFlashCards(fileUrl: string, fileName: string) {
  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();

    const base64FileContent = arrayBufferToBase64(arrayBuffer);

    const requestBodySize = (base64FileContent.length * 3) / 4; // Approximate size in bytes
    console.log('Request body size:', requestBodySize / (1024 * 1024), 'MB');

    const res = await axios.post('/api/generate-flash-cards', {
      fileContent: base64FileContent,
    });

    if (res.status === 200) {
      toast.success('Flash cards generated successfully');
      return {
        fileName,
        content: res.data.flashCards,
      };
    } else {
      toast.error('Failed to generate flash cards');
      return null;
    }
  } catch (error) {
    toast.error('Failed to generate flash cards');
    console.error(error);
    return null;
  }
}

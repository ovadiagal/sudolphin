// generateTests.ts
import axios from 'axios';
import { toast } from 'sonner';
import { arrayBufferToBase64 } from './array-buffer-util';

export async function generateTest(fileUrl: string, fileName: string) {
  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();

    const base64FileContent = arrayBufferToBase64(arrayBuffer);

    const requestBodySize = (base64FileContent.length * 3) / 4; // Approximate size in bytes
    console.log('Request body size:', requestBodySize / (1024 * 1024), 'MB');

    const res = await axios.post('/api/generate-study-material', {
      fileContent: base64FileContent,
    });

    if (res.status === 200) {
      toast.success('Study material generated successfully');
      return {
        fileName,
        content: res.data.studyMaterial,
      };
    } else {
      toast.error('Failed to generate study material');
      return null;
    }
  } catch (error) {
    toast.error('Failed to generate study material');
    console.error(error);
    return null;
  }
}
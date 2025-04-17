// Helper function for consistent image URL construction
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Handle case where the full URL is already provided
  if (imagePath.startsWith('http')) return imagePath;
  
  // Extract the base URL without the '/api' suffix
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  return `${baseUrl}${imagePath}`;
};
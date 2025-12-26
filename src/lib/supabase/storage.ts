import { supabase } from './client';

/**
 * Upload de imagem para Supabase Storage
 * @param file Buffer da imagem
 * @param filename Nome do arquivo (ex: "slug-timestamp.png")
 * @param contentType MIME type (padrão: image/png)
 * @returns URL pública da imagem ou null em caso de erro
 */
export async function uploadPostImage(
  file: Buffer,
  filename: string,
  contentType: string = 'image/png'
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filename, file, {
        contentType,
        upsert: true, // Sobrescrever se já existir
        cacheControl: '31536000', // 1 ano de cache
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return null;
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(data.path);

    console.log('✅ Image uploaded:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Upload exception:', error);
    return null;
  }
}

/**
 * Deletar imagem do Storage
 */
export async function deletePostImage(filename: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('post-images')
      .remove([filename]);

    if (error) {
      console.error('❌ Delete error:', error);
      return false;
    }

    console.log('✅ Image deleted:', filename);
    return true;
  } catch (error) {
    console.error('❌ Delete exception:', error);
    return false;
  }
}

/**
 * Listar todas as imagens de posts
 */
export async function listPostImages() {
  try {
    const { data, error } = await supabase.storage
      .from('post-images')
      .list();

    if (error) {
      console.error('❌ List error:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('❌ List exception:', error);
    return [];
  }
}

/**
 * Obter URL pública de uma imagem
 */
export function getPostImageUrl(filename: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(filename);

  return publicUrl;
}

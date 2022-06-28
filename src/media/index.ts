import { Image, ImageType, Medium } from '@zenky/api';

export function getFirstMedium(media: Medium | Medium[], sizes: string[] = ['large', 'medium'], preferWebp: boolean = true): Image | null {
  const medium = Array.isArray(media) ? media[0] : media;

  if (!medium || !medium.images) {
    return null;
  }

  const sizesMap: Record<string, ImageType> = {
    'placeholder': ImageType.Placeholder,
    'placeholder_webp': ImageType.PlaceholderWebp,
    'thumb': ImageType.Thumb,
    'thumb_webp': ImageType.ThumbWebp,
    'medium': ImageType.Medium,
    'medium_webp': ImageType.MediumWebp,
    'large': ImageType.Large,
    'large_webp': ImageType.LargeWebp,
    'xlarge': ImageType.XLarge,
    'xlarge_webp': ImageType.XLargeWebp,
    'hd': ImageType.HD,
    'hd_webp': ImageType.HDWebp,
  };

  const images: Image[] = [];

  sizes.forEach((size: string) => {
    const webpImage = medium.images[sizesMap[`${size}_webp`]];

    if (preferWebp && webpImage) {
      images.push(webpImage);

      return;
    }

    const jpegImage = medium.images[sizesMap[size]];

    if (jpegImage) {
      images.push(jpegImage);
    }
  });

  return images.length > 0 ? images[0] : null;
}

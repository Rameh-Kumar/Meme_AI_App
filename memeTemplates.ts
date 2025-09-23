export interface MemeTemplate {
  id: string;
  name: string;
  imageUrl: string;
}

// NOTE: These are external image URLs. In a production environment,
// it would be better to host these assets directly to avoid reliance on third-party services.
export const memeTemplates: MemeTemplate[] = [
  {
    id: 'distracted-boyfriend',
    name: 'Distracted Boyfriend',
    imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
  },
  {
    id: 'drake',
    name: 'Drake Hotline Bling',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind',
    imageUrl: 'https://i.imgflip.com/24y43o.jpg',
  },
  {
    id: 'woman-yelling-at-cat',
    name: 'Woman Yelling at Cat',
    imageUrl: 'https://i.imgflip.com/345v97.jpg',
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    imageUrl: 'https://i.imgflip.com/1jwhww.jpg',
  },
  {
    id: 'is-this-a-pigeon',
    name: 'Is This A Pigeon',
    imageUrl: 'https://i.imgflip.com/1o00in.jpg',
  },
  {
    id: 'surprised-pikachu',
    name: 'Surprised Pikachu',
    imageUrl: 'https://i.imgflip.com/2kbn1e.jpg',
  },
];
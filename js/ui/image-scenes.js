// 題材を切り替えても、8つの世界とビット列の対応は共通。
import { getLanguage } from '../i18n.js';

const IMAGE_SETS = ['kyoseikan', 'yukichi'];
const DEFAULT_IMAGE_SET = 'yukichi';
const STORAGE_KEY = 'quantum-image-mixer-image-set';
const imageCache = new Map();

export function normalizeImageSet(value) {
  return IMAGE_SETS.includes(value) ? value : DEFAULT_IMAGE_SET;
}

export function loadSavedImageSet() {
  try { return normalizeImageSet(localStorage.getItem(STORAGE_KEY)); }
  catch { return DEFAULT_IMAGE_SET; }
}

export function saveImageSet(value) {
  try { localStorage.setItem(STORAGE_KEY, normalizeImageSet(value)); }
  catch { /* 保存できなくても切替は使える。 */ }
}

const SCENES = [
  { asset: '000-cherry', name: '桜', nameEn: 'Cherry Blossoms', color: '#e981a9' },
  { asset: '001-underwater', name: '海底', nameEn: 'Underwater', color: '#20bacb' },
  { asset: '010-sky', name: '天空', nameEn: 'Sky Realm', color: '#7dc0f1' },
  { asset: '011-future', name: '未来都市', nameEn: 'Future City', color: '#bd65ec' },
  { asset: '100-space', name: '宇宙', nameEn: 'Space', color: '#8375e4' },
  { asset: '101-desert', name: '砂漠', nameEn: 'Desert', color: '#e5a052' },
  { asset: '110-forest', name: '森', nameEn: 'Forest', color: '#69a352' },
  { asset: '111-snow', name: '雪', nameEn: 'Snow', color: '#99bce8' },
];

export const IMAGE_NAMES = SCENES.map(({ name }) => name);
export function imageName(index) {
  const scene = SCENES[index];
  return getLanguage() === 'en' ? scene.nameEn : scene.name;
}
export const IMAGE_META = SCENES.map(({ asset, name, nameEn, color }, index) => ({
  index,
  bits: index.toString(2).padStart(3, '0'),
  name,
  nameEn,
  color,
  src: new URL(`../../assets/${DEFAULT_IMAGE_SET}/${asset}.webp`, import.meta.url).href,
}));

export function loadSceneImages(imageSet = DEFAULT_IMAGE_SET) {
  const id = normalizeImageSet(imageSet);
  if (imageCache.has(id)) return imageCache.get(id);
  const loading = Promise.all(SCENES.map((scene, index) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(imageName(index)));
    image.src = new URL(`../../assets/${id}/${scene.asset}.webp`, import.meta.url).href;
  }))).catch((error) => {
    imageCache.delete(id); // 再選択で読み込みを再試行できる。
    throw error;
  });
  imageCache.set(id, loading);
  return loading;
}

import axios from 'axios';
const pixabayKey = '31420131-aff65dfb3f4bd8a8d020782c7';
const IMAGES_PER_PAGE = 9;

const axiosPixabay = axios.create({
  baseURL: 'https://pixabay.com/api/',
  params: {
    key: pixabayKey,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: IMAGES_PER_PAGE,
  },
});

export async function fetchPixabayImages(q) {
  const { data } = await axiosPixabay.get('', { params: { q } });
  return data;
}

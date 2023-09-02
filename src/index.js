import { fetchCountries } from './js/fetchCountries';
import { fetchPixabayImages } from './js/fetchPixabay';
import Refs from './js/refsMdl';
import { fetchPixabayImages } from './js/fetchPixabay';
import Params from './js/utils/params';
import lodashDebounce from 'lodash.debounce';
import Notiflix from 'notiflix';
import cardTpls from './templates/gallerys.hbs';
import cardList from './templates/cardList.hbs';
import countryInfo from './templates/countryInfo.hbs';
import moreInfo from './templates/moreInfo.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.css';

const lightbox = new SimpleLightbox('.gallery a', Params.LIGHTBOX_PARAMS);

Refs.inputEl.addEventListener(
  'input',
  lodashDebounce(handleInput, Params.DEBOUNCE_DELAY),
);
Refs.inputEl.addEventListener('input', showLoadingInfo);
Refs.divEl.classList.add('invisible');

function handleInput(e) {
  Params.nameCountry = e.target.value.trim();
  Refs.divEl.classList.add('invisible');
  if (Params.nameCountry) {
    return fetchCountries(Params.nameCountry)
      .then(data => {
        choseRender(data);
        Refs.galleryEl.innerHTML = '';
      })
      .catch(fetchError);
  }

  Refs.inputEl.innerHTML = '';
  Refs.divEl.innerHTML = '';
  Refs.listEl.innerHTML = '';
  Refs.galleryEl.innerHTML = '';
  hideLoadingInfo();
}

function choseRender(arr, index = 0) {
  if (arr.length === 1) {
    Refs.listEl.innerHTML = '';
    return renderCountriesDiv(arr, index);
  }

  if (arr.length > 1 && arr.length <= 250) {
    Refs.divEl.innerHTML = '';
    return renderCountriesList(arr);
  }

  Notiflix.Notify.info(
    'Too many matches found. Please enter a more specific name.',
  );

  Refs.divEl.innerHTML = '';
  Refs.listEl.innerHTML = '';
  hideLoadingInfo();
}

function renderCountriesList(data) {
  const markup = cardList(data);
  Refs.listEl.innerHTML = markup;
  Refs.listEl.addEventListener('click', handleChouseCountryfo);
  hideLoadingInfo();

  function handleChouseCountryfo(target) {
    handleCountryListClick(data, target);
    Refs.listEl.removeEventListener('click', handleChouseCountryfo);
  }
}

function handleCountryListClick(data, { target }) {
  const button = target.closest('.country-list__btn');
  if (!button) return;
  const index = +button.dataset.index;
  Refs.listEl.innerHTML = '';
  renderCountriesDiv(data, index);
  hideLoadingInfo();
}

function renderCountriesDiv(data, index) {
  Refs.divEl.classList.remove('invisible');
  Params.nameCountry = data[index].name.official;
  Params.nameCapital = data[index].capital[0];
  const markup = countryInfo(data[index]);
  Refs.divEl.innerHTML = markup;
  hideLoadingInfo();

  const showMoreBtn = document.querySelector('.card__button');
  const showMoreBtn2 = document.querySelector('.card__button2');
  showMoreBtn.addEventListener('click', handleShowMoreInformation);
  showMoreBtn2.addEventListener('click', handleShowMoreInformationPixabey);

  function handleShowMoreInformation({ target }) {
    showLoadingInfo();
    target.parentNode.removeChild(target);
    renderCountriesMore(data, index);
    showMoreBtn.removeEventListener('click', handleShowMoreInformation);
  }

  function handleShowMoreInformationPixabey({ target }) {
    showLoadingInfo();
    target.parentNode.removeChild(target);
    pixRender(Params.nameCountry, Params.nameCapital);
    showMoreBtn2.removeEventListener('click', handleShowMoreInformationPixabey);
  }
}

function fetchError() {
  Refs.divEl.classList.add('invisible');
  Notiflix.Notify.failure('Oops, there is no country with that name');
  Refs.listEl.innerHTML = '';
  hideLoadingInfo();
}

function renderCountriesMore(data, index) {
  const gallEl = document.querySelector('.country-info_list');
  const markupMore = moreInfo(data[index]);
  gallEl.insertAdjacentHTML('beforeend', markupMore);
  hideLoadingInfo();
}

async function pixRender(nameCountry, nameCapital) {
  const { hits, total } = await fetchPixabayImages(Params.nameCountry);
  if (total >= 9) {
    const markup = cardTpls({ hits });
    Refs.galleryEl.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
    hideLoadingInfo();
  } else {
    const { hits, total } = await fetchPixabayImages(Params.nameCapital);
    if (total <= 0) {
      let other = 'island';
      const { hits } = await fetchPixabayImages(other);
      const markup = cardTpls({ hits, other });
      Refs.galleryEl.insertAdjacentHTML('beforeend', markup);
      lightbox.refresh();
      hideLoadingInfo();
    } else {
      const markup = cardTpls({ hits });
      Refs.galleryEl.insertAdjacentHTML('beforeend', markup);
      lightbox.refresh();
      hideLoadingInfo();
    }
  }
}

function hideLoadingInfo() {
  Refs.loadingInfoEl.classList.add('invisible');
}

function showLoadingInfo() {
  Refs.loadingInfoEl.classList.remove('invisible');
}

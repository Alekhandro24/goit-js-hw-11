import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { getImages } from './axiosFetch';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  searchForm: document.querySelector('.search-form'),
  input: document.querySelector('.search-form__input'),
  loadMoreBtn: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};

let currentImage;
let page = 1;
let lastPage;

refs.searchForm.addEventListener('submit', onSubmitForm);
refs.loadMoreBtn.addEventListener('click', onClickMoreBtn);

async function onSubmitForm(e) {
  e.preventDefault();

  const imageToSearch = refs.input.value;
  if (imageToSearch === currentImage) {
    return;
  }

  clearGalleryList();
  hideMoreBtn();
  page = 1;

  const images = await getImages(imageToSearch, page);
  const totalHits = images.totalHits;
  lastPage = Math.ceil(images.totalHits / 40);
  lastPage > 1 && showMoreBtn();
  currentImage = imageToSearch;

  page += 1;

  if (totalHits > 0) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
    renderMarkupList(images);
  } else {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again'
    );
  }
}

function onClickMoreBtn() {
  if (page >= lastPage) {
    hideMoreBtn();
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    getImages(currentImage, page).then(images => renderMarkupList(images));
    page += 1;
  }
}

function renderMarkupList({ hits }) {
  hits.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      const markup = `
      <div class="photo-card">
        <a class="photo-card__link" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
        <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
  </a>
</div>`;
      refs.gallery.insertAdjacentHTML('beforeend', markup);
    }
  );
  lightbox.refresh();
}

function clearGalleryList() {
  refs.gallery.innerHTML = '';
}

function showMoreBtn() {
  refs.loadMoreBtn.classList.remove('visually-hidden');
}

function hideMoreBtn() {
  refs.loadMoreBtn.classList.add('visually-hidden');
}

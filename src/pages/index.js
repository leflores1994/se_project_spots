import "./index.css";

import { enableValidation, settings } from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "4776b6d4-770b-4ff1-b213-f7d6eb1f3bc4",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userData]) => {
    cards.forEach((item) => {
      const cardEl = getCardElement(item);
      cardsList.append(cardEl);
    });

    return userData;

    // - set the src of the avatar image
    // - set the textcontent of both the text elements
  })
  .catch(console.error);

const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);

const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostCardImageInput = newPostModal.querySelector("#card-image-input");
const newPostCardDescriptionInput = newPostModal.querySelector(
  "#card-description-input",
);

let selectedCard, selectedCardId;

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error);
}

function handleLike(evt) {
  evt.preventDefault();
  const isLiked = evt.target.classList.contains("card__like-button_active");
  api
    .changeLikeStatus(selectedCardId, isLiked)
    .then((data) => {
      const likeCountEl = selectedCard.querySelector(".card__like-count");
      likeCountEl.textContent = data.likes.length;
    })
    .catch(console.error);
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  // TODO - if the card is liked, set the active class on the card

  const cardLikeBtnEl = cardElement.querySelector(".card__like-button");
  cardLikeBtnEl.addEventListener("click", (evt) => handleLike(evt, data._id));

  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");
  cardDeleteBtnEl.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id),
  );

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

previewModalCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener(`keydown`, handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener(`keydown`, handleEscape);
}

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

avatarModalBtn.addEventListener("click", function () {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", function () {
  closeModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

function handleEscape(evt) {
  if (evt.key === `Escape`) {
    const openModal = document.querySelector(".modal_is-opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

function handleOverlayClick(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error);
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  api
    .editUserAvatar({
      avatar: avatarInput.value,
    })
    .then((data) => {
      const profileAvatarEl = document.querySelector(".profile__avatar");
      profileAvatarEl.src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error);
}

function handleNewPostSubmit(evt) {
  evt.preventDefault();
  const inputValues = {
    name: newPostCardDescriptionInput.value,
    link: newPostCardImageInput.value,
  };
  const cardElement = getCardElement(inputValues);
  cardsList.prepend(cardElement);
  evt.target.reset();
  closeModal(newPostModal);
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleNewPostSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

editProfileModal.addEventListener("mousedown", handleOverlayClick);
newPostModal.addEventListener("mousedown", handleOverlayClick);
previewModal.addEventListener("mousedown", handleOverlayClick);
avatarModal.addEventListener("mousedown", handleOverlayClick);

enableValidation(settings);

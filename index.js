document.addEventListener("DOMContentLoaded", function () {
  const inputBook = document.getElementById("inputBook");
  inputBook.addEventListener("submit", function (e) {
    e.preventDefault();
    inputMyBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const resetRak = document.getElementById("resetRak");
  resetRak.addEventListener("click", function () {
    deleteDataFromLocalStorage();
  });
});

const books = [];
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "save-book";
const STORAGE_KEY = "MY-BOOKS";

document.addEventListener(RENDER_EVENT, renderBooks);

function inputMyBook() {
  const id = generateBookId();
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = checkStatusBook();
  const bookProperties = generateBookObject(
    id,
    title,
    author,
    year,
    isComplete
  );
  books.push(bookProperties);
  alert("Buku berhasil ditambahkan!");
  clearInputForm();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataBookToLocalStorage();
}

function generateBookId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id: String(id) | Number(id),
    title: String(title),
    author: String(author),
    year: Number(year),
    isComplete: Boolean(isComplete),
  };
}

function checkStatusBook() {
  const isCheckComplete = document.getElementById("inputBookIsComplete");
  return isCheckComplete.checked;
}

function renderBooks() {
  const incompleteBook = document.getElementById("incompleteBookshelfList");
  const completeBook = document.getElementById("completeBookshelfList");
  incompleteBook.innerHTML = "";
  completeBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = createBookElement(bookItem);
    if (!bookItem.isComplete) {
      incompleteBook.append(bookElement);
    } else {
      completeBook.append(bookElement);
    }
  }
}

function createBookElement(bookProperties) {
  const container_property_book = document.createElement("article");
  container_property_book.classList.add("book_item");

  const texttitle = document.createElement("h3");
  texttitle.innerText = bookProperties.title;

  const textauthor = document.createElement("p");
  textauthor.innerText = bookProperties.author;

  const textyear = document.createElement("p");
  textyear.innerText = bookProperties.year;

  container_property_book.append(texttitle, textauthor, textyear);

  const action = document.createElement("div");
  action.classList.add("action");

  const buttonAction = document.createElement("button");
  buttonAction.classList.add("green");
  buttonAction.innerText = bookProperties.isComplete
    ? "Belum Selesai Dibaca"
    : "Selesai Dibaca";
  buttonAction.addEventListener("click", () =>
    toggleBookStatus(bookProperties.id)
  );

  const buttonRemove = document.createElement("button");
  buttonRemove.classList.add("red");
  buttonRemove.innerText = "Hapus";
  buttonRemove.addEventListener("click", () => removeBook(bookProperties.id));

  const buttonEdit = document.createElement("button");
  buttonEdit.classList.add("yellow");
  buttonEdit.innerText = "Edit";
  buttonEdit.addEventListener("click", () => editBook(bookProperties.id));

  action.append(buttonAction, buttonRemove, buttonEdit);
  container_property_book.append(action);

  return container_property_book;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function saveDataBookToLocalStorage() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

const search = document.getElementById("searchBook");
search.addEventListener("submit", function (e) {
  e.preventDefault();

  const input = document.getElementById("searchBookTitle");
  const filter = input.value.toUpperCase();
  const completeBook = document.getElementById("completeBookshelfList");
  const incompleteBook = document.getElementById("incompleteBookshelfList");

  filterBookList(completeBook, filter);
  filterBookList(incompleteBook, filter);
});

function filterBookList(bookshelf, filter) {
  const bookList = bookshelf.getElementsByTagName("article");
  for (let i = 0; i < bookList.length; i++) {
    const h3 = bookList[i].getElementsByTagName("h3")[0];
    const searchText = h3.title || h3.innerText;
    bookList[i].style.display = searchText.toUpperCase().includes(filter)
      ? ""
      : "none";
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function toggleBookStatus(bookId) {
  const bookTarget = findBook(bookId);
  if (!bookTarget) return;
  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataBookToLocalStorage();
}

function removeBook(bookId) {
  const bookTargetIndex = findBookIndex(bookId);
  if (bookTargetIndex === -1) return;
  if (confirm("Apakah yakin ingin dihapus?")) {
    books.splice(bookTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBookToLocalStorage();
  }
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (!bookTarget) return;

  const updateTitle = prompt("Masukkan judul buku baru:", bookTarget.title);
  const updateAuthor = prompt("Masukkan penulis buku baru:", bookTarget.author);
  const updateYear = prompt(
    "Masukkan tahun terbit buku baru:",
    bookTarget.year
  );

  if (updateTitle !== null && updateAuthor !== null && updateYear !== null) {
    bookTarget.title = updateTitle;
    bookTarget.author = updateAuthor;
    bookTarget.year = parseInt(updateYear);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBookToLocalStorage();
  }
}

function clearInputForm() {
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function findBook(bookId) {
  return books.find((book) => book.id === bookId);
}

function deleteDataFromLocalStorage() {
  const resetRak = confirm("Yakin Reset Buku di Rak ?");
  if (resetRak && isStorageExist()) {
    localStorage.removeItem(STORAGE_KEY);
    refreshPage();
  }
}

function refreshPage() {
  location.reload();
}

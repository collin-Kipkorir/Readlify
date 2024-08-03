// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPwIKt_nGGpv37HXgzcZGsgVtGDthAMuQ",
  authDomain: "readify-b4360.firebaseapp.com",
  projectId: "readify-b4360",
  storageBucket: "readify-b4360.appspot.com",
  messagingSenderId: "822651381463",
  appId: "1:822651381463:web:6c19064b270baeb3c2f292",
  measurementId: "G-LD328TQNYN",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Reference to Firebase Database
const database = firebase.database();

// Function to fetch books and group them by categories
function fetchBooksFromFirebase() {
  const container = document.querySelector(".container");
  container.innerHTML = "";

  // Reference to the 'books' node in Firebase
  const booksRef = database.ref("books");

  // Fetching data from Firebase
  booksRef.once("value", (snapshot) => {
    const books = snapshot.val();
    const categories = {};

    // Group books by category
    Object.keys(books).forEach((bookId) => {
      const book = books[bookId];
      const category = book.category || "Uncategorized";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ ...book, id: bookId });
    });

    // Render categories and books
    Object.keys(categories).forEach((category) => {
      const categoryElement = document.createElement("div");
      categoryElement.classList.add("category");
      categoryElement.innerHTML = `
        <h6>${category}</h6>
        <div class="books-container-wrapper">
          <div class="books-container" id="book-list-${category}">
            <!-- Books will be injected here by JavaScript -->
          </div>
          <button class="scroll-right" onclick="scrollRight('${category}')">&rarr;</button>
        </div>
      `;
      container.appendChild(categoryElement);

      const bookList = document.getElementById(`book-list-${category}`);
      categories[category].forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book");
        bookElement.innerHTML = `
<div class="card">
    <img src="${book.cover}" class="card-img-top" alt="${book.title}">
    <div class="card-body">
        <h5 class="card-title">${book.title}</h5>
        <p class="card-text">Author: ${book.author}</p>
        <p class="card-text">Ksh.${book.price.toFixed(2)}</p>
        <div class="button-container d-flex justify-content-between">
            <a class="[btn-cart]" href="#" onclick="addToCart(event, '${book.id}')">
                <span>🛒</span>
            </a>
            <button class="btn btn-primary" onclick="buyNow('${book.price.toFixed(2)}')">Buy Now</button>
        </div>
    </div>
</div>
        `;
        bookList.appendChild(bookElement);
      });

      // Ensure scroll buttons are visible based on scroll state
      updateScrollButtons();
    });
  });
}

// Function to scroll the book container to the right
function scrollRight(category) {
  const bookList = document.getElementById(`book-list-${category}`);
  const scrollAmount = bookList.clientWidth / 3; // Adjust this value to scroll by a portion of the container width

  // Scroll by the computed amount
  bookList.scrollBy({ left: scrollAmount, behavior: "smooth" });
}

// Function to update the visibility of the scroll buttons
function updateScrollButtons() {
  document.querySelectorAll(".books-container-wrapper").forEach((wrapper) => {
    const bookList = wrapper.querySelector(".books-container");
    const scrollButton = wrapper.querySelector(".scroll-right");
    const maxScrollLeft = bookList.scrollWidth - bookList.clientWidth;
    scrollButton.style.display =
      bookList.scrollLeft < maxScrollLeft ? "block" : "none";
  });
}

// Cart functionality
let cart = [];

function addToCart(event, bookId) {
  event.preventDefault();
  const booksRef = database.ref("books");
  booksRef.child(bookId).once("value", (snapshot) => {
    const book = snapshot.val();
    cart.push({ ...book, id: bookId });
    renderCart();
  });
}

function renderCart() {
  const cartElement = document.getElementById("cart");
  const cartCounter = document.getElementById("cart-counter");
  cartElement.innerHTML = "";
  cartCounter.innerText = cart.length;

  let subtotal = 0;

  cart.forEach((item) => {
      subtotal += item.price;

      const cartItem = document.createElement("div");
      cartItem.classList.add("row", "mb-4");
      cartItem.innerHTML = `
          <div class="col-md-2">
              <img src="${item.cover}" class="img-fluid" alt="${item.title}">
          </div>
          <div class="col-md-7">
              <h5 class="card-title">${item.title}</h5>
              <p class="card-text">by ${item.author}</p>
              <p class="card-text">eBook (EPUB 3, Reflowable)</p>
              <button class="btn btn-link text-danger p-0" onclick="removeFromCart('${item.id}')">Remove</button>
          </div>
          <div class="col-md-3 text-right">
              <h5>Ksh.${item.price.toFixed(2)}</h5>
          </div>
      `;
      cartElement.appendChild(cartItem);
  });

  const subtotalElement = document.getElementById("subtotal");
  subtotalElement.innerText = `Subtotal: Ksh.${subtotal.toFixed(2)}`;
}


function removeFromCart(bookId) {
  cart = cart.filter((item) => item.id !== bookId);
  renderCart();
}

function checkout() {
  alert("Checkout complete!");
  cart = [];
  renderCart();
}

// Initialize rendering on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchBooksFromFirebase();
});

// Add event listeners for scroll events to update button visibility
document.addEventListener("scroll", (event) => {
  if (event.target.classList.contains("books-container")) {
    updateScrollButtons();
  }
});

function buyNow(price) {
  // Set the book price in the hidden input field
  document.getElementById('book-price').value = price;
  // Show the modal
  $('#buyNowModal').modal('show');
}

function payWithPaystack(event) {
  event.preventDefault();
  var email = document.getElementById('email-address').value;
  var amount = document.getElementById('book-price').value;

  var handler = PaystackPop.setup({
      key: 'pk_test_788c6d0ba158134e052e2423afa798ffeee02c1c', // replace with your actual Paystack public key
      email: email,
      amount: amount * 100, // Convert to the smallest currency unit
      currency: 'KES',
      onClose: function () {
          alert('Payment cancelled');
      },
      callback: function (response) {
         // alert('Payment successful. Transaction reference: ' + response.reference);
          // Close the modal
          $('#buyNowModal').modal('hide');
          // Initiate the PDF download
          var link = document.createElement('a');
          link.href = 'files/Business-Ideas-eBook.pdf'; // Replace with the actual path to the PDF file
          link.download = 'Biz-Ideas.pdf'; // Specify the name of the downloaded file
          link.click();
      }
  });

  handler.openIframe();
}

document.getElementById('paymentForm').addEventListener('submit', payWithPaystack);



    // Get a reference to the database service
    var db = firebase.database();

    function subscribe(event) {
        event.preventDefault();
        var email = document.getElementById('email').value;
        if (email) {
            db.ref('subscribers').push({
                email: email
            }).then(function() {
                alert('Subscription successful!');
            }).catch(function(error) {
                alert('Subscription failed: ' + error.message);
            });
        } else {
            alert('Please enter a valid email address.');
        }
    }

    document.getElementById('subscription-form').addEventListener('submit', subscribe);


//cookies
document.addEventListener('DOMContentLoaded', function () {
  var cookiesPopup = document.getElementById('cookiesPopup');
  var acceptButton = document.getElementById('acceptCookies');
  var rejectButton = document.getElementById('rejectCookies');

  // Show the cookies popup
  cookiesPopup.classList.add('visible');

  acceptButton.addEventListener('click', function () {
      // Hide the popup and set a cookie or local storage item
      cookiesPopup.classList.remove('visible');
      document.cookie = "cookiesAccepted=true; path=/";
  });

  rejectButton.addEventListener('click', function () {
      // Hide the popup and set a cookie or local storage item
      cookiesPopup.classList.remove('visible');
      document.cookie = "cookiesRejected=true; path=/";
  });
});

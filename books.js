// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPwIKt_nGGpv37HXgzcZGsgVtGDthAMuQ",
    authDomain: "readify-b4360.firebaseapp.com",
    projectId: "readify-b4360",
    storageBucket: "readify-b4360.appspot.com",
    messagingSenderId: "822651381463",
    appId: "1:822651381463:web:6c19064b270baeb3c2f292",
    measurementId: "G-LD328TQNYN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to Firebase Database
const database = firebase.database();

// Function to fetch books from Firebase
function fetchBooksFromFirebase() {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';

    // Reference to the 'books' node in Firebase
    const booksRef = database.ref('books');

    // Fetching data from Firebase
    booksRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const book = childSnapshot.val();
            const bookElement = document.createElement('div');
            bookElement.classList.add('col-6', 'col-md-3', 'mb-4');
            bookElement.innerHTML = `
                <div class="card">
                    <img src="${book.cover}" class="card-img-top" alt="${book.title}">
                    <div class="card-body">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text">Author: ${book.author}</p>
                        <p class="card-text">Price: Ksh.${book.price.toFixed(2)}</p>
                        <button class="btn btn-primary" onclick="addToCart('${childSnapshot.key}')">Add to Cart</button>
                    </div>
                </div>
            `;
            bookList.appendChild(bookElement);
        });
    });
}

// Function to render books initially
function renderBooks() {
    fetchBooksFromFirebase();
}

// Initialize rendering on page load
document.addEventListener('DOMContentLoaded', () => {
    renderBooks();
});

// Cart functionality
let cart = [];

function addToCart(bookId) {
    const booksRef = database.ref('books');
    booksRef.child(bookId).once('value', (snapshot) => {
        const book = snapshot.val();
        cart.push({ ...book, id: bookId });
        renderCart();
    });
}

function renderCart() {
    const cartElement = document.getElementById('cart');
    const cartCounter = document.getElementById('cart-counter');
    cartElement.innerHTML = '';
    cartCounter.innerText = cart.length;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('col-6', 'col-md-3', 'mb-4');
        cartItem.innerHTML = `
            <div class="card">
                <img src="${item.cover}" class="card-img-top" alt="${item.title}">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">Price: Ksh.${item.price.toFixed(2)}</p>
                    <button class="btn btn-danger" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        `;
        cartElement.appendChild(cartItem);
    });
}

function removeFromCart(bookId) {
    cart = cart.filter(item => item.id !== bookId);
    renderCart();
}

function checkout() {
    alert('Checkout complete!');
    cart = [];
    renderCart();
}

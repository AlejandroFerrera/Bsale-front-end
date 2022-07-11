const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const categoriesDOM = document.querySelector('.categories');

url = window.location.href;

var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var category = urlParams.get('category');
console.log(category)

let cart = [];
let buttonsDOM = [];

class Products {
    async getProducts(category="") {
        try {
            let result = await fetch(`http://127.0.0.1:8000/get_products?category=${category}`);
            let data = await result.json();
            return data;
        } catch (error) {
            console.log(error);
        }
    }
}

class Categories {
    async getCategories() {
        try {
            let result = await fetch("http://127.0.0.1:8000/get_categories");
            let data = await result.json();
            return data;
        } catch (error) {
            console.log(error);
        }
    }
}
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id == id)
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart')
            ? JSON.parse(localStorage.getItem('cart'))
            : [];
    }
}

class UI {
    displayCategories(categories) {
        let result = "";
        categories.forEach(category => {
            result += `
            <button class="category-btn">${category.name}</button>
            `
        })
        categoriesDOM.innerHTML = result;
    }

    displayProducts(products) {
        let result = "";

        products.forEach(product => {

            let haveDiscount = product.discount != 0;

            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.url_image == null || product.url_image == '' ? "missing.png" : product.url_image} alt="imagen de ${product.name}"
                        class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        Agregar
                    </button>
                </div>
                <h3>${product.name}</h3>`;

            if (haveDiscount) {

                let newPrice = product.price - (product.price * product.discount / 100);

                result += `<h3 style="text-decoration:line-through; margin-bottom:0;">${product.price}</h3>
                           <h4 style="margin-top: 1px;">${newPrice.toLocaleString('es-ES', { style: 'currency', currency: 'CLP' })}
                           </h4> 
                           </article>`;

            } else {
                result += `<h4>${product.price.toLocaleString('es-ES', { style: 'currency', currency: 'CLP' })}</h4> 
                           </article>`;
            }

        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id)

            if (inCart) {
                button.innerText = "En carro";
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "En carro";
                event.target.disabled = true;

                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                cart = [...cart, cartItem];

                Storage.saveCart(cart);

                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.showCart();
            })
        })
    };

    getCategoryButton() {
        const buttons = [...document.querySelectorAll('.category-btn')];
        console.log(buttons);
        buttons.forEach(button => {
            let category = button.innerText;

            button.addEventListener('click', () => {
                console.log(category)
                window.location.href(url + `?category=${category}`);
            })
        })

    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            let price = item.discount == 0
                ? item.price
                : item.price - (item.price * (item.discount / 100))

            tempTotal += price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = tempTotal;
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.url_image == null || item.url_image == '' ? "missing.png" : item.url_image} alt="cart product">
        <div>
            <h4>${item.name}</h4>
            <h5>${item.price - item.price * item.discount / 100}</h5>
            <span class="remove-item" data-id=${item.id}>Eliminar</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id))
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id != id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> Agregar`
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id == id)
    }

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })

        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id);

            } else if (event.target.classList.contains("fa-chevron-up")) {

                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id == id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;

            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowAmount = event.target;
                let id = lowAmount.dataset.id;
                let tempItem = cart.find(item => item.id == id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowAmount.parentElement.parentElement);
                    this.removeItem(id);
                }

            }
        })
    }

}





document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    const categories = new Categories();

    ui.setupAPP();

    categories.getCategories().then(category => {
        ui.displayCategories(category);
    })

    products.getProducts().then(data => {
        ui.displayProducts(data)
        Storage.saveProducts(data)
    }).then(() => {
        ui.getCategoryButton();
        ui.getBagButtons();
        ui.cartLogic();
    });
});

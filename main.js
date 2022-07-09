const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [];
let buttonsDOM = [];

class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            return data;
        } catch (error) {
            console.log(error);
        }
    }
}

class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
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
                <h3>${product.name}</h3>
                <h4>${product.price.toLocaleString('es-ES', { style: 'currency', currency: 'CLP' })}</h4>
            </article>`;

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
                event.target.style.color = 'gray';
                event.target.disabled = true;
                
                let cartItem = Storage.getProduct(id);
                console.log(cartItem);
            })
        })
    };
}



class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    products.getProducts().then(data => {
        ui.displayProducts(data)
        Storage.saveProducts(data)
    }).then(() => {
        ui.getBagButtons()
    });
});

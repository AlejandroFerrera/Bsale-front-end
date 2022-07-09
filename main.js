let productContainer = document.querySelector('#products-container')
let raiz = document.getElementById('main')

const card = (product_name, product_price, url_image) => {
    return (
        `<div class="col">
            <div class="card" style="width: 18rem;">
            <img src=${url_image} class="card-img-top" alt="imagen de ${product_name}">
            
            <div class="card-body">
                <h4 class="card-title">${product_name}</h4>
                <h6 class="card-text text-success">${product_price}</h6>
            </div>

        </div>
    </div>`);
}

let getProducts = async (category = "") => {
    let response = await fetch('http://127.0.0.1:8000/get_products')
    let products = await response.json()
    console.log(products)
}

let getProductsByCategory = async () => {
    let response = await fetch('http://127.0.0.1:8000/get_categories')
    let categories = await response.json()

    for (let index = 0; index < categories.length; index++) {
        const category = categories[index].name;

        let categoryProducts = await fetch(`http://127.0.0.1:8000/get_products?category=${category}`)
        let products = await categoryProducts.json()

        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            let box = card(product.name, product.price, product.url_image);
            productContainer.innerHTML += box;
        }

    }
}



getProducts()
getProductsByCategory()



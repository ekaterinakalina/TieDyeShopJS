// Import functions
import { el, group, addAmount } from './utils.js';

// VARS
// Define cartObj-Object
const cartObj = {
    productArr: [],
    totalItems: 0,
    totalPrice: '',
};

let sum = 0;
let sumAmount = 0;
let vat = 1.19;

/**
 * Function that creates the cart array
 * @param itemObj {obj}
 */
// Define the addToCart function that inits the cart
export function addToCart(itemObj) {
    const existingProductIndex = cartObj.productArr.findIndex(
        (product) =>
            product.itemId === itemObj.itemId &&
            product.itemSize === itemObj.itemSize
    );
    
    // Push product based on stock
    if (existingProductIndex !== -1) {
        const existingProduct = cartObj.productArr[existingProductIndex];
        const newAmount =
            parseInt(existingProduct.itemAmount) + parseInt(itemObj.itemAmount);
        const itemStock = parseInt(existingProduct.itemStock);

        if (newAmount <= itemStock) {
            existingProduct.itemAmount = newAmount.toString();
        } else {
            existingProduct.itemAmount = itemStock.toString();
        }
    } else {
        cartObj.productArr.push(itemObj);
    }
    createCart(cartObj.productArr);

    // Update the number of items in the cart; calculate the total price
    updateAmountPrice();
}

/**
 * Function that creates and fills the shoppng cart structure
 * @param cart
 */
function createCart(cart) {
    let cartTempl = '';
    let summaryTempl = '';

    cart.forEach((value) => {
        // Template for products in the shopping cart
        cartTempl += `
        <div class="summary-info">
        <div class="flex-row">
          <img src="${value.itemImg}">
          <h3>${value.itemName}</h3>
          <div class="summary-size">${value.itemSize}</div>
          <div class="summary-amount" data-previous-value="${
              value.itemAmount
          }" data-id="${value.itemId}">${addAmount(
            value.itemStock,
            value.itemAmount
        )}</div>
          <div class="price">${value.itemPrice} €</div>
          <button data-id="${value.itemId}" data-size="${
            value.itemSize
        }" class="remove-btn">X</button>
        </div>
        <hr>
      </div>
      `;
    });

    // Template for total price summary
    summaryTempl = `
        <p id='vat'>VAT: 19%</p>
        <p id='subtotal-text'></p>
        <button class="buy-btn">BUY</button>
        <button class="clear-btn">CLEAR</button>
        <p id='buy_text'></p> 
        `;
    // Link html
    el('#summary').innerHTML = cartTempl;
    el('.subtotal-wrapper').innerHTML = summaryTempl;

    // Event Listeners for remove button
    const removeButtons = group('.remove-btn');
    const summaryAmountSelects = group('.summary-amount');

    // Event Listener for clear button
    el('.clear-btn').addEventListener('click', clearCart);

    /**
     * Function that passes a JSON object to the server by clicking 'BUY'
     */
    el('.buy-btn').addEventListener('click', function(){
        console.log(`Pass data to server: ${JSON.stringify(cartObj, null, 4)}`)
        el('#buy_text').innerHTML = 'Thank&nbsp;you&nbsp;for&nbsp;your&nbsp;purchase!<p><br><i>Check out the console to see the data passed to the server as an JSON object.</i><p><br> 👩‍💻 Hi, I&nbsp;am&nbsp;Ekaterina, UX/UI&nbsp;Designer with coding&nbsp;skills. <br><p>This is a final team&nbsp;project, developed during the <br>Web&nbsp;Development&nbsp;JS: <br>Basic&nbsp;course (May, 2023). Have a look at my portfolio at <a href="https://github.com/ekaterinakalina" target="_blank" rel="external">Github</a>'
    });

    removeButtons.forEach((button) => {
        button.addEventListener('click', handleDeleteItem);
    });

    summaryAmountSelects.forEach((select) => {
        select.addEventListener('change', selectAmount);
    });
}

/**
 * Function for cart that checks if product is already in cart and only increases the quantity
 */

function selectAmount(e) {
    const select = e.target;
    const selectedValue = parseInt(select.value);
    const previousValue =
        parseInt(select.parentNode.getAttribute('data-previous-value')) ||
        parseInt(select.dataset.previousValue);

    // Picking up ID that was set on creation
    const previousId = select.parentNode.getAttribute('data-id');

    if (selectedValue > previousValue) {
        // Amount has increased
        const difference = selectedValue - previousValue;

        cartObj.productArr.forEach((value) => {
            if (value.itemId == previousId) {
                value.itemAmount = (
                    parseInt(value.itemAmount) + difference
                ).toString();
            }
        });

        updateAmountPrice();

    } else if (selectedValue < previousValue) {
        // Amount has decreased
        const difference = previousValue - selectedValue;
        cartObj.totalItems -= difference;

        cartObj.productArr.forEach((value) => {
            if (value.itemId == previousId) {
                value.itemAmount = (
                    parseInt(value.itemAmount) - difference
                ).toString();
            }
        });

        // Update amount if there are changes
        updateAmountPrice();

    } else {
        //No value has changed
    }

    // Only initially
    select.parentNode.removeAttribute('data-previous-value');

    // Update the previous value in Dataset of the select form
    select.dataset.previousValue = selectedValue;
}

/**
 * Function that deletes a cart object
 */

function handleDeleteItem(e) {
    // Empty cart html first
    el('#summary').innerHTML = '';

    // Filter out all items that are not equal with the ID
    function deleteProductById(id, size) {
        cartObj.productArr = cartObj.productArr.filter((product) => {
            // Filter products where neither ID nor size match.
            return product.itemId !== id || product.itemSize !== size;
        });
    }
    deleteProductById(
        e.target.getAttribute('data-id'),
        e.target.getAttribute('data-size')
    );
    // Recreate updated cart
    createCart(cartObj.productArr);
    
    // Update the number of items in the cart; calculate the total price
    updateAmountPrice();

    // Remove the cart summary if no product is left
    if(cartObj.productArr.length < 1) {
        el('.subtotal-wrapper').innerHTML = ' '
    }
}

/**
 * Function that updates the quantity of products next to the cart symbol
 * Calculate and update the total price
 */

function updateAmountPrice() {
    // Total amount
    sum = 0;
    sumAmount = 0;
    vat = 1.19;

    cartObj.productArr.forEach((val) => {
        sum += parseInt(val.itemAmount);
        // Calculate total price with vat
        sumAmount += parseFloat(val.itemPrice) * vat * parseInt(val.itemAmount);
    });

    // Link to the object elements + html
    cartObj.totalPrice = sumAmount.toFixed(2);

    let templ = `<b> Subtotal: ${cartObj.totalPrice} </b>`;

    cartObj.totalItems = sum;
    el('#cart-amount-text').innerText = cartObj.totalItems;
    el('#subtotal-text').innerHTML = templ;
}

/**
 * Function that clears the cart.
 */
function clearCart() {
    // Empty the elements
    cartObj.productArr = [];
    cartObj.totalItems = ' ';
    cartObj.totalPrice = 0;

    updateAmountPrice();
    createCart(cartObj.productArr);

    el('.subtotal-wrapper').innerHTML = ' ';
}

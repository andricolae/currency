const apiKey = '9394ba5026a86ce9357d1a8f';
const apiUrlLatest = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;
const apiUrlCodes = 'https://v6.exchangerate-api.com/v6/${apiKey}/codes/';

let exchangeRates = {};

/********************
    ERROR HANDLING
 ********************/

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = message;
    errorMessage.style.display = 'block';
}
function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}
function disableButton(disable) {
    document.getElementById('convert').disabled = disable;
}

/*****************
    AT APP LOAD
 *****************/

window.onload = function() {
    const lastFetch = parseInt(localStorage.getItem('lastFetch'), 10);
    const isFreshData = Date.now() - lastFetch < 30 * 24 * 60 * 60 * 1000;

    if (navigator.onLine) {
        fetchCurrencyData();
    } else {
        showError("You are offline. Unable to fetch currency data.");
        loadCachedData();
    }
}

/*****************
    FETCH DATA
 *****************/

function fetchCurrencyData() {
    fetch (`${apiUrlLatest}RON`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data);
            if (data && data.conversion_rates) {
                exchangeRates = data.conversion_rates;
                console.log("Exchange Rates: " , exchangeRates);
                localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
                localStorage.setItem('lastFetch', Date.now().toString());
                populateCurrencyOptions(Object.keys(exchangeRates));
            } else {
                showError("Unexpected API response format.");
            }
        })
        .catch(error => {
            showError("Failed to fetch data. Using cached data if available.");
            console.error("Fetch error:", error);
            loadCachedData();
        });
}

function loadCachedData() {
    const cachedRates = JSON.parse(localStorage.getItem('exchangeRates'));
    if (cachedRates) {
        exchangeRates = cachedRates;
        populateCurrencyOptions(Object.keys(exchangeRates));
    } else {
        showError("No cached data available. Please connect to the internet.");
    }
}

function populateCurrencyOptions(currencies) {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    fromCurrency.innerHTML = '';
    toCurrency.innerHTML = '';

    currencies.forEach(currency => {
        const option1 = document.createElement('option');
        option1.value = currency;
        option1.text = currency;

        const option2 = document.createElement('option');
        option2.value = currency;
        option2.text = currency;

        fromCurrency.appendChild(option1);
        toCurrency.appendChild(option2);
    });
}

z   /*********************
    DATA VALIDATION
 *********************/

document.getElementById('amount').addEventListener('keypress', function(event) {
    const charCode = event.key.charCodeAt(0);
    const inputValue = this.value;

    if (!((charCode >= 48 && charCode <= 57) || charCode === 46)) {
        event.preventDefault();
        showError("⚠ VALUE TOO LOW! Only positive numbers!");
        disableButton(true);
    } else {
        if (charCode === 46 && inputValue.includes('.')) {
            event.preventDefault();
            showError("⚠ VALUE TOO LOW! Only positive numbers!");
            disableButton(true);
        } else if (inputValue.includes('.')) {
            const decimalPart = inputValue.split('.')[1];
            if (decimalPart && decimalPart.length >= 2) {
                event.preventDefault();
                showError("⚠ VALUE TOO LOW! Only positive numbers!");
                disableButton(true);
            } else {
                hideError();
                disableButton(false);
            }
        } else {
            hideError();
            disableButton(false);
        }
    }
});

/*****************
    CONVERSIONS
 *****************/

function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (amount > 0 && exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
        const convertedAmount = (amount / exchangeRates[fromCurrency]) * exchangeRates[toCurrency];
        document.getElementById('result').innerText = `RESULT: ${convertedAmount.toFixed(2)} ${toCurrency}`;
    } else {
        showError("Invalid amount or currencies.");
    }
}

// async function convertCurrency() {
//     const amount = document.getElementById('amount').value;
//     const fromCurrency = document.getElementById('fromCurrency').value;
//     const toCurrency = document.getElementById('toCurrency').value;

//     if (amount == 0){
//         showError("⚠ VALUE TOO LOW! Only positive numbers!");
//         return;
//     } else {
//         hideError();
//     }

//     if (!amount || !fromCurrency || !toCurrency) {
//         showError("⚠ VALUE TOO LOW! Only positive numbers!");
//         return;
//     } else {
//         hideError();
//     }

//     if (navigator.onLine) {
//         const result = await fetchExchangeRate(fromCurrency, toCurrency);
//         const exchangeRate = result[0];
//         const dateOfCurrency = result[1];
//         console.log(dateOfCurrency);
//         const sanitizedDateOfCurrency = dateOfCurrency.substr(0, dateOfCurrency.length-15);
//         console.log(sanitizedDateOfCurrency);
//         if (exchangeRate) {
//             const result = (amount * exchangeRate).toFixed(2);
//             document.getElementById('result').innerText = `RESULT: ${result} ${toCurrency} (Exchange rate: 1 ${fromCurrency} = ${exchangeRate} ${toCurrency} on ${sanitizedDateOfCurrency})`;
//             document.getElementById('result').style.display = 'block';
//             document.getElementById('copy').style.display = 'block';
//         } else {
//             showError("⚠ Failed to fetch currency data.");
//         }
//     }
//     else {
//         console.log("Exchange rates in Local Storage:", localStorage.getItem('exchangeRates'));

//         const usdRates = JSON.parse(localStorage.getItem('exchangeRates'));
//         console.log("Rates:", usdRates);

//         const result = convertUsingLocalStorage(fromCurrency, toCurrency, amount);

//         console.log(`Conversie finală: ${amount} ${fromCurrency} = ${result} ${toCurrency}`);

//         const resultElement = document.getElementById('result');
//         console.log(resultElement);

//         document.getElementById('result').innerText = `RESULT: ${result} ${toCurrency}`;
//     }
// }

function convertUsingLocalStorage(fromCurrency, toCurrency, amount) {
    const usdRates = JSON.parse(localStorage.getItem('exchangeRates'));

    if (!usdRates) {
        console.error("Ratele de schimb relative la USD nu sunt disponibile în Local Storage.");
        return null;
    }

    const fromRate = usdRates[fromCurrency];
    const toRate = usdRates[toCurrency];

    if (!fromRate) {
        console.error(`Rata pentru ${fromCurrency} nu este disponibilă.`);
        return null;
    }

    if (!toRate) {
        console.error(`Rata pentru ${toCurrency} nu este disponibilă.`);
        return null;
    }

    const result = ((amount / fromRate) * toRate).toFixed(2);

    return result;
}

/*****************
    COPY RESULT
 *****************/

function copyResult() {
    const textToCopy = document.getElementById('result').innerText;
    if (!textToCopy || textToCopy === '') {
        showError("⚠ NOTHING TO COPY");
        setTimeout(() => {
            hideError();
        }, 2000);
        return;
    }

    let sanitezedTextToCopy = textToCopy.replace("RESULT: ", "").trim();

    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = sanitezedTextToCopy;

    document.body.appendChild(tempTextArea);

    tempTextArea.select();
    document.execCommand('copy');

    document.body.removeChild(tempTextArea);
    showError("Copied to clipboard!");
    setTimeout(() => {
        hideError();
    }, 2000);
}

/*****************
    SWAP CURRENCY
 *****************/

function swapCurrencies() {
    const fromCurrencyDropdown = document.getElementById('fromCurrency');
    const toCurrencyDropdown = document.getElementById('toCurrency');

    const temp = fromCurrencyDropdown.value;
    fromCurrencyDropdown.value = toCurrencyDropdown.value;
    toCurrencyDropdown.value = temp;
}

/*****************
    RESET FIELDS
 *****************/

function resetFields() {
    document.getElementById('amount').value = "Enter the amount to convert";
    document.getElementById('result').innerHTML = "RESULT:"
    document.getElementById('fromCurrency').value = 'Romanian Leu';
    document.getElementById('toCurrency').value = 'Romanian Leu';
    document.getElementById('result').style.display = 'none';
    document.getElementById('copy').style.display = 'none';
}

const apiKey = '9394ba5026a86ce9357d1a8f';
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;

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
    populateCurrencyDropdowns();

    const oneDay = 24 * 60 * 60 * 1000;
    const lastUpdated = localStorage.getItem('lastUpdated');

    if (!lastUpdated || (Date.now() - lastUpdated) > oneDay) {
        fetchAndStoreExchangeRates();
    }
}

/*****************
    FETCH DATA
 *****************/
async function fetchExchangeRate(fromCurrency, toCurrency) {
    let result = [];
    try {
        const response = await fetch(`${apiUrl}${fromCurrency}`);
        const data = await response.json();
        if (data.result === "success") {
            result.push(data.conversion_rates[toCurrency]);
            result.push(data.time_last_update_utc);
            return result;
            //return data.conversion_rates[toCurrency];
        } else {
            throw new Error("ERROR AT FETCH");
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function fetchAllCurrencies() {
    try {
        const response = await fetch('https://v6.exchangerate-api.com/v6/9394ba5026a86ce9357d1a8f/codes/')
        if (!response.ok) {
            showError("⚠ API Fetch not successful!");
            throw new Error("NO NETWORK RESPONSE");
        }
        const data = await response.json();
    } catch (error) {
        showError("⚠ Failed to fetch currency data.");
    }
    return data;
}

async function populateCurrencyDropdowns() {
        try {
            const response = await fetch(`${apiUrl}RON`);
            if (!response.ok) {
                showError("⚠ Failed to fetch currency data.");
                throw new Error("NO NETWORK RESPONSE");
            }
            const data = await response.json();

            if (data.result === "success") {
                const currencies = Object.keys(data.conversion_rates);

                const fromCurrencyDropdown = document.getElementById('fromCurrency');
                const toCurrencyDropdown = document.getElementById('toCurrency');

                fromCurrencyDropdown.innerHTML = '';
                toCurrencyDropdown.innerHTML = '';

                currencies.forEach(currency => {
                    const optionFrom = document.createElement('option');
                    optionFrom.value = currency;
                    optionFrom.text = currency;
                    fromCurrencyDropdown.appendChild(optionFrom);

                    const optionTo = document.createElement('option');
                    optionTo.value = currency;
                    optionTo.text = currency;
                    toCurrencyDropdown.appendChild(optionTo);
                });
            } else {
                showError("⚠ Failed to fetch currency data.");
                throw new Error("FAILED FETCH");
            }
        } catch (error) {
            showError("⚠ Failed to fetch currency data.");
            showFetchErrorMessage();
        }
}

async function fetchAndStoreExchangeRates() {
    try {
        const savedRates = localStorage.getItem('exchangeRates');
        if (savedRates) {
            console.log("Cursurile valutare au fost deja salvate în Local Storage.");
            return;
        }

        const response = await fetch(`${apiUrl}USD`);
        const data = await response.json();

        if (data.result === 'success') {
            localStorage.setItem('exchangeRates', JSON.stringify(data.conversion_rates));
            localStorage.setItem('lastUpdated', Date.now());

            console.log("Cursurile valutare au fost salvate în Local Storage.");
        } else {
            console.error("Eroare la obținerea cursurilor valutare");
            showError("⚠ Failed to fetch currency data.");
        }
    } catch (error) {
        console.error("Eroare la solicitarea API: ", error);
        showError("⚠ Failed to fetch currency data.");
    }
}

/*********************
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
async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (amount == 0){
        showError("⚠ VALUE TOO LOW! Only positive numbers!");
        return;
    } else {
        hideError();
    }

    if (!amount || !fromCurrency || !toCurrency) {
        showError("⚠ VALUE TOO LOW! Only positive numbers!");
        return;
    } else {
        hideError();
    }

    if (navigator.onLine) {
        const result = await fetchExchangeRate(fromCurrency, toCurrency);
        const exchangeRate = result[0];
        const dateOfCurrency = result[1];
        console.log(dateOfCurrency);
        const sanitizedDateOfCurrency = dateOfCurrency.substr(0, dateOfCurrency.length-15);
        console.log(sanitizedDateOfCurrency);
        if (exchangeRate) {
            const result = (amount * exchangeRate).toFixed(2);
            document.getElementById('result').innerText = `RESULT: ${result} ${toCurrency} (Exchange rate: 1 ${fromCurrency} = ${exchangeRate} ${toCurrency} on ${sanitizedDateOfCurrency})`;
            document.getElementById('result').style.display = 'block';
            document.getElementById('copy').style.display = 'block';
        } else {
            showError("⚠ Failed to fetch currency data.");
        }
    }
    else {
        console.log("Exchange rates in Local Storage:", localStorage.getItem('exchangeRates'));

        const usdRates = JSON.parse(localStorage.getItem('exchangeRates'));
        console.log("Rates:", usdRates);

        const result = convertUsingLocalStorage(fromCurrency, toCurrency, amount);

        console.log(`Conversie finală: ${amount} ${fromCurrency} = ${result} ${toCurrency}`);

        const resultElement = document.getElementById('result');
        console.log(resultElement);

        document.getElementById('result').innerText = `RESULT: ${result} ${toCurrency}`;
    }
}

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

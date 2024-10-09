const apiKey = '9394ba5026a86ce9357d1a8f';
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;

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

function showErrorMessage() {
    document.getElementById('errorAmount').style.display = 'block';
}
function hideErrorMessage() {
    document.getElementById('errorAmount').style.display = 'none';
}
function disableButton(disable) {
    document.getElementById('convert').disabled = disable;
}

document.getElementById('amount').addEventListener('keypress', function(event) {
    const charCode = event.key.charCodeAt(0);
    const inputValue = this.value;

    if (!((charCode >= 48 && charCode <= 57) || charCode === 46)) {
        event.preventDefault();
        showErrorMessage();
        disableButton(true);
    } else {
        if (charCode === 46 && inputValue.includes('.')) {
            event.preventDefault();
            showErrorMessage();
            disableButton(true);
        } else if (inputValue.includes('.')) {
            const decimalPart = inputValue.split('.')[1];
            if (decimalPart && decimalPart.length >= 2) {
                event.preventDefault();
                showErrorMessage();
                disableButton(true);
            } else {
                hideErrorMessage();
                disableButton(false);
            }
        } else {
            hideErrorMessage();
            disableButton(false);
        }
    }
});


async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (amount == 0){
        showErrorMessage();
        return;
    } else {
        hideErrorMessage();
    }

    if (!amount || !fromCurrency || !toCurrency) {
        alert("FIELDS NOT FILLED IN");
        return;
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
        } else {
            alert("ERROR AT FETCH");
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
    // Retrieve exchange rates from Local Storage
    const usdRates = JSON.parse(localStorage.getItem('exchangeRates'));

    // Check if rates exist in Local Storage
    if (!usdRates) {
        console.error("Ratele de schimb relative la USD nu sunt disponibile în Local Storage.");
        return null;
    }

    // Get the conversion rate for the "fromCurrency" and "toCurrency"
    const fromRate = usdRates[fromCurrency];
    const toRate = usdRates[toCurrency];

    // // Debugging: Log the rates to verify
    // console.log("From currency rate:", fromRate);
    // console.log("To currency rate:", toRate);

    // Ensure that both rates are available
    if (!fromRate) {
        console.error(`Rata pentru ${fromCurrency} nu este disponibilă.`);
        return null;
    }

    if (!toRate) {
        console.error(`Rata pentru ${toCurrency} nu este disponibilă.`);
        return null;
    }

    // Perform the conversion using USD as an intermediary
    const result = ((amount / fromRate) * toRate).toFixed(2);

    return result;
}


async function populateCurrencyDropdowns() {
    try {
        const response = await fetch(`${apiUrl}RON`);
        if (!response.ok) {
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
            console.error("ERROR AT FETCH", data);
            throw new Error("FAILED FETCH");
        }
    } catch (error) {
        console.error("ERROR AT FETCH", error);
        alert("FAILED FETCH");
    }
}

async function fetchAndStoreExchangeRates() {
    // try {
    //     const baseCurrency = 'USD';
    //     const response = await fetch(`${apiUrl}${baseCurrency}`);
    //     const data = await response.json();

    //     if (data.result === 'success') {
    //         const currencies = Object.keys(data.conversion_rates);

    //         let allExchangeRates = {};

    //         for (const currency of currencies) {
    //             const currencyResponse = await fetch(`${apiUrl}${currency}`);
    //             const currencyData = await currencyResponse.json();

    //             if (currencyData.result === 'success') {
    //                 allExchangeRates[currency] = currencyData.conversion_rates;
    //             } else {
    //                 console.error(`Eroare la obținerea cursurilor pentru ${currency}`);
    //             }
    //         }

    //         localStorage.setItem('allExchangeRates', JSON.stringify(allExchangeRates));

    //         console.log("Toate cursurile valutare au fost salvate în Local Storage.");
    //     } else {
    //         console.error("Eroare la obținerea listei de valute.");
    //     }
    // } catch (error) {
    //     console.error("Eroare la solicitarea API: ", error);
    // }

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

            console.log("Cursurile valutare au fost salvate în Local Storage.");
        } else {
            console.error("Eroare la obținerea cursurilor valutare");
        }
    } catch (error) {
        console.error("Eroare la solicitarea API: ", error);
    }
}

window.onload = function() {
    populateCurrencyDropdowns();
    fetchAndStoreExchangeRates();

    const oneDay = 24 * 60 * 60 * 1000;
    const lastUpdated = localStorage.getItem('lastUpdated');

    if (!lastUpdated || (Date.now() - lastUpdated) > oneDay) {
        fetchAndStoreExchangeRates();
        localStorage.setItem('lastUpdated', Date.now());
    }
}

function resetFields() {
    document.getElementById('amount').value = "Enter the amount to convert";
    document.getElementById('result').innerHTML = "RESULT:"
    document.getElementById('fromCurrency').value = 'RON';
    document.getElementById('toCurrency').value = 'RON';
}

function copyResult() {
    const textToCopy = document.getElementById('result').innerText;
    if (!textToCopy || textToCopy === 'RESULT: ') {
        alert("No result to copy");
        return;
    }

    let sanitezedTextToCopy = textToCopy.replace("RESULT: ", "").trim();

    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = sanitezedTextToCopy;

    document.body.appendChild(tempTextArea);

    tempTextArea.select();
    document.execCommand('copy');

    document.body.removeChild(tempTextArea);
    alert("Result copied to clipboard!");
}

function swapCurrencies() {
    const fromCurrencyDropdown = document.getElementById('fromCurrency');
    const toCurrencyDropdown = document.getElementById('toCurrency');

    const temp = fromCurrencyDropdown.value;
    fromCurrencyDropdown.value = toCurrencyDropdown.value;
    toCurrencyDropdown.value = temp;
}

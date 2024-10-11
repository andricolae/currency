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

function showAmountErrorMessage() {
    document.getElementById('errorAmount').style.display = 'block';
}
function hideAmountErrorMessage() {
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
        showAmountErrorMessage();
        disableButton(true);
    } else {
        if (charCode === 46 && inputValue.includes('.')) {
            event.preventDefault();
            showAmountErrorMessage();
            disableButton(true);
        } else if (inputValue.includes('.')) {
            const decimalPart = inputValue.split('.')[1];
            if (decimalPart && decimalPart.length >= 2) {
                event.preventDefault();
                showAmountErrorMessage();
                disableButton(true);
            } else {
                hideAmountErrorMessage();
                disableButton(false);
            }
        } else {
            hideAmountErrorMessage();
            disableButton(false);
        }
    }
});


async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (amount == 0){
        showAmountErrorMessage();
        return;
    } else {
        hideAmountErrorMessage();
    }

    if (!amount || !fromCurrency || !toCurrency) {
        showAmountErrorMessage();
        return;
    } else {
        hideAmountErrorMessage();
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
            showFetchErrorMessage();
            setTimeout(() => {
                hideFetchErrorMessage();
            }, 2000);
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

function showFetchErrorMessage() {
    document.getElementById('errorAtFetch').style.display = 'block';
}
function hideFetchErrorMessage() {
    document.getElementById('errorAtFetch').style.display = 'none';
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


async function fetchAllCurrencies() {
    try {
        const response = await fetch('https://v6.exchangerate-api.com/v6/9394ba5026a86ce9357d1a8f/codes/')
        if (!response.ok) {
            throw new Error("NO NETWORK RESPONSE");
        }
        const data = await response.json();
    } catch (error) {
        console.error("ERROR AT FETCH", error);
        showFetchErrorMessage();
        setTimeout(() => {
            hideFetchErrorMessage();
        }, 2000);
    }
    return data;
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
            showFetchErrorMessage();
            setTimeout(() => {
                hideFetchErrorMessage();
            }, 2000);
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
    document.getElementById('fromCurrency').value = 'Romanian Leu';
    document.getElementById('toCurrency').value = 'Romanian Leu';
}

function showCopyErrorMessage() {
    document.getElementById('errorAtCopy').style.display = 'block';
}
function hideCopyErrorMessage() {
    document.getElementById('errorAtCopy').style.display = 'none';
}
function copyResult() {
    console.log("intru in functia de copy");
    const textToCopy = document.getElementById('result').innerText;
    if (!textToCopy || textToCopy === 'RESULT: ') {
        showCopyErrorMessage();
        setTimeout(() => {
            hideCopyErrorMessage();
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
    showCopySuccessMessage();
    setTimeout(() => {
        hideCopySuccessMessage();
    }, 2000);
}

function showCopySuccessMessage() {
    document.getElementById('successAtCopy').style.display = 'block';
}
function hideCopySuccessMessage() {
    document.getElementById('successAtCopy').style.display = 'none';
}

function swapCurrencies() {
    const fromCurrencyDropdown = document.getElementById('fromCurrency');
    const toCurrencyDropdown = document.getElementById('toCurrency');

    const temp = fromCurrencyDropdown.value;
    fromCurrencyDropdown.value = toCurrencyDropdown.value;
    toCurrencyDropdown.value = temp;
}

const apiKey = 'fb098d1ceb773cca7083cb3c';
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;

async function fetchExchangeRate(fromCurrency, toCurrency) {
    try {
        const response = await fetch(`${apiUrl}${fromCurrency}`);
        const data = await response.json();
        if (data.result === "success") {
            return data.conversion_rates[toCurrency];
        } else {
            throw new Error("ERROR AT FETCH");
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (!amount || !fromCurrency || !toCurrency) {
        alert("FIELDS NOT FILLED IN");
        return;
    }

    if (navigator.onLine) {
        const exchangeRate = await fetchExchangeRate(fromCurrency, toCurrency);
        if (exchangRate) {
            const result = (amount * exchangeRate).toFixed(2);
            document.getElementById('result').innerText = `RESULT: ${result} ${toCurrency} (Exchange rate: 1 ${fromCurrency} = ${exchangeRate} ${toCurrency})`;
            localStorage.setItem('lastRate', JSON.stringify({ fromCurrency, toCurrency, rate: exchangeRate }));
        } else {
            alert("ERROR AT FETCH");
        }
    } else {
        const savedRate = JSON.parse(localStorage.getItem('lastRate'));
        if (savedRate && savedRate.fromCurrency === fromCurrency && savedRate.toCurrency === toCurrency) {
            const result = (amount * savedRate.rate).toFixed(2);
            document.getElementById('result').innerText = `Offline result: ${amount} ${fromCurrency} = ${result} ${toCurrency} (Exchange rate: 1 ${fromCurrency} = ${savedRate.rate} ${toCurrency})`;
        } else {
            alert("NO CACHED DATA AVAILABLE");
        }
    }
}

async function populateCurrencyDropdowns() {
    try {
        const response = await fetch(`${apiUrl}RON`);
        if (!response.ok) {
            throw new Error("NO NETWORK RESPONSE");
        }
        const data = await response.json();

        console.log("Fetched data:", data);

        if (data.result === "success") {
            const currencies = Object.keys(data.conversion_rates);

            console.log("FETCHED CURRENCIES:", currencies);

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

window.onload = populateCurrencyDropdowns();

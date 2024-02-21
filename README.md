# Exchange Rates README

## Overview

Exchange Rates is an open-source project that provides daily exchange rates for various currencies. These rates are stored and made available via GitHub Pages, allowing easy access for developers and users alike.

## Usage

Use GET request to `http://rlz.github.io/exchange-rates/rates/{year}/{month}/{currency}.json` to get JSON object back with `month`, `currency` and `rates` field.

The `rates` field is an array of exchange rates from the currency to USD always starting from the first day of month. If month is the current month array can only available data and be shorter than number of days in the month.

You can see list of available currencies on [currencies](https://rlz.github.io/exchange-rates/currencies) page.

## Example

```console

$ curl https://rlz.github.io/exchange-rates/rates/2024/01/RUB.json 
{"month":"2024-01","currency":"RUB","rates":[89.21499633789062,89.21499633789062,90.3949966430664,91.96499633789062,91.31500244140625,91.31500244140625,91.31500244140625,90.8949966430664,90.8949966430664,90.8949966430664,90.88999938964844,89.88999938964844,89.88999938964844,89.88999938964844,89.88999938964844,89.88999938964844,87.94999694824219,88.62000274658203,88.62000274658203,88.62000274658203,88.62000274658203,89.41999816894531,87.98999786376953,87.98999786376953,88.69000244140625,88,88,88,88,89.2699966430664,89.73999786376953]}

```

## License

This project is licensed under the ISC License. See the LICENSE.txt file for more details.

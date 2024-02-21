import { JSX } from 'preact/jsx-runtime'

export function Docs(): JSX.Element {
    return (
        <div class="grow overflow-auto p-2 docs">
            <h1>Project Documentation</h1>
            <h2>Overview</h2>
            <p>
                Exchange Rates is an open-source project that provides daily exchange rates for various currencies. These rates are stored and made available via GitHub Pages, allowing easy access for developers and users alike.
            </p>
            <h2>Usage</h2>
            <p>
                Use
                {' '}
                <b>GET</b>
                {' '}
                request to
                {' '}
                <i>{'http://rlz.github.io/exchange-rates/rates/{year}/{month}/{currency}.json'}</i>
                {' '}
                to get JSON object back with
                {' '}
                <i>month</i>
                ,
                {' '}
                <i>currency</i>
                {' '}
                and
                {' '}
                <i>rates</i>
                {' '}
                field.
            </p>
            <p>
                The
                {' '}
                <i>rates</i>
                {' '}
                field is an array of exchange rates from the currency to USD always starting from the first day of month. If month is the current month array can only available data and be shorter than number of days in the month.
            </p>
            <p>
                You can see list of available currencies on
                {' '}
                <a href="https://rlz.github.io/exchange-rates/currencies">currencies</a>
                {' '}
                page.
            </p>
            <h2>Example</h2>
            <pre>
                <div class="command">$ curl https://rlz.github.io/exchange-rates/rates/2024/01/RUB.json</div>
                {
                    '{"month":"2024-01","currency":"RUB","rates":[89.21499633789062,89.21499633789062,<...>,89.73999786376953]}'
                }
            </pre>
            <h2>License</h2>
            <p>
                This project is licensed under the ISC License. See the
                {' '}
                <a href="https://github.com/rlz/exchange-rates/blob/main/LICENSE.txt">LICENSE.txt</a>
                {' '}
                file for more details.
            </p>
        </div>
    )
}

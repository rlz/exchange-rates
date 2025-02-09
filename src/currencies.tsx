import { DateTime } from 'luxon'
import { CURRENCY_RATES_SCHEMA, CurrencyRates } from './model'
import { useSignal } from '@preact/signals'
import { CURRENCIES } from './currenciesList'
import { useEffect } from 'preact/hooks'
import { Plot } from './plot'
import { JSX } from 'preact/jsx-runtime'

const baseUrl = import.meta.env.BASE_URL

async function loadRates(currency: string, date: DateTime): Promise<CurrencyRates> {
    // const baseUrl = 'https://rlz.github.io/exchange-rates/'
    const resp = await fetch(`${baseUrl}rates/${date.toFormat('yyyy')}/${date.toFormat('LL')}/${currency}.json`)

    if (!resp.ok) {
        throw Error(`Can not load rates for ${currency} ${date.toFormat('yyyy-LL')}`)
    }

    return CURRENCY_RATES_SCHEMA.parse(await resp.json())
}

function makeEmptyData(): [number[], number[]] {
    const dates = [
        DateTime.utc().startOf('day').minus({ day: 30 })
    ]
    for (let i = 0; i < 30; ++i) {
        dates.push(dates[dates.length - 1].plus({ day: 1 }))
    }
    return [dates.map(d => d.toSeconds()), []]
}

export function Currencies({ currency }: { currency: string }): JSX.Element {
    const filter = useSignal('')
    const plotData = useSignal<[number[], number[]]>(makeEmptyData())

    const f = filter.value.toLowerCase()
    const currentCur = currency !== '' ? CURRENCIES[currency] : null

    useEffect(() => {
        if (currentCur === null) return

        plotData.value = makeEmptyData();

        (
            async () => {
                const today = DateTime.utc().startOf('day')
                const startDate = today.minus({ days: 30 })

                const tasks: Promise<CurrencyRates>[] = [loadRates(currency, startDate)]

                if (today.month !== startDate.month) {
                    tasks.push(
                        (async () => {
                            try {
                                return await loadRates(currency, today)
                            }
                            catch (e) {
                                console.log(`Current month load fail (too early?):`, e)

                                return {
                                    month: 'yyyy-LL',
                                    currency,
                                    rates: []
                                }
                            }
                        })()
                    )
                }

                const loadedRates = (await Promise.all(tasks)).flatMap(i => i.rates).slice(startDate.day - 1)

                const ratesData: [number[], number[]] = [[], []]

                for (let i = 0; i < 31; ++i) {
                    ratesData[0].push(startDate.plus({ days: i }).toSeconds())
                    ratesData[1].push(loadedRates[i])
                }

                plotData.value = ratesData
            }
        )()
    }, [currentCur])

    return (
        <div class="grow flex basis-0 min-h-0">
            <div class="p-2 flex flex-col">
                <input
                    class="border rounded border-solid border-slate-500 p-1 w-full"
                    placeholder="Filter..."
                    value={filter}
                    onInput={(e) => { filter.value = e.currentTarget.value }}
                />
                <div class="grow overflow-auto mt-1">
                    {Object.values(CURRENCIES)
                        .sort((c1, c2) => c1.name.localeCompare(c2.name))
                        .filter((c) => {
                            if (c.code === 'USD') return false
                            if (f === '') return true
                            if (c.code.toLowerCase().indexOf(f) >= 0) return true
                            if (c.name.toLowerCase().indexOf(f) >= 0) return true
                            return false
                        })
                        .map((c) => {
                            return (
                                <div>
                                    <a href={baseUrl + 'currencies/' + c.code}>
                                        {c.name}
                                        {' '}
                                        (
                                        {c.code}
                                        )
                                    </a>
                                </div>
                            )
                        })}
                </div>
            </div>
            <div class="grow min-w-0">
                {
                    currentCur !== null
                        ? (
                                <>
                                    <h1 class="text-lg text-center">{currentCur.name}</h1>
                                    <Plot data={plotData.value} />
                                </>
                            )
                        : null
                }
            </div>
        </div>
    )
}

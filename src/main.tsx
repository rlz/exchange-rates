import { JSX, render } from 'preact'
import './main.css'
import Router, { Route, useRouter } from 'preact-router'
import { CURRENCIES } from './currenciesList'
import { useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { DateTime } from 'luxon'
import { CURRENCY_RATES_SCHEMA, CurrencyRates } from './model'

const baseUrl = import.meta.env.BASE_URL

function Plot({ data }: { data: [number[], number[]] }): JSX.Element {
    const plotRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (plotRef.current === null) return

        const rect = plotRef.current.getBoundingClientRect()

        const uplot = new uPlot(
            {
                width: rect.width,
                height: rect.height,
                tzDate: ts => uPlot.tzDate(new Date(ts * 1e3), 'UTC'),
                series: [
                    {
                        value: (_, ts) => typeof ts === 'number' ? DateTime.fromSeconds(ts).toUTC().toISODate() ?? '!error' : '--'
                    },
                    {
                        stroke: 'black'
                    }
                ]
            },
            data,
            plotRef.current
        )

        const resizeObserver = new ResizeObserver((entries) => {
            const newRect = entries[0].contentRect
            uplot.setSize({ width: newRect.width, height: newRect.height })
        })

        resizeObserver.observe(plotRef.current)

        return () => {
            resizeObserver.disconnect()
            uplot.destroy()
        }
    }, [plotRef, data])

    return <div ref={plotRef} class="h-52 w-auto" />
}

async function loadRates(currency: string, date: DateTime): Promise<CurrencyRates> {
    const resp = await fetch(`${baseUrl}currencies/${date.toFormat('yyyy')}/${date.toFormat('LL')}/${currency}.json`)

    if (!resp.ok) {
        throw Error(`Can not load rates for ${currency} ${date.toFormat('yyyy-LL')}`)
    }

    return CURRENCY_RATES_SCHEMA.parse(await resp.json())
}

function Currencies({ currency }: { currency: string }): JSX.Element {
    const filter = useSignal('')
    const plotData = useSignal<[number[], number[]] | null>(null)

    const f = filter.value.toLowerCase()
    const currentCur = currency !== '' ? CURRENCIES[currency] : null

    useEffect(() => {
        (
            async () => {
                const today = DateTime.utc().startOf('day')
                const startDate = today.minus({ days: 30 })

                const tasks: Promise<CurrencyRates>[] = [
                    loadRates(currency, startDate)
                ]

                if (today.month !== startDate.month) {
                    tasks.push(loadRates(currency, today))
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
            <div class="p-1 flex flex-col">
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
                                <Plot data={plotData.value ?? [[], []]} />
                            </>
                            )
                        : null
                }
            </div>
        </div>
    )
}

function Docs(): JSX.Element {
    return <div>TBD</div>
}

function Nav() {
    const [{ url }] = useRouter()

    return (
        <nav class="flex p-2 items-baseline">
            <h1 class="text-xl grow text-ellipsis overflow-hidden text-nowrap">Exchange Rates</h1>
            <div class="px-2">
                <a
                    class={url === baseUrl ? 'text-amber-700' : 'text-blue-700'}
                    href={baseUrl}
                >
                    Docs
                </a>
            </div>
            <div>
                <a
                    class={url.indexOf('/currencies') >= 0 ? 'text-amber-700' : 'text-blue-700'}
                    href={baseUrl + 'currencies'}
                >
                    Currencies
                </a>
            </div>
        </nav>
    )
}

function App() {
    return (
        <div class="flex flex-col h-screen w-screen">
            <Nav />
            <Router>
                <Route path={baseUrl} component={Docs} />
                <Route path={baseUrl + 'currencies/:currency?'} component={Currencies} />
            </Router>
            <div class="p-2 text-center">
                &copy; Dmitry Maslennikov, Project on
                {' '}
                <a class="text-blue-700" href="https://github.com/rlz/exchange-rates">GitHub</a>
            </div>
        </div>
    )
}

render(
    <App />,
    document.getElementById('app')!
)

import { mkdirSync, writeFileSync } from 'fs'
import { DateTime } from 'luxon'
import z from 'zod'

import { CURRENCIES } from '../src/currenciesList'
import { CurrencyRates } from '../src/model'

const notLoad = new Set([
    'USD',
    'HRK' // replaced by euro
])
const currencies = Object.keys(CURRENCIES).filter(i => !notLoad.has(i))
const startDate = DateTime.utc().startOf('day').minus({ month: 6 })
const endDate = DateTime.utc().startOf('day').minus({ day: 1 })

const IndicatorSchema = z.array(
    z.union([
        z.number().positive(),
        z.null()
    ])
)

const YahooRespSchema = z.object({
    chart: z.object({
        result: z.tuple([
            z.object({
                meta: z.object({
                    currency: z.string()
                }),
                timestamp: z.array(z.number().int()),
                indicators: z.object({
                    quote: z.tuple([
                        z.object({
                            high: IndicatorSchema,
                            low: IndicatorSchema,
                            open: IndicatorSchema,
                            close: IndicatorSchema
                        })
                    ]),
                    adjclose: z.array(
                        z.object({
                            adjclose: IndicatorSchema
                        })
                    )
                })
            })
        ]),
        error: z.null()
    })
})

function yToDate(yahooDate: number): DateTime {
    return DateTime.fromMillis(yahooDate * 1000, { zone: 'utc' })
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
}

type YahooResp = z.infer<typeof YahooRespSchema>

async function callYahoo(currency: string, from: DateTime, to: DateTime): Promise<YahooResp['chart']['result'][0]> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${currency}=X?period1=${from.toMillis() / 1000}&period2=${to.toMillis() / 1000}&interval=1d`
    const result = await fetch(url)

    if (!result.ok) {
        throw Error(`Not ok resp (${result.status} ${result.statusText}) for ${url}`)
    }

    const body = await result.json()
    const rates = YahooRespSchema.safeParse(body)

    if (!rates.success) {
        throw Error(`Can not parse Yahoo reply (${currency} ${from.toISO()} ${to.toISO()})\n---\n${JSON.stringify(body, undefined, 2)}`)
    }

    return rates.data.chart.result[0]
}

async function loadCurrency(currency: string, from: DateTime, to: DateTime): Promise<CurrencyRates[]> {
    const yahooResult = await callYahoo(currency, from.minus({ month: 1 }), to)
    const close = yahooResult.indicators.quote[0].close

    const nonNullInd = close.findIndex(i => i !== null)

    if (nonNullInd < 0) {
        throw Error(`Only nulls returned from Yahoo for ${currency}`)
    }

    const startMonth = yToDate(yahooResult.timestamp[nonNullInd]).set({ day: 1 }).plus({ month: 1 })

    const result: CurrencyRates[] = [{
        month: startMonth.toFormat('yyyy-LL'),
        currency,
        rates: []
    }]
    let current = result[0]
    let currentMonth = from.month
    let yahooInd = nonNullInd
    let yahooDate = yToDate(yahooResult.timestamp[yahooInd])
    let prevDay = close[yahooInd] ?? -1
    for (let d = startMonth; d <= to; d = d.plus({ day: 1 })) {
        if (d.month !== currentMonth) {
            current = {
                month: d.toFormat('yyyy-LL'),
                currency,
                rates: []
            }
            result.push(current)
            currentMonth = d.month
        }

        while (yahooDate < d || close[yahooInd] === null) {
            yahooInd += 1
            yahooDate = yToDate(yahooResult.timestamp[yahooInd])
            const c = close[yahooInd]
            if (yahooDate < d && c !== null) {
                prevDay = c
            }
        }

        if (yahooDate.toMillis() === d.toMillis()) {
            const c = close[yahooInd]!

            current.rates.push(c)
            prevDay = c
        }
        else {
            current.rates.push(prevDay)
        }
    }

    return result
}

async function storeCurrency(currency: string, from: DateTime, to: DateTime): Promise<void> {
    const rates = await loadCurrency(currency, from, to)

    for (const r of rates) {
        const m = DateTime.fromFormat(r.month, 'yyyy-LL', { zone: 'utc' })

        const year = m.toFormat('yyyy')
        const month = m.toFormat('LL')

        mkdirSync(`./public/rates/${year}/${month}`, { recursive: true })

        writeFileSync(`./public/rates/${year}/${month}/${currency}.json`, JSON.stringify(r))
    }
}

async function loadAll(): Promise<void> {
    await Promise.all(currencies.map(async c => storeCurrency(c, startDate, endDate)))
}

await loadAll()

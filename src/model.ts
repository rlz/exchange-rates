import { z } from 'zod'

export const CURRENCY_RATES_SCHEMA = z.object({
    month: z.string(),
    currency: z.string(),
    rates: z.array(z.number().positive())
})

export type CurrencyRates = z.infer<typeof CURRENCY_RATES_SCHEMA>

import { DateTime } from 'luxon'
import { useEffect, useMemo, useRef } from 'preact/hooks'
import { JSX } from 'preact/jsx-runtime'
import uPlot from 'uplot'

export function Plot({ data }: { data: [number[], number[]] }): JSX.Element {
    const plotRef = useRef<HTMLDivElement>(null)
    const uplot = useMemo<{ i: uPlot | null }>(() => {
        return {
            i: null
        }
    }, [])

    useEffect(() => {
        if (uplot.i === null) return
        uplot.i.setData(data)
    }, [data])

    useEffect(() => {
        if (plotRef.current === null) return

        const rect = plotRef.current.getBoundingClientRect()

        uplot.i = new uPlot(
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
            if (uplot.i === null) return
            const newRect = entries[0].contentRect
            uplot.i.setSize({ width: newRect.width, height: newRect.height })
        })

        resizeObserver.observe(plotRef.current)

        return () => {
            resizeObserver.disconnect()
            uplot.i?.destroy()
        }
    }, [plotRef])

    return <div ref={plotRef} class="h-52 w-auto" />
}

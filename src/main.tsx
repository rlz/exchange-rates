import { render } from 'preact'
import './main.css'
import Router, { Route, useRouter } from 'preact-router'
import 'uplot/dist/uPlot.min.css'
import { Docs } from './docs'
import { Currencies } from './currencies'

const baseUrl = import.meta.env.BASE_URL

function Nav() {
    const [{ url }] = useRouter()

    return (
        <nav class="flex p-3 items-baseline bg-neutral-50 border-cyan-900 border">
            <h1 class="text-xl font-bold grow text-ellipsis overflow-hidden text-nowrap text-cyan-800">Exchange Rates</h1>
            <div class="px-2">
                <a
                    class={url === baseUrl ? 'text-amber-900' : 'text-cyan-900'}
                    href={baseUrl}
                >
                    Docs
                </a>
            </div>
            <div>
                <a
                    class={url.indexOf('/currencies') >= 0 ? 'text-amber-900' : 'text-cyan-900'}
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
                <a class="underline text-cyan-800" href="https://github.com/rlz/exchange-rates">GitHub</a>
            </div>
        </div>
    )
}

render(
    <App />,
    document.getElementById('app')!
)

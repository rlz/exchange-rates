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

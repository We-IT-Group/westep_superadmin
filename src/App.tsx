import {BrowserRouter as Router} from "react-router";
import {ScrollToTop} from "./components/common/ScrollToTop";
import Route from "./route";

export default function App() {
    return (
        <>
            <Router>
                <ScrollToTop/>
                <Route/>
            </Router>
        </>
    );
}

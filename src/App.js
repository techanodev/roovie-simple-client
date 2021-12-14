import "bootstrap/dist/css/bootstrap.min.css";
import Room from "./pages/Room";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./resources/style.css";

function App() {
    return (
        <>
            <ToastContainer />
            <Room />
        </>
    );
}

export default App;

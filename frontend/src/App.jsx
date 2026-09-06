import {
    useState,
} from "react";

import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import {
    Tool,
} from "./models/layout";

import MenuBar from "./components/menubar/MenuBar";
import LayoutPage from "./pages/LayoutPage";
import Z21TestPanel from "./components/digital/Z21TestPanel";

import {
    ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function App() {
    const [tool, setTool] = useState(
        Tool.PEN
    );

    return (
        <>
            <ToastContainer />

            <MenuBar
                tool={tool}
                setTool={setTool}
            />

            <Routes>
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/layouts"
                            replace
                        />
                    }
                />

                <Route
                    path="/layouts"
                    element={
                        <LayoutPage
                            tool={tool}
                            setTool={setTool}
                        />
                    }
                />

                <Route
                    path="/digital-test"
                    element={
                        <Z21TestPanel />
                    }
                />
            </Routes>
        </>
    );
}

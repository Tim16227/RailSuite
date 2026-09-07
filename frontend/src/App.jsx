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
    /*
     * Aktuell ausgewähltes Layout-Werkzeug.
     *
     * Wichtig:
     * Dieser State bleibt unabhängig vom Editiermodus.
     */
    const [tool, setTool] = useState(
        Tool.PEN
    );

    /*
     * Globaler Editiermodus.
     *
     * true  = Layout darf verändert werden
     * false = Betriebsmodus / Layout geschützt
     */
    const [editMode, setEditMode] =
        useState(false);

    return (
        <>
            <ToastContainer />

            <MenuBar
                tool={tool}
                setTool={setTool}
                editMode={editMode}
                setEditMode={setEditMode}
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
                            editMode={editMode}
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
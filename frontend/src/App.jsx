import {
    useState,
} from "react";

import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import MenuBar from "./components/menubar/MenuBar";
import LayoutPage from "./pages/LayoutPage";
import Z21TestPanel from "./components/digital/Z21TestPanel";

import {
    ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import {
    DialogProvider,
} from "./components/dialog/utils/DialogProvider";

export default function App() {
    /*
     * null bedeutet:
     * Kein Werkzeug ausgewählt.
     *
     * Es gibt dafür bewusst keinen
     * eigenen Toolbar-Button mehr.
     */
    const [
        tool,
        setTool,
    ] = useState(null);

    const [
        editMode,
        setEditMode,
    ] = useState(false);

    return (
        <DialogProvider>
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
                            editMode={
                                editMode
                            }
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
        </DialogProvider>
    );
}
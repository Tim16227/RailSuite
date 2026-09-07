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

export default function App() {
    const [editMode, setEditMode] =
        useState(false);

    return (
        <>
            <ToastContainer />

            <MenuBar
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
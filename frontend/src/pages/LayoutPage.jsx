import { useEffect, useState } from "react";

import {
  createLayout,
  getLayouts,
} from "../api/layoutApi";

import { LayoutEditor } from "../components/layout/LayoutEditor";

export default function LayoutPage() {
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLayout();
  }, []);

  async function loadLayout() {
    try {
      setLoading(true);
      setError(null);

      const layouts = await getLayouts();

      if (layouts.length > 0) {
        setLayout(layouts[0]);
        return;
      }

      const newLayout = await createLayout({
        name: "Mein Gleisplan",
        width: 30,
        height: 20,
      });

      setLayout(newLayout);
    } catch (error) {
      console.error(error);
      setError(
        "Das Layout konnte nicht geladen werden."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Layout wird geladen...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!layout) {
    return <div>Kein Layout vorhanden.</div>;
  }

  return (
    <LayoutEditor
      initialLayout={layout}
    />
  );
}
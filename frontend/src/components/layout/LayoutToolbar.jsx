import {
  Tool,
} from "../../models/layout";

export function LayoutToolbar({
  tool,
  setTool,
}) {
  return (
    <div className="layout-toolbar">
      <div className="toolbar-group">
        <button
          type="button"
          className={
            tool === Tool.PEN
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.PEN)
          }
          title="Gleis zeichnen"
          aria-label="Gleis zeichnen"
        >
          ✏️
        </button>

        <button
          type="button"
          className={
            tool === Tool.ERASER
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.ERASER)
          }
          title="Gleis löschen"
          aria-label="Gleis löschen"
        >
          🧽
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          type="button"
          className={
            tool === Tool.STRAIGHT
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.STRAIGHT)
          }
          title="Gerade"
          aria-label="Gerade"
        >
          ━
        </button>

        <button
          type="button"
          className={
            tool === Tool.CURVE_45
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.CURVE_45)
          }
          title="45° Kurve"
          aria-label="45° Kurve"
        >
          ╱
        </button>

        <button
          type="button"
          className={
            tool === Tool.CURVE_90
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.CURVE_90)
          }
          title="90° Kurve"
          aria-label="90° Kurve"
        >
          ╭
        </button>

        <button
          type="button"
          className={
            tool === Tool.TURNOUT_LEFT
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.TURNOUT_LEFT)
          }
          title="Weiche links"
          aria-label="Weiche links"
        >
          ⑂
        </button>

        <button
          type="button"
          className={
            tool === Tool.TURNOUT_RIGHT
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.TURNOUT_RIGHT)
          }
          title="Weiche rechts"
          aria-label="Weiche rechts"
        >
          ⑄
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          type="button"
          className={
            tool === Tool.ROTATE_CCW
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.ROTATE_CCW)
          }
          title="45° gegen den Uhrzeigersinn drehen"
          aria-label="45° gegen den Uhrzeigersinn drehen"
        >
          ↶
        </button>

        <button
          type="button"
          className={
            tool === Tool.ROTATE_CW
              ? "active"
              : ""
          }
          onClick={() =>
            setTool(Tool.ROTATE_CW)
          }
          title="45° im Uhrzeigersinn drehen"
          aria-label="45° im Uhrzeigersinn drehen"
        >
          ↷
        </button>
      </div>
    </div>
  );
}
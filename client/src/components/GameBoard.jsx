import { useEffect, useRef } from "react";

export default function GameBoard({ rows, path, binIndex }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = 400;
        canvas.height = 500;

        const pegRadius = 4;
        const rowSpacing = 30;
        const colSpacing = 30;
        const offsetX = canvas.width / 2;
        const offsetY = 50;

        function drawPegs() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c <= r; c++) {
                    const x = offsetX + (c - r / 2) * colSpacing;
                    const y = offsetY + r * rowSpacing;
                    ctx.beginPath();
                    ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        drawPegs();

        if (path.length > 0) {
            animateBall(path);
        }

        function animateBall(path) {
            let pos = { x: offsetX, y: offsetY - 20 };
            let frame = 0;

            function drawFrame() {
                drawPegs();
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
                ctx.fill();

                if (frame < path.length) {
                    const step = path[frame];
                    const dir = step.decision === "R" ? 1 : -1;
                    pos.x += dir * colSpacing / 2;
                    pos.y += rowSpacing;
                    frame++;
                    requestAnimationFrame(drawFrame);
                } else {
                    // final bin pulse
                    ctx.fillStyle = "lime";
                    ctx.beginPath();
                    const finalX = offsetX + (binIndex - rows / 2) * colSpacing / 1;
                    const finalY = offsetY + rows * rowSpacing;
                    ctx.arc(finalX, finalY, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            drawFrame();
        }
    }, [path, binIndex, rows]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                style={{ background: "#222", borderRadius: "10px" }}
            />
        </div>
    );
}

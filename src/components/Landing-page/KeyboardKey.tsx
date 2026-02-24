export default function KeyboardKey() {
    const W = 108;
    const H = 77;
    const bodyH = 50;
    const footW = 80;
    const footH = H - bodyH;
    const r = 20;
    const borderColor = "rgba(210,213,218,0.5)";
    const fill = "#E3ECFF";
    const cR = 32; // radius of concave connector circle

    const shared = {
        position: "absolute",
        background: fill,
        boxSizing: "border-box",
    };

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#f0f2f5",
        }}>
            <div style={{ position: "relative", width: W, height: H }}>

                {/* Top body */}
                <div style={{
                    // ...shared,
                    position: "absolute",
                    background: fill,
                    top: 0, left: 0,
                    width: W, height: bodyH,
                    borderRadius: `${r}px ${r}px 0 0`,
                    border: `1px solid ${borderColor}`,
                    borderBottom: "none",
                }} />

                {/* Left foot */}
                <div style={{
                    // ...shared,
                    position: "absolute",
                    background: fill,
                    bottom: 0, left: 0,
                    width: footW, height: footH + 1,
                    borderRadius: `0 0 0 ${r}px`,
                    border: `1px solid ${borderColor}`,
                    borderTop: "none",
                    borderRight: "none",
                }} />

                {/* Right foot */}
                <div style={{
                    // ...shared,
                    position: "absolute",
                    background: fill,
                    bottom: 0, right: 0,
                    width: footW, height: footH + 1,
                    borderRadius: `0 0 ${r}px 0`,
                    border: `1px solid ${borderColor}`,
                    borderTop: "none",
                    borderLeft: "none",
                }} />

                {/* Bottom-left partial border (over left foot only) */}
                <div style={{
                    position: "absolute",
                    top: bodyH - 1,
                    left: 0,
                    width: footW,
                    height: 1,
                    background: borderColor,
                }} />

                {/* Bottom-right partial border (over right foot only) */}
                <div style={{
                    position: "absolute",
                    top: bodyH - 1,
                    right: 0,
                    width: footW,
                    height: 1,
                    background: borderColor,
                }} />

                {/* Concave connector LEFT — overflow:hidden clips a circle to show concave curve */}
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: footW - 1,
                    width: cR,
                    height: cR,
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: cR * 2,
                        height: cR * 2,
                        borderRadius: "50%",
                        border: `1px solid ${borderColor}`,
                        background: "transparent",
                    }} />
                </div>

                {/* Concave connector RIGHT */}
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    right: footW - 1,
                    width: cR,
                    height: cR,
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: cR * 2,
                        height: cR * 2,
                        borderRadius: "50%",
                        border: `1px solid ${borderColor}`,
                        background: "transparent",
                    }} />
                </div>

            </div>
        </div>
    );
}
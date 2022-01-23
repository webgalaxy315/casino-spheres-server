import React, { useEffect } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import jwtDecode from "jwt-decode";

const unityContext = new UnityContext({
    loaderUrl: "build/Build/build.loader.js",
    dataUrl: "build/Build/build.data",
    frameworkUrl: "build/Build/build.framework.js",
    codeUrl: "build/Build/build.wasm"
});

function Home() {
    useEffect(() => {
        unityContext.on("GameReady", function (message) {
            console.log("message", message)
            if (message === "Ready") {
                console.log("Success");
                try {
                    window.onmessage = (e) => {
                        if (e.data.name === "iframe_message") {
                            let user = jwtDecode(e.data.token);

                            console.log("GameManager", "RequestToken");
                            unityContext.send("GameManager", "RequestToken", JSON.stringify({
                                username: user,
                                token: e.data.token,
                                amount: e.data.allowanceAmount
                            }));
                        }
                    }
                    window.parent.postMessage({ name: "iframe_message" }, "*");
                } catch (err) {
                    console.log("error", err);
                }
            }
            else console.log("error");
        });
    }, []);

    return (
        <div>
            <Unity
                unityContext={unityContext}
                matchWebGLToCanvasSize={true}
                style={{ height: "90vh", marginTop: "5vh", width: "100%" }}
            />
        </div>
    );
}

export default Home
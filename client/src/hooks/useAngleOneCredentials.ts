interface UseAngleOneCredentialsProps {
    CLIENT_CODE: string;
    CLIENT_PASSWORD: string;
    MPIN: string;
    TOTP_SECRET: string;
    HISTORIC_API_KEY: string;
    REALTIME_API_KEY: string;
}

const useAngleOneCredentials = () => {

    const angleLogin = async (props: UseAngleOneCredentialsProps) => {
        const { CLIENT_CODE, CLIENT_PASSWORD, MPIN, TOTP_SECRET, HISTORIC_API_KEY, REALTIME_API_KEY } = props
        try {
            const token = localStorage.getItem("token");
            console.log(token);

            const respponse = await fetch("http://localhost:5000/api/angelone/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_token: token,
                    client_code: CLIENT_CODE,
                    password: CLIENT_PASSWORD,
                    mpin: MPIN,
                    totp_secret: TOTP_SECRET,
                    historic_api_key: HISTORIC_API_KEY,
                    realtime_api_key : REALTIME_API_KEY
                }),
            });
            const data = await respponse.json();
            if (respponse.ok) {
                console.log("Login successful", data);
            }
            else {
                console.error("Login failed", data);
            }
        } catch (error) {
            console.error("Error during login", error);
        }
    }

    return angleLogin;
}

export default useAngleOneCredentials
/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                ink: "#132321",
                canvas: "#f5f7f6",
                brand: {
                    50: "#effcf9",
                    100: "#d7f7f0",
                    500: "#119b87",
                    600: "#0f826f",
                    700: "#0f685b"
                },
                coral: "#f36f56"
            },
            boxShadow: {
                soft: "0 18px 45px rgba(19, 35, 33, 0.09)"
            }
        }
    },
    plugins: []
};

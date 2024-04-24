export const BaseHtml = ({ children, ...other }: any) => (
    <html>
        <head>
            <title>Hunter Bot</title>
            <script
                src="https://unpkg.com/htmx.org@1.9.8"
                integrity="sha384-rgjA7mptc2ETQqXoYC3/zJvkU7K/aP44Y+z7xQuJiVnB/422P/Ak+F/AqFR7E4Wr"
                crossorigin="anonymous"
            ></script>
            <script src="https://cdn.tailwindcss.com"></script>
            {/* <link rel="stylesheet" href="/public/style.css" /> */}
        </head>
        <body {...other} class="p-8" hx-ws="connect:/pubsub">
            <div
                hx-swap="outerHTML"
                class="bg-slate-400 rounded p-2"
                hx-get="/test"
            >
                Click me to change!
            </div>
            <div id="messages"></div>
        </body>
    </html>
);

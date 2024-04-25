export const BaseHtml = ({ children, ...other }: any) => (
    <html>
        <head>
            <title>Hunter Bot</title>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <script
                src="https://unpkg.com/htmx.org@1.9.8"
                integrity="sha384-rgjA7mptc2ETQqXoYC3/zJvkU7K/aP44Y+z7xQuJiVnB/422P/Ak+F/AqFR7E4Wr"
                crossorigin="anonymous"
            ></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/htmx.org@1.9.12/dist/ext/json-enc.js"></script>
            {/* <link rel="stylesheet" href="/public/style.css" /> */}
        </head>
        <body
            {...other}
            class="p-8 bg-slate-900 text-white"
            hx-ws="connect:/pubsub"
        >
            <div class="flex h-1/2 items-center justify-center mb-0.5 scale-150">
                <form hx-post="/login" hx-ext="json-enc" hx-swap="innerHTML">
                    <div>
                        <label>Key: </label>
                        <input
                            type="password"
                            name="key"
                            class="rounded bg-slate-950"
                        />
                        <br />
                    </div>
                </form>
            </div>
        </body>
    </html>
);

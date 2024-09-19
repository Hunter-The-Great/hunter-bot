export const BaseHtml = ({ children, title }: any) => (
    <html>
        <head>
            <title>{title}</title>
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
            <script src="https://unpkg.com/htmx-ext-response-targets@2.0.0/response-targets.js"></script>
            {/* <link rel="stylesheet" href="/public/style.css" /> */}
        </head>
        <body class="p-8 bg-slate-900 text-white" hx-ws="connect:/pubsub">
            <nav class="mb-8 flex gap-8 border-b-gray-500 border-b">
                <a href="/feedback">Feedback</a>
            </nav>
            {children}
        </body>
    </html>
);

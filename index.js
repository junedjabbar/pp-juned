const express = require('express')
const app = express()
const port = 3001

app.use(express.json())

app.post('/posts/html', (request, response) => {
    // Access the settings the user selected in Kit's sidebar with:
    const settings = request.body.settings

    // Return HTML for your element in the following shape:
    response.json({
        code: 200,
        html: `
      <div style="
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid red;
        color: blue;
        font-size: 20px;
      ">
        <h1>${settings.title}</h1>
        <p>${settings.description}</p>
        The user selected the post with ID 123!
      </div>
    `,
    })
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

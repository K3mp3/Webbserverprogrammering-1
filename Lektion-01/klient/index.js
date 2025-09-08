

const form = document.querySelector(".input-form") // Läs in formulär
const submitBtn = document.querySelector("button[type='submit']") // Läs in submit knapp

let inputName = form.elements.name.value // Läser in det som skrivs i namn input 
let inputMessage = form.elements.message.value //Läser in det som skrivs i message input

const checkInputs = () => {
    inputName = form.elements.name.value
    inputMessage = form.elements.message.value

    if (!inputName || !inputMessage) submitBtn.disabled = true
    else submitBtn.disabled = false
}

form.addEventListener("input", checkInputs)

form.addEventListener("submit", async (e) => { // e förkortning för event
    e.preventDefault() // Hindrar formuläret från att ladda om

    if (!inputName || !inputMessage) return alert("Fyll i båda fälten!")
})


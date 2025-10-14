import axios from "axios";

const form = document.querySelector(".input-form"); // Läs in formulär
const submitBtn = document.querySelector("button[type='submit']"); // Läs in submit knapp

let inputName = form.elements.name.value; // Läser in det som skrivs i namn input
let inputMessage = form.elements.message.value; //Läser in det som skrivs i message input

const checkInputs = () => {
  inputName = form.elements.name.value;
  inputMessage = form.elements.message.value;

  if (!inputName || !inputMessage) submitBtn.disabled = true;
  else submitBtn.disabled = false;
};

const displayMessages = (messages) => {
  console.log({ messages: messages });
  const messagesContainer = document.querySelector(".messages");
  console.log({ messagesContainer: messagesContainer });
  messagesContainer.innerHTML = "";

  messages.forEach((msg) => {
    console.log({ msg: msg });
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    const date = new Date(msg.timestamp).toLocaleString("sv-SE");

    // Visa uppdateringsdatum om det finns
    const updatedText = msg.updatedAt
      ? `<small> (uppdaterad: ${new Date(msg.updatedAt).toLocaleString(
          "sv-SE"
        )})</small>`
      : "";

    messageDiv.innerHTML = `
      <div class="message-header">
        <strong>${msg.name}</strong>
        <span class="timestamp">${date}${updatedText}</span>
      </div>
      <p class="message-content">${msg.message}</p>
      <button class="delete-btn" data-id="${msg.id}">Radera</button>
      <button class="update-btn" data-id="${msg.id}">Uppdatera</button>
    `;
    messagesContainer.appendChild(messageDiv);
  });

  // Lägg till event listeners för både radera och uppdatera
  addDeleteEventListeners();
  addUpdateEventListeners();
};

form.addEventListener("input", checkInputs);

form.addEventListener("submit", async (e) => {
  // e förkortning för event
  e.preventDefault(); // Hindrar formuläret från att ladda om

  if (!inputName || !inputMessage) return alert("Fyll i båda fälten!");

  const messageData = {
    name: inputName,
    message: inputMessage,
  };

  try {
    const response = await axios.post(
      "http://localhost:3000/messages",
      messageData
    );

    if (response.status === 201) {
      alert("Meddelandet sparades!");
      form.reset();
    } else {
      alert("Ett fel uppstod!");
    }
  } catch (error) {
    console.error("Fel:", error);
    alert("Kunde inte skicka meddelandet");
  }
});

window.addEventListener("load", async () => loadMessages());

const loadMessages = async () => {
  try {
    const response = await axios.get("http://localhost:3000/messages");

    console.log({ response: response.data.data });

    displayMessages(response.data.data);
  } catch (error) {}
};

const addDeleteEventListeners = () => {
  // Hitta alla knappar med klassen "delete-btn"
  const deleteButtons = document.querySelectorAll(".delete-btn");

  // Lägg till en klick-lyssnare på varje knapp
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });
};

const addUpdateEventListeners = () => {
  const updateButtons = document.querySelectorAll(".update-btn");

  updateButtons.forEach((btn) => {
    btn.addEventListener("click", handleUpdate);
  });
};

const handleUpdate = async (e) => {
  const messageId = e.target.dataset.id;
  const messageDiv = e.target.closest(".message");

  // Hämta nuvarande värden
  const currentName = messageDiv.querySelector(
    ".message-header strong"
  ).textContent;
  const currentMessage =
    messageDiv.querySelector(".message-content").textContent;

  // Skapa ett enkelt formulär för redigering
  const newName = prompt("Ändra namn:", currentName);
  if (newName === null) return; // Användaren avbröt

  const newMessage = prompt("Ändra meddelande:", currentMessage);
  if (newMessage === null) return; // Användaren avbröt

  try {
    const updates = {};

    // Lägg bara till fält som faktiskt uppdateras
    if (newName !== currentName) updates.name = newName;
    if (newMessage !== currentMessage) updates.message = newMessage;

    // Om inget ändrats, avbryt
    if (Object.keys(updates).length === 0) {
      alert("Inga ändringar gjordes");
      return;
    }

    const response = await axios.patch(
      `http://localhost:3000/messages/${messageId}`,
      updates
    );

    if (response.data.success === true) {
      alert("Meddelandet har uppdaterats!");
      await loadMessages();
    } else {
      alert("Kunde inte uppdatera meddelandet");
    }
  } catch (error) {
    alert("Kunde inte uppdatera meddelandet");
  }
};

const handleDelete = async (e) => {
  const messageId = e.target.dataset.id;
  console.log({ messageId: messageId });

  try {
    // Skicka DELETE-request till servern
    // Vi lägger till ID:t i URL:en
    const response = await axios.delete(
      `http://localhost:3000/messages/${messageId}`
    );

    if (response.data.success) {
      alert("Meddelandet raderades!");

      // Ladda om alla meddelanden för att visa uppdaterad lista
      await loadMessages();
    } else {
      alert("Kunde inte radera meddelandet");
    }
  } catch (error) {
    console.log("Fel vid radering:", error);

    if (error.response && error.response.status === 404) {
      alert("Meddelandet hittades inte");
    } else {
      alert("Kunde inte radera meddelandet");
    }
  }
};

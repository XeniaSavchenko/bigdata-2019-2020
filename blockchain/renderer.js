const fs = require("fs");
const path = require("path");
const prompt = require("electron-prompt");

const db_location = path.join(__dirname, "USERS");
const load_users = () => {
  const users = [];
  const user_folders = fs.readdirSync(db_location);
  for (let i = 0; i < user_folders.length; i++) {
    const user_folder = user_folders[i];
    const user_file = path.join(db_location, user_folder, "P");
    const content = fs.readFileSync(user_file, "utf8");
    const bits = content.split(";").filter(x => x);
    let [id, name, ...wallets] = bits;
    users.push({ id, name, wallets, user_folder });
  }
  return users;
};
const save_user = user => {
  const { id, name, wallets, user_folder } = user;
  const bits = [id, name, ...wallets];
  const content = bits.join(";");
  fs.writeFileSync(path.join(db_location, user_folder, "P"), content);
};

let logged_user;

const show_wallets = walletId => {
  let users = load_users();
  users = users.filter(user => {
    return user.wallets.some(wallet => {
      return wallet.startsWith(walletId);
    });
  });
  const rows = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const wallet = user.wallets.find(wallet => {
      return wallet.startsWith(walletId);
    });
    const money = Number(wallet.split("=")[1]);
    rows.push(`
    <tr>
      <td>${user.name}</td>
      <td>${money}</td>
      <td id="user-send-${user.id}"></td>
    </tr>
  `);
  }
  document.getElementById("users-container").innerHTML = rows.join("");
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.id !== logged_user.id) {
      const sendButton = document.createElement("button");
      sendButton.innerText = "Отправить 10";
      sendButton.onclick = event => {
        const sender = logged_user;
        const recipient = user;
        const sender_wallet = sender.wallets.find(wallet => {
          return wallet.startsWith(walletId);
        });
        const allowed = Number(sender_wallet.split("=")[1]);
        if (allowed > 10) {
          sender.wallets = sender.wallets.map(wallet => {
            if (wallet.startsWith(walletId)) {
              const money = Number(wallet.split("=")[1]) - 10;
              return `${walletId}=${money.toFixed(2)}`;
            }
            return wallet;
          });
          save_user(sender);
          recipient.wallets = recipient.wallets.map(wallet => {
            if (wallet.startsWith(walletId)) {
              const money = Number(wallet.split("=")[1]) + 10;
              return `${walletId}=${money.toFixed(2)}`;
            }
            return wallet;
          });
          save_user(recipient);
          show_wallets(walletId);
        }
      };
      document.getElementById(`user-send-${user.id}`).appendChild(sendButton);
    }
  }
};

const buttons = Array.from(document.getElementsByClassName("nav-item"));
for (let i = 0; i < buttons.length; i++) {
  const element = buttons[i];
  element.addEventListener("click", event => {
    const walletId = event.target.innerText;
    show_wallets(walletId);
    for (let j = 0; j < buttons.length; j++) {
      const _element = buttons[j];
      _element.classList.remove("nav-item-active");
    }
    event.target.classList.add("nav-item-active");
  });
}

prompt({
  title: "Ключ",
  label: "Ключ"
})
  .then(id => {
    const users = load_users();
    const user = users.find(user => user.id == id);
    if (user) {
      logged_user = user;
      document.getElementById("container").classList.remove("none");
      document.getElementById(
        "name-container"
      ).innerText = `Hello, ${user.name}`;
      show_wallets("BTC");
    } else {
      document.getElementById("error").classList.remove("none");
    }
  })
  .catch(console.error);

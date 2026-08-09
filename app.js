let highestZ = 20;

/* =========================
   JANELAS
========================= */

function openWindow(id) {

  const win = document.getElementById(id);

  if (!win) return;

  win.classList.remove("hidden");

  highestZ++;

  win.style.zIndex = highestZ;

  updateIndicator();

}


function closeWindow(id) {

  const win = document.getElementById(id);

  if (!win) return;

  win.classList.add("hidden");

  updateIndicator();

}


/* =========================
   TRAZER JANELA PARA FRENTE
========================= */

document.addEventListener("mousedown", function (event) {

  const win = event.target.closest(".window");

  if (!win) return;

  highestZ++;

  win.style.zIndex = highestZ;

});


/* =========================
   INDICADOR DA BARRA
========================= */

function updateIndicator() {

  const openWindows = [
    ...document.querySelectorAll(".window")
  ].filter(
    win => !win.classList.contains("hidden")
  );

  const indicator =
    document.getElementById("appIndicator");

  if (!indicator) return;

  if (openWindows.length === 0) {

    indicator.textContent =
      "Nenhum app aberto";

    return;

  }

  indicator.textContent =
    openWindows
      .map(win => {

        const title =
          win.querySelector(".win-title");

        return title
          ? title.innerText.trim()
          : "Aplicativo";

      })
      .join(" • ");

}


/* =========================
   MENU INICIAR
========================= */

function toggleStart() {

  const menu =
    document.getElementById("startMenu");

  if (!menu) return;

  menu.classList.toggle("show");

}


/* Fechar menu clicando fora */

document.addEventListener("click", function (event) {

  const menu =
    document.getElementById("startMenu");

  const button =
    document.querySelector(".start-btn");

  if (!menu || !button) return;

  if (
    menu.classList.contains("show") &&
    !menu.contains(event.target) &&
    !button.contains(event.target)
  ) {

    menu.classList.remove("show");

  }

});


/* =========================
   RELÓGIO
========================= */

function updateClock() {

  const clock =
    document.getElementById("clock");

  if (!clock) return;

  const now = new Date();

  const hours =
    String(now.getHours()).padStart(2, "0");

  const minutes =
    String(now.getMinutes()).padStart(2, "0");

  clock.textContent =
    `${hours}:${minutes}`;

}

setInterval(updateClock, 1000);

updateClock();


/* =========================
   CHROME VIRTUAL
========================= */

function navigateChrome() {

  const input =
    document.getElementById("chrome-url");

  const iframe =
    document.getElementById("chrome-iframe");

  if (!input || !iframe) return;

  let url =
    input.value.trim();

  if (!url) return;


  /*
     Se o usuário escrever apenas
     uma palavra, transforma em pesquisa.
  */

  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {

    url =
      "https://www.google.com/search?q=" +
      encodeURIComponent(url);

  }


  iframe.src = url;

}


/* Enter no navegador */

document.addEventListener("keydown", function (event) {

  const input =
    document.getElementById("chrome-url");

  if (!input) return;

  if (
    document.activeElement === input &&
    event.key === "Enter"
  ) {

    navigateChrome();

  }

});


/* =========================
   XODÓS
========================= */

function getXodos() {

  try {

    return JSON.parse(
      localStorage.getItem("meusXodos") || "[]"
    );

  } catch {

    return [];

  }

}


function saveXodos(xodos) {

  localStorage.setItem(
    "meusXodos",
    JSON.stringify(xodos)
  );

}


function addXodo() {

  const title =
    document
      .getElementById("xodo-title")
      ?.value
      .trim();

  const emoji =
    document
      .getElementById("xodo-emoji")
      ?.value
      .trim() || "⭐";

  const link =
    document
      .getElementById("xodo-link")
      ?.value
      .trim() || "";


  if (!title) {

    showToast(
      "Digite o nome do Xodó."
    );

    return;

  }


  const xodos =
    getXodos();


  xodos.push({

    id: Date.now(),

    title: title,

    emoji: emoji,

    link: link

  });


  saveXodos(xodos);


  document.getElementById(
    "xodo-title"
  ).value = "";

  document.getElementById(
    "xodo-emoji"
  ).value = "";

  document.getElementById(
    "xodo-link"
  ).value = "";


  loadXodos();

  showToast(
    "Xodó salvo com sucesso!"
  );

}


function loadXodos() {

  const container =
    document.getElementById(
      "xodoContainer"
    );

  if (!container) return;


  const xodos =
    getXodos();


  container.innerHTML = "";


  if (xodos.length === 0) {

    container.innerHTML = `
      <p style="
        color:#8298ae;
        padding:15px;
      ">
        Nenhum Xodó salvo ainda.
      </p>
    `;

    return;

  }


  xodos.forEach(function (xodo, index) {

    const card =
      document.createElement("div");

    card.className =
      "xodo-card";


    card.innerHTML = `

      <div class="emoji">
        ${escapeHtml(xodo.emoji)}
      </div>

      <h4>
        ${escapeHtml(xodo.title)}
      </h4>

      <p>
        ${escapeHtml(
          xodo.link || "Sem anotação"
        )}
      </p>

      <button
        onclick="deleteXodo(${index})">

        <i class="fa-solid fa-trash"></i>

        Excluir

      </button>

    `;


    /*
       Se for um link válido,
       permite abrir clicando no card.
    */

    if (
      xodo.link &&
      (
        xodo.link.startsWith(
          "https://"
        ) ||
        xodo.link.startsWith(
          "http://"
        )
      )
    ) {

      card.style.cursor =
        "pointer";


      card.addEventListener(
        "click",
        function (event) {

          if (
            event.target.closest(
              "button"
            )
          ) {

            return;

          }

          window.open(
            xodo.link,
            "_blank"
          );

        }
      );

    }


    container.appendChild(card);

  });

}


function deleteXodo(index) {

  const xodos =
    getXodos();


  if (
    !confirm(
      "Excluir este Xodó?"
    )
  ) {

    return;

  }


  xodos.splice(index, 1);

  saveXodos(xodos);

  loadXodos();

  showToast(
    "Xodó excluído."
  );

}


/* =========================
   BLOCO DE NOTAS
========================= */

function loadNotes() {

  const notepad =
    document.getElementById(
      "notepad"
    );

  if (!notepad) return;


  notepad.value =
    localStorage.getItem(
      "pcNotas"
    ) || "";


  notepad.addEventListener(
    "input",
    function () {

      localStorage.setItem(
        "pcNotas",
        this.value
      );

    }
  );

}


loadNotes();


/* =========================
   PAPEL DE PAREDE
========================= */

function changeWallpaper(type) {

  const desktop =
    document.querySelector(
      ".desktop"
    );

  if (!desktop) return;


  if (type === 1) {

    desktop.style.background = `
      linear-gradient(
        135deg,
        #07111f,
        #164b78,
        #07111f
      )
    `;

  }


  if (type === 2) {

    desktop.style.background = `
      linear-gradient(
        135deg,
        #160b2c,
        #55207b,
        #0d1025
      )
    `;

  }


  if (type === 3) {

    desktop.style.background = `
      linear-gradient(
        135deg,
        #050505,
        #111111,
        #030303
      )
    `;

  }


  localStorage.setItem(
    "wallpaper",
    String(type)
  );


  showToast(
    "Papel de parede alterado!"
  );

}


function loadWallpaper() {

  const saved =
    Number(
      localStorage.getItem(
        "wallpaper"
      )
    );


  if (saved >= 1 && saved <= 3) {

    changeWallpaper(
      saved
    );

  }

}


loadWallpaper();


/* =========================
   LIMPAR DADOS
========================= */

function clearData() {

  const confirmDelete =
    confirm(
      "Isso vai apagar seus Xodós, notas e configurações. Continuar?"
    );


  if (!confirmDelete) return;


  localStorage.removeItem(
    "meusXodos"
  );

  localStorage.removeItem(
    "pcNotas"
  );

  localStorage.removeItem(
    "wallpaper"
  );


  showToast(
    "Dados apagados!"
  );


  setTimeout(
    function () {

      location.reload();

    },
    700
  );

}


/* =========================
   NOTIFICAÇÕES
========================= */

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) return;


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* =========================
   PROTEÇÃO DE HTML
========================= */

function escapeHtml(text) {

  return String(text)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================
   JANELAS ARRASTÁVEIS
========================= */

function makeWindowsDraggable() {

  const windows =
    document.querySelectorAll(
      ".window"
    );


  windows.forEach(function (win) {

    const header =
      win.querySelector(
        ".window-header"
      );

    if (!header) return;


    let dragging = false;

    let offsetX = 0;

    let offsetY = 0;


    header.addEventListener(
      "mousedown",
      function (event) {

        /*
           Não arrastar quando
           clicar no botão fechar.
        */

        if (
          event.target.closest(
            "button"
          )
        ) {

          return;

        }


        dragging = true;


        highestZ++;

        win.style.zIndex =
          highestZ;


        offsetX =
          event.clientX -
          win.offsetLeft;


        offsetY =
          event.clientY -
          win.offsetTop;


        document.body.style.userSelect =
          "none";

      }
    );


    document.addEventListener(
      "mousemove",
      function (event) {

        if (!dragging) return;


        let x =
          event.clientX -
          offsetX;


        let y =
          event.clientY -
          offsetY;


        /*
           Não deixa a janela
           sair completamente
           da tela.
        */

        x = Math.max(
          0,
          Math.min(
            window.innerWidth -
            win.offsetWidth,
            x
          )
        );


        y = Math.max(
          0,
          Math.min(
            window.innerHeight -
            100,
            y
          )
        );


        win.style.left =
          x + "px";


        win.style.top =
          y + "px";

      }
    );


    document.addEventListener(
      "mouseup",
      function () {

        dragging = false;

        document.body.style.userSelect =
          "";

      }
    );

  });

}


makeWindowsDraggable();


/* =========================
   TECLADO
========================= */

document.addEventListener(
  "keydown",
  function (event) {

    /*
       ESC fecha o menu Iniciar.
    */

    if (event.key === "Escape") {

      const menu =
        document.getElementById(
          "startMenu"
        );

      if (menu) {

        menu.classList.remove(
          "show"
        );

      }

    }

  }
);


/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadXodos();

    updateClock();

    updateIndicator();

  }
);

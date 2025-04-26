// Aguarda carregamento da tela
document.addEventListener("DOMContentLoaded", () => {
  // SPLASH SCREEN
  setTimeout(() => {
    document.getElementById("splash-screen").style.display = "none";
  }, 3000);

  // NAVEGAÇÃO ENTRE ABAS
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // DADOS INICIAIS
  const hoje = new Date().toISOString().split("T")[0];
  let dados = JSON.parse(localStorage.getItem("semRefri365")) || {
    inicio: hoje,
    registros: {},
    conquistas: [],
    nome: "Usuário",
  };

  // CHECK-IN
  const botaoCheckin = document.getElementById("botao-checkin");
  botaoCheckin.addEventListener("click", () => {
    if (!dados.registros[hoje]) {
      const nota = document.getElementById("nota-pessoal").value;
      const humor =
        document.querySelector(".humores span.selecionado")?.dataset.humor ||
        "normal";

      dados.registros[hoje] = { nota, humor };
      localStorage.setItem("semRefri365", JSON.stringify(dados));

      alert("Check-in feito com sucesso! 💪");
      atualizarTudo();
    } else {
      alert("Você já fez check-in hoje.");
    }
  });

  // ÍCONES DE HUMOR
  document.querySelectorAll(".humores span").forEach((span) => {
    span.addEventListener("click", () => {
      document
        .querySelectorAll(".humores span")
        .forEach((s) => s.classList.remove("selecionado"));
      span.classList.add("selecionado");
    });
  });

  // FRASES MOTIVACIONAIS
  const frases = [
    "Você está mais forte a cada dia!",
    "Seu corpo agradece!",
    "Continue firme, vale a pena!",
    "Cada escolha saudável te aproxima do seu objetivo.",
    "Você está se superando!",
    "Orgulho define!",
  ];

  // CALCULA PROGRESSO
  function atualizarTudo() {
    const datas = Object.keys(dados.registros).sort();
    const totalDias = datas.length;
    const primeiroDia = new Date(dados.inicio);
    const hojeData = new Date();
    const diasDesdeInicio = Math.floor(
      (hojeData - primeiroDia) / (1000 * 60 * 60 * 24)
    );
    const diasRestantes = 365 - totalDias;
    const consecutivos = calcularConsecutivos(datas);

    document.getElementById("dias-sem-refri").textContent = totalDias;
    document.getElementById("dias-restantes").textContent = diasRestantes;
    document.getElementById("dias-consecutivos").textContent = consecutivos;
    document.getElementById("barra-progresso").style.width = `${
      (totalDias / 365) * 100
    }%`;
    document.getElementById("frase-motivacional").textContent =
      frases[Math.floor(Math.random() * frases.length)];
    document.getElementById("username").textContent = dados.nome || "Usuário";

    montarCalendario(datas);
    verificarConquistas(totalDias);
    gerarGraficos(totalDias);
  }

  // DIAS CONSECUTIVOS
  function calcularConsecutivos(dias) {
    let cont = 0;
    let hoje = new Date();
    while (dias.includes(hoje.toISOString().split("T")[0])) {
      cont++;
      hoje.setDate(hoje.getDate() - 1);
    }
    return cont;
  }

  // CALENDÁRIO
  function montarCalendario(diasCumpridos) {
    const cal = document.getElementById("calendario-container");
    cal.innerHTML = "";
    const hoje = new Date();
    hoje.setDate(hoje.getDate() - 30); // últimos 30 dias

    for (let i = 0; i < 31; i++) {
      const dia = hoje.toISOString().split("T")[0];
      const div = document.createElement("div");
      div.textContent = new Date(hoje).getDate();
      if (diasCumpridos.includes(dia)) div.classList.add("cumprido");
      cal.appendChild(div);
      hoje.setDate(hoje.getDate() + 1);
    }
  }

  // CONQUISTAS
  function verificarConquistas(qtd) {
    const conquistas = [
      { dias: 7, nome: "🎉 7 dias sem refri" },
      { dias: 15, nome: "🏆 15 dias" },
      { dias: 30, nome: "🔥 30 dias" },
      { dias: 100, nome: "💪 100 dias" },
      { dias: 200, nome: "🚀 200 dias" },
      { dias: 365, nome: "👑 365 dias" },
    ];

    conquistas.forEach((c) => {
      if (qtd >= c.dias && !dados.conquistas.includes(c.dias)) {
        dados.conquistas.push(c.dias);
        localStorage.setItem("semRefri365", JSON.stringify(dados));
        alert(`Parabéns! Você conquistou: ${c.nome}`);
        tocarSom();
        atualizarListaConquistas();
      }
    });
  }

  function atualizarListaConquistas() {
    const ul = document.getElementById("lista-conquistas");
    ul.innerHTML = "";
    dados.conquistas.forEach((d) => {
      const li = document.createElement("li");
      li.textContent = `${d} dias conquistados!`;
      ul.appendChild(li);
    });
  }

  // SOM DE CONQUISTA
  function tocarSom() {
    const audio = new Audio("celebrar.mp3");
    audio.play();
  }

  // GRÁFICOS (Chart.js necessário!)
  function gerarGraficos(total) {
    if (window.pizza) window.pizza.destroy();
    if (window.linha) window.linha.destroy();

    const ctx1 = document.getElementById("grafico-pizza").getContext("2d");
    window.pizza = new Chart(ctx1, {
      type: "pie",
      data: {
        labels: ["Dias sem refri", "Restantes"],
        datasets: [
          {
            data: [total, 365 - total],
            backgroundColor: ["#00bfa6", "#ccc"],
          },
        ],
      },
    });

    const ctx2 = document.getElementById("grafico-linha").getContext("2d");
    const dias = Object.keys(dados.registros).sort();
    window.linha = new Chart(ctx2, {
      type: "line",
      data: {
        labels: dias,
        datasets: [
          {
            label: "Check-ins",
            data: dias.map((_, i) => i + 1),
            borderColor: "#00bfa6",
            fill: false,
          },
        ],
      },
    });
  }

  // FOTO + NOME
  document.getElementById("input-foto").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        document.getElementById("foto-perfil").src = reader.result;
        localStorage.setItem("fotoPerfil", reader.result);
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("nome-usuario").addEventListener("input", (e) => {
    dados.nome = e.target.value;
    localStorage.setItem("semRefri365", JSON.stringify(dados));
    document.getElementById("username").textContent = e.target.value;
  });

  if (localStorage.getItem("fotoPerfil")) {
    document.getElementById("foto-perfil").src =
      localStorage.getItem("fotoPerfil");
  }

  // INICIALIZA
  atualizarTudo();
});

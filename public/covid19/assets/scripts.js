init();
async function init() {
  const token = localStorage.getItem("token");
  if (token) {
    ocultarLogin();
    let { masde10mil, paises } = await traerDatos(token);
    chart(masde10mil);
    crearTabla(paises);
  }
}

async function getToken(email, password) {
  let jwt = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  jwt = await jwt.json();
  token = jwt.token;
  localStorage.setItem("token", token);
  return token;
}

//traer datos
async function traerDatos(token) {
  const data = await fetch("/api/total");
  const totalMundial = await data.json();
  const paises = totalMundial.data;

  console.log(paises);
  let masde10mil = paises.filter((f) => {
    return f.deaths >= 100000;
  });
  return { masde10mil, paises };
}

//crea la tabla
function crearTabla(array) {
  for (x of array) {
    $("#cuerpo-tabla").append(`
            <tr>
                <td>${x.location}</td>
                <td>${x.confirmed}</td>
                <td>${x.deaths}</td>
                <td>${x.recovered}</td>
                <td>${x.active}</td>
                <td><button type="button" class="btn btn-link mostrarPais" data-bs-toggle="modal" data-bs-target="#modalPais">Ver Más</button></td>
            </tr>
            `);
  }
}

function chart(array) {
  var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    title: {
      text: "Países con Covid19",
    },
    axisY: {
      titleFontColor: "#424242",
      tickColor: "#424242",
      lineColor: "#424242",
      labelFontColor: "#424242",
    },
    axisY2: {
      titleFontColor: "#ff6f00",
      tickColor: "#ff6f00",
      lineColor: "#ff6f00",
      labelFontColor: "#ff6f00",
    },
    toolTip: {
      shared: true,
    },
    legend: {
      verticalAlign: "top",
      cursor: "pointer",
      itemclick: toggleDataSeries,
    },
    data: [
      {
        type: "column",
        color: "#f06292",
        name: "Casos Activos",
        legendText: "Casos Activos",
        showInLegend: true,
        dataPoints: array.map((x) => {
          return {
            label: x.location,
            y: x.active,
          };
        }),
      },
      {
        type: "column",
        color: "#ff6f00",
        name: "Casos Confirmados",
        legendText: "Casos Confirmados",
        axisYType: "secondary",
        showInLegend: true,
        dataPoints: array.map((x) => {
          return {
            label: x.location,
            y: x.confirmed,
          };
        }),
      },
      {
        type: "column",
        color: "#424242",
        name: "Fallecidos",
        legendText: "Fallecidos",
        showInLegend: true,
        dataPoints: array.map((x) => {
          return {
            label: x.location,
            y: x.deaths,
          };
        }),
      },
      {
        type: "column",
        color: "#4dd0e1",
        name: "Casos Recuperados",
        legendText: "Casos Recuperados",
        showInLegend: true,
        dataPoints: array.map((x) => {
          return {
            label: x.location,
            y: x.recovered,
          };
        }),
      },
    ],
  });
  chart.render();

  function toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    chart.render();
  }
}

$("#form-login").on("submit", async (ev) => {
  ev.preventDefault();
  const email = $("#email").val();
  const password = $("#password").val();

  const token = await getToken(email, password);
  let { masde10mil, paises } = await traerDatos();

  chart(masde10mil);
  crearTabla(paises);
  ocultarLogin();
});

$(document).on("click", ".mostrarPais", (ev) => {
  ev.preventDefault();

  $("#tituloModal").append(`<h5 class="modal-title">Argentina</h5>`);
  $("#modalBody").append(`<p>Casos covid</p>`);
});

function ocultarLogin() {
  $("#div-form").removeClass("d-block").addClass("d-none");
  $(".container").removeClass("d-none").addClass("d-block");
}

function mostrarLogin() {
  $("#div-form").removeClass("d-none").addClass("d-block");
  $(".container").removeClass("d-block").addClass("d-none");
}

function logout() {
  localStorage.removeItem("token");
  mostrarLogin();
}

$("#logout").on("click", function (ev) {
  logout();
});

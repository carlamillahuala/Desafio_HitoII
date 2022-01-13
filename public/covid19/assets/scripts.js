//LLamamos a la función init a penas carga el archivo
init();

//Función init contempla que si un usuario que tiene token vigente todavía,
//no le pida usuario y contraseña
//Esto porque si tienen token vigente, significa que ya tienen su sesión iniciada
async function init() {
  const token = localStorage.getItem("token");
  if (token) {
    ocultarLogin();
    let { masde10mil, paises } = await traerDatos(token);
    chart("chartContainer", masde10mil);
    crearTabla(paises);
  }
}

//La Función getToken sirve para llamar a la API con un fetch (más usuario y contraseña)
//y que nos devuelvuelva el token.
//También hace que al llamar a API nos indique si hay error con el res.status
async function getToken(email, password) {
  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (res.status >= 400) {
    throw new Error(json.message);
  } else {
    token = json.token;
    localStorage.setItem("token", token);
    return token;
  }
}

//Función traer datos nos devuelve toda la información covid mundial en la variable paises
//Y los países con más de 100000 muertes en la variable masde10mil
async function traerDatos(token) {
  const data = await fetch("/api/total");
  const totalMundial = await data.json();
  const paises = totalMundial.data;

  // console.log(paises);
  let masde10mil = paises.filter((f) => {
    return f.deaths >= 100000;
  });
  return { masde10mil, paises };
}

//Esta función sirve para dibujar en la tabla cuando le paso un array
//(en nuestro caso se llama paises el array)
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

//La creación del gráfico se pasó a esta función "Chart" que lo dibuja
//Recibe por parámetro un selector(porque hay que decirle si hacemos el gráfico grande o el del modal)
//y un array que que pueden ser los de la variable masde10mil o paisData
function chart(selector, array) {
  console.log(array);
  var chart = new CanvasJS.Chart(selector, {
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

// Este es el Jquey del formulario de login.
// En caso de que el usuario no tenga token, necesita identificarse con un usuario y contraseña válido
// Al hacer click con datos correctos:
// Este submit, crea un token a través de la función getToken y trae los datos con la función "traerDatos"
// Además, llama a la función ocultar login, dibujar gráfico y creat tabla
$("#form-login").on("submit", async (ev) => {
  ev.preventDefault();
  $("#cuerpo-tabla").empty();
  $("#chartContainer").empty();

  try {
    const email = $("#email").val();
    const password = $("#password").val();

    $("#login-error").addClass("d-none").empty();
    const token = await getToken(email, password);
    let { masde10mil, paises } = await traerDatos();

    $("#email").val("");
    $("#password").val("");
    ocultarLogin();
    chart("chartContainer", masde10mil);
    crearTabla(paises);
  } catch (err) {
    $("#login-error").removeClass("d-none").html(err.message);
  }
});

//Función para traer los datos específicos de un país, por eso hay que decirle qué país por parámetro
async function traerDetallePais(pais) {
  const data = await fetch(`/api/countries/${pais}`);
  let paisData = await data.json();
  paisData = paisData.data;

  return paisData;
}

//JQuery para cuando se hace click en "ver Más"
//Buscamos el país al que le hizo clic y con ese dato, llama a dibujar gráfico y pone titulo al modal
$(document).on("click", ".mostrarPais", async (ev) => {
  ev.preventDefault();
  $("#tituloModal").empty();
  $("#chartPais").empty();
  let tr = $(ev.target).parent().parent();
  let tds = $(tr).find("td");
  const pais = tds[0].textContent;

  let paisData = await traerDetallePais(pais);
  paisData = [paisData];

  $("#tituloModal").prepend(`<h5 class="modal-title">${pais}</h5>`);
  chart("chartPais", paisData);
});

//Esta función oculta el formulario de login y permite ser visibles al gráfico y tabla
function ocultarLogin() {
  $("#div-form").removeClass("d-block").addClass("d-none");
  $(".datos").removeClass("d-none").addClass("d-block");
}

//Esta función oculta el gráfico y tabla y muestra el login (Es para cuando el usuario cierra sesión)
function mostrarLogin() {
  $("#div-form").removeClass("d-none").addClass("d-block");
  $(".datos").removeClass("d-block").addClass("d-none");
}

//Función que elimina el token
function logout() {
  localStorage.removeItem("token");
  mostrarLogin();
}

//Enlace del menú para cerrar sesión, llama a la función logout que se encarga de eliminar el token
$("#logout").on("click", function (ev) {
  logout();
});

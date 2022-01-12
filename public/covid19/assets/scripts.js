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
  let { masde10mil } = await traerDatos();
  chart(masde10mil);
});

//traer datos
async function traerDatos() {
  const data = await fetch("/api/total");
  const totalMundial = await data.json();
  const paises = totalMundial.data;

  console.log(paises);
  let masde10mil = paises.filter((f) => {
    return f.deaths >= 100000;
  });
  return { masde10mil, paises };
}

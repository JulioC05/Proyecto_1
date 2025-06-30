function imprimirRangoConArray(inicio, fin) {
  const multiplosDe10 = [];

  for (let i = inicio; i <= fin; i++) {
    if (i % 10 === 0) {
      multiplosDe10.push(i);
    }
  }
  return multiplosDe10;
}
var res = imprimirRangoConArray(10, 100);
const ctx = document.getElementById("myChart");
const resistencia = res;
const voltaje = 10;
//const intensidad = []
//resistencia.forEach(function(elemento, indice) {
//   intensidad[indice] = elemento / voltaje;
//});
const intensidad = resistencia.map((r) => voltaje / r); // I = 10V / R
console.log(intensidad);

const data = {
  labels: resistencia,
  datasets: [
    {
      label: "Intensidad",
      data: intensidad,
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};

const myChart = new Chart(ctx, {
  type: "line",
  data: data,
  options: {
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Resistencia (Ω)",
          },
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Intensidad (A)",
          },
        },
      ],
    },
    title: {
      display: true,
      text: "Gráfico de Intensidad vs Resistencia - Voltaje de 10V",
    },
  },
});

const ctx1 = document.getElementById("myChart1");

var volt = imprimirRangoConArray(10, 100);
const voltaje1 = volt;
const resistencia1 = 10;
const resistencia2 = 5;

const intensidad1 = voltaje1.map((v) => v / resistencia1); // I = V / 10R
const intensidad2 = voltaje1.map((v) => v / resistencia2); // I = V / 10R

const data1 = {
  labels: voltaje1,
  datasets: [
    {
      label: "Intensidad",
      data: intensidad1,
      fill: false,
      borderColor: "rgb(199, 54, 54)",
      tension: 0.1,
    },
    {
      label: "Intensidad 2",
      data: intensidad2,
      fill: false,
      borderColor: "rgb(54, 80, 199)",
      tension: 0.1,
    },
  ],
};

const myChart1 = new Chart(ctx1, {
  type: "line",
  data: data1,
  options: {
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Voltaje (V)",
          },
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Intensidad (A)",
          },
        },
      ],
    },
    title: {
      display: true,
      text: "Gráfico de Intensidad vs Voltaje - Resistencia 10Ω",
    },
  },
});

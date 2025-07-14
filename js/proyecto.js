// Diccionario de unidades y sus multiplicadores
const units = {
  V: { V: 1, mV: 0.001, kV: 1000 },
  I: { A: 1, mA: 0.001, kA: 1000 },
  R: { Ω: 1, mΩ: 0.001, kΩ: 1000 },
  P: { W: 1, mW: 0.001, kW: 1000 },
  Q: { J: 1, mJ: 0.001, kJ: 1000, MJ: 1000000, cal: 4.184, kcal: 4184 }, // Joule y Calorías
  t: { s: 1, ms: 0.001, min: 60, hr: 3600 }, // Tiempo
};

// Función para obtener el multiplicador de una unidad
function getMultiplier(unitType, unitName) {
  return units[unitType][unitName];
}
// NUEVA FUNCIÓN PARA MOSTRAR SELECTOR DE FÓRMULAS AMBIGUAS
function showFormulaChoice(formulas) {
  const container = document.getElementById("formula-choice-container");
  container.innerHTML = "";
  if (formulas.length <= 1) return;

  const label = document.createElement("label");
  label.textContent = "Elige la fórmula a usar:";
  label.style.fontWeight = "bold";
  label.style.marginRight = "10px";

  const select = document.createElement("select");
  select.id = "formulaSelect";

  formulas.forEach((f, index) => {
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = f.text;
    if (index === 0) option.selected = true;
    select.appendChild(option);
    if (index === 0) {
      setTimeout(() => generateConstantInputs(), 0);
    }
  });

  container.appendChild(label);
  container.appendChild(select);
  select.addEventListener("change", generateConstantInputs);
}

const xAxisSelect = document.getElementById("xAxis");
const yAxisSelect = document.getElementById("yAxis");
const constantInputsDiv = document.getElementById("constantInputs");
const startUnitSelect = document.getElementById("startUnit");
const endUnitSelect = document.getElementById("endUnit");
const errorMessage = document.getElementById("error-message");
const formulaDisplayElement = document.getElementById("formula-display");

let myChart; // Variable para almacenar la instancia del gráfico de Chart.js

function clearFormulaChoice() {
  const container = document.getElementById("formula-choice-container");
  container.innerHTML = "";
}
// Función para actualizar las unidades de los selectores de rango
function updateRangeUnits() {
  const xAxisType = xAxisSelect.value;
  const xAxisUnits = units[xAxisType];

  startUnitSelect.innerHTML = "";
  endUnitSelect.innerHTML = "";

  for (const unitKey in xAxisUnits) {
    const option = document.createElement("option");
    option.value = unitKey;
    option.textContent = unitKey;
    startUnitSelect.appendChild(option);

    const option2 = document.createElement("option");
    option2.value = unitKey;
    option2.textContent = unitKey;
    endUnitSelect.appendChild(option2);
  }
  // Seleccionar la unidad base por defecto si existe (V, A, Ohm, etc.)
  if (xAxisUnits[xAxisType]) {
    startUnitSelect.value = xAxisType;
    endUnitSelect.value = xAxisType;
  } else if (xAxisType === "t" && xAxisUnits["s"]) {
    startUnitSelect.value = "s";
    endUnitSelect.value = "s";
  }
}

// Función para generar los campos de entrada para las variables constantes
function generateConstantInputs() {
  constantInputsDiv.innerHTML = ""; // Limpiar campos existentes
  errorMessage.textContent = ""; // Limpiar mensajes de error

  const xAxisVar = xAxisSelect.value;
  const yAxisVar = yAxisSelect.value;

  // Las variables posibles son V, I, R, P, t, Q
  const allVariables = ["V", "I", "R", "P", "t", "Q"];
  const neededConstants = allVariables.filter(
    (v) => v !== xAxisVar && v !== yAxisVar
  );

  let constantsToRequest = [];

  // Lógica para determinar qué constantes son necesarias para un cálculo válido
  if (
    ["V", "I", "R"].includes(xAxisVar) &&
    ["V", "I", "R"].includes(yAxisVar)
  ) {
    if (xAxisVar !== yAxisVar) {
      const thirdVar = allVariables.find(
        (v) => ["V", "I", "R"].includes(v) && v !== xAxisVar && v !== yAxisVar
      );
      if (thirdVar) constantsToRequest.push(thirdVar);
    }
  } else if (xAxisVar === "t" && yAxisVar === "Q") {
    constantsToRequest.push("P"); // Q = P*t
  } else if (yAxisVar === "Q") {
    // Si Q es el eje Y y t no es el eje X
    // Para Q = I^2*R*t o Q = V^2/R*t
    if (xAxisVar === "I") {
      constantsToRequest.push("R", "t");
    } else if (xAxisVar === "V") {
      constantsToRequest.push("R", "t");
    } else if (xAxisVar === "R") {
      constantsToRequest.push("I", "t");
    } else if (xAxisVar === "P") {
      constantsToRequest.push("t");
    } else {
      errorMessage.textContent =
        "Para graficar Calor (Q), el Eje X debe ser Tiempo (t), o debe proporcionar P y T, o V, I, R y T.";
      return;
    }
  } else if (yAxisVar === "P") {
    // Si P es el eje Y
    // if (xAxisVar === "V") {
    //   // constantsToRequest.push("I", "R")
    //   const selected = document.getElementById("formulaSelect")?.value;

    //   if (selected === "P=VI") constantsToRequest.push("I");
    //   else if (selected === "V=sqrtPR") constantsToRequest.push("R");
    //   else {
    //     showFormulaChoice([
    //       { id: "V=PI", text: "V = P / I (División)" },
    //       { id: "V=sqrtPR", text: "V = √(P × R)" },
    //     ]);
    //     return;
    //   }
    if (xAxisVar === "I") constantsToRequest.push("V");
    else if (xAxisVar === "R") constantsToRequest.push("I");
    else if (xAxisVar === "V") constantsToRequest.push("R");

    // else if (xAxisVar === "V") constantsToRequest.push("I");
    // if (xAxisVar === "V") {
    //   // constantsToRequest.push("I", "R")
    //   const selected = document.getElementById("formulaSelect")?.value;

    //   if (selected === "P=VI") constantsToRequest.push("I");
    //   else if (selected === "V=sqrtPR") constantsToRequest.push("R");
    //   else {
    //     showFormulaChoice([
    //       { id: "V=PI", text: "V = P / I (División)" },
    //       { id: "V=sqrtPR", text: "V = √(P × R)" },
    //     ]);
    //     return;
    //   }
    // }
    // // if (xAxisVar === "V") constantsToRequest.push("I", "R"); // P=VI=I^2R=V^2/R
    // else if (xAxisVar === "I") constantsToRequest.push("V", "R");
    // else if (xAxisVar === "R") constantsToRequest.push("V", "I");
    // else {
    //   errorMessage.textContent =
    //     "Para graficar Potencia (P), la combinación de ejes requiere al menos dos de (V, I, R).";
    //   return;
    // }
  } else if (yAxisVar === "V") {
    // if (xAxisVar === "I") constantsToRequest.push("R");
    // else if (xAxisVar === "R") constantsToRequest.push("I");
    // else if (xAxisVar === "P") constantsToRequest.push("I", "R"); // V=P/I o V=sqrt(PR)
    if (xAxisVar === "I") constantsToRequest.push("R");
    else if (xAxisVar === "R") constantsToRequest.push("I");
    else if (xAxisVar === "P") {
      const selected = document.getElementById("formulaSelect")?.value;

      if (selected === "V=PI") constantsToRequest.push("I");
      else if (selected === "V=sqrtPR") constantsToRequest.push("R");
      else {
        showFormulaChoice([
          { id: "V=PI", text: "V = P / I (División)" },
          { id: "V=sqrtPR", text: "V = √(P × R)" },
        ]);
        return;
      }
    } else {
      errorMessage.textContent =
        "Para graficar Voltaje (V), la combinación de ejes requiere las constantes correctas.";
      return;
    }
  } else if (yAxisVar === "I") {
    if (xAxisVar === "V") constantsToRequest.push("R");
    else if (xAxisVar === "R") constantsToRequest.push("V");
    else if (xAxisVar === "P") {
      const selected = document.getElementById("formulaSelect")?.value;
      if (selected === "I=P/V") constantsToRequest.push("V");
      else if (selected === "I=sqrtP/R") constantsToRequest.push("R");
      else {
        showFormulaChoice([
          { id: "I=P/V", text: "I = P / V " },
          { id: "I=sqrtP/R", text: "I = √(P / R)" },
        ]);
        return;
      }
    }
    // constantsToRequest.push("V", "R"); // I=P/V o I=sqrt(P/R)
    else {
      errorMessage.textContent =
        "Para graficar Intensidad (I), la combinación de ejes requiere las constantes correctas.";
      return;
    }
  } else if (yAxisVar === "R") {
    if (xAxisVar === "V") constantsToRequest.push("I");
    else if (xAxisVar === "I") constantsToRequest.push("V");
    else if (xAxisVar === "P") {
      const selected = document.getElementById("formulaSelect")?.value;
      if (selected === "R=V*V/P") constantsToRequest.push("V");
      else if (selected === "R=P/I*I") constantsToRequest.push("I");
      else {
        showFormulaChoice([
          { id: "R=V*V/P", text: "R = V^2 / P" },
          { id: "R=P/I*I", text: "R = P / I^2" },
        ]);
        return;
      }
    }
    // constantsToRequest.push("V", "I"); // R=V^2/P o R=P/I^2
    else {
      errorMessage.textContent =
        "Para graficar Resistencia (R), la combinación de ejes requiere las constantes correctas.";
      return;
    }
  }

  // Eliminar duplicados si los hay y ordenar para consistencia
  constantsToRequest = [...new Set(constantsToRequest)].sort();

  constantsToRequest.forEach((constantVar) => {
    const div = document.createElement("div");
    div.className = "input-item";
    div.innerHTML = `
                        <label for="const_${constantVar}">Valor constante de ${getLabel(
      constantVar
    )}:</label>
                        <div>
                            <input type="number" id="const_${constantVar}" value="1" step="any">
                            <select id="unit_const_${constantVar}" class="unit-select"></select>
                        </div>
                    `;
    constantInputsDiv.appendChild(div);

    const unitSelect = div.querySelector(`#unit_const_${constantVar}`);
    const varUnits = units[constantVar];
    for (const unitKey in varUnits) {
      const option = document.createElement("option");
      option.value = unitKey;
      option.textContent = unitKey;
      unitSelect.appendChild(option);
    }
    // Seleccionar la unidad base por defecto
    if (varUnits[constantVar]) {
      unitSelect.value = constantVar;
    } else if (constantVar === "t" && varUnits["s"]) {
      unitSelect.value = "s";
    } else if (constantVar === "Q" && varUnits["J"]) {
      unitSelect.value = "J";
    }
  });

  // Llamar a displayFormula después de generar los inputs
  displayFormula();
}

// Mapeo de variables a sus etiquetas legibles
function getLabel(variable) {
  switch (variable) {
    case "V":
      return "Voltaje";
    case "I":
      return "Intensidad";
    case "R":
      return "Resistencia";
    case "P":
      return "Potencia";
    case "Q":
      return "Calor";
    case "t":
      return "Tiempo";
    default:
      return variable;
  }
}

// Función para mostrar la fórmula aplicada
function displayFormula() {
  const xAxisVar = xAxisSelect.value;
  const yAxisVar = yAxisSelect.value;
  let formulaText = "";

  // Función auxiliar para verificar si una constante está siendo solicitada (su input existe)
  const hasConstantInput = (varName) => {
    return !!document.getElementById(`const_${varName}`);
  };

  if (yAxisVar === "V") {
    if (xAxisVar === "I" && hasConstantInput("R"))
      formulaText = "V = I ⋅ R (Ley de Ohm)";
    else if (xAxisVar === "R" && hasConstantInput("I"))
      formulaText = "V = I ⋅ R (Ley de Ohm)";
    else if (xAxisVar === "P") {
      if (hasConstantInput("I")) formulaText = "V = P / I";
      else if (hasConstantInput("R")) formulaText = "V = √ (P ⋅ R)";
      else formulaText = "Fórmula V vs P (necesita I o R)";
    }
    // else if (xAxisVar === "t" && hasConstantInput("I") && hasConstantInput("R")) formulaText = "V = I ⋅ R (constante)";
    // else if (xAxisVar === "Q" && hasConstantInput("I") && hasConstantInput("R") && hasConstantInput("t")) formulaText = "V = I ⋅ R (derivado de Q)";
    else formulaText = `${getLabel(yAxisVar)} = f(${getLabel(xAxisVar)})`; // General fallback
  } else if (yAxisVar === "I") {
    if (xAxisVar === "V" && hasConstantInput("R"))
      formulaText = "I = V / R (Ley de Ohm)";
    else if (xAxisVar === "R" && hasConstantInput("V"))
      formulaText = "I = V / R (Ley de Ohm)";
    else if (xAxisVar === "P") {
      if (hasConstantInput("V")) formulaText = "I = P / V";
      else if (hasConstantInput("R")) formulaText = "I = √ (P / R)";
      else formulaText = "Fórmula I vs P (necesita V o R)";
    } else if (
      xAxisVar === "t" &&
      hasConstantInput("V") &&
      hasConstantInput("R")
    )
      formulaText = "I = V / R (constante)";
    else if (
      xAxisVar === "Q" &&
      hasConstantInput("V") &&
      hasConstantInput("R") &&
      hasConstantInput("t")
    )
      formulaText = "I = V / R (derivado de Q)";
    else formulaText = `${getLabel(yAxisVar)} = f(${getLabel(xAxisVar)})`;
  } else if (yAxisVar === "R") {
    if (xAxisVar === "V" && hasConstantInput("I"))
      formulaText = "R = V / I (Ley de Ohm)";
    else if (xAxisVar === "I" && hasConstantInput("V"))
      formulaText = "R = V / I (Ley de Ohm)";
    else if (xAxisVar === "P") {
      if (hasConstantInput("I")) formulaText = "R = P / I²";
      else if (hasConstantInput("V")) formulaText = "R = V² / P";
      else formulaText = "Fórmula R vs P (necesita V o I)";
    } else if (
      xAxisVar === "t" &&
      hasConstantInput("V") &&
      hasConstantInput("I")
    )
      formulaText = "R = V / I (constante)";
    else if (xAxisVar === "Q" && hasConstantInput("I") && hasConstantInput("t"))
      formulaText = "R = Q / (I² ⋅ t)";
    else formulaText = `${getLabel(yAxisVar)} = f(${getLabel(xAxisVar)})`;
  } else if (yAxisVar === "P") {
    if (xAxisVar === "V") {
      if (hasConstantInput("I")) formulaText = "P = V ⋅ I";
      else if (hasConstantInput("R")) formulaText = "P = V² / R";
      else formulaText = "Fórmula P vs V (necesita I o R)";
    } else if (xAxisVar === "I") {
      if (hasConstantInput("V")) formulaText = "P = V ⋅ I";
      else if (hasConstantInput("R")) formulaText = "P = I² ⋅ R";
      else formulaText = "Fórmula P vs I (necesita V o R)";
    } else if (xAxisVar === "R") {
      if (hasConstantInput("V")) formulaText = "P = V² / R";
      else if (hasConstantInput("I")) formulaText = "P = I² ⋅ R";
      else formulaText = "Fórmula P vs R (necesita V o I)";
    } else if (xAxisVar === "t") {
      // If P is Y and t is X, then P should be constant, or derived from V,I,R
      if (hasConstantInput("V") && hasConstantInput("I"))
        formulaText = "P = V ⋅ I (constante)";
      else if (hasConstantInput("I") && hasConstantInput("R"))
        formulaText = "P = I² ⋅ R (constante)";
      else if (hasConstantInput("V") && hasConstantInput("R"))
        formulaText = "P = V² / R (constante)";
      else formulaText = "Fórmula P vs t (P es constante)";
    } else if (xAxisVar === "Q" && hasConstantInput("t"))
      formulaText = "P = Q / t";
    else formulaText = `${getLabel(yAxisVar)} = f(${getLabel(xAxisVar)})`;
  } else if (yAxisVar === "Q") {
    if (xAxisVar === "t") {
      if (hasConstantInput("P")) formulaText = "Q = P ⋅ t (Ley de Joule)";
      else if (hasConstantInput("I") && hasConstantInput("R"))
        formulaText = "Q = I² ⋅ R ⋅ t (Ley de Joule)";
      else if (hasConstantInput("V") && hasConstantInput("R"))
        formulaText = "Q = V² / R ⋅ t (Ley de Joule)";
      else if (hasConstantInput("V") && hasConstantInput("I"))
        formulaText = "Q = V ⋅ I ⋅ t (Ley de Joule)";
      else formulaText = "Fórmula Q vs t (necesita P, o V,I,R)";
    } else if (
      xAxisVar === "V" &&
      hasConstantInput("I") &&
      hasConstantInput("t")
    )
      formulaText = "Q = V ⋅ I ⋅ t";
    else if (xAxisVar === "I" && hasConstantInput("R") && hasConstantInput("t"))
      formulaText = "Q = I² ⋅ R ⋅ t";
    else if (xAxisVar === "R" && hasConstantInput("I") && hasConstantInput("t"))
      formulaText = "Q = I² ⋅ R ⋅ t";
    else if (xAxisVar === "P" && hasConstantInput("t"))
      formulaText = "Q = P ⋅ t";
    else formulaText = `${getLabel(yAxisVar)} = f(${getLabel(xAxisVar)})`;
  } else {
    formulaText = "Seleccione Eje X y Eje Y para ver la fórmula aplicable.";
  }

  formulaDisplayElement.innerHTML = `Fórmula Aplicada: <strong>${formulaText}</strong>`;
}

// Escucha cambios en los selectores de eje para actualizar las unidades y constantes
xAxisSelect.addEventListener("change", () => {
  updateRangeUnits();
  generateConstantInputs();
  // displayFormula() se llama dentro de generateConstantInputs()
});
yAxisSelect.addEventListener("change", () => {
  generateConstantInputs();
  // displayFormula() se llama dentro de generateConstantInputs()
});

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  updateRangeUnits();
  generateConstantInputs();
  // displayFormula() se llama dentro de generateConstantInputs()
});

// Función principal para generar el gráfico
function generateGraph() {
  errorMessage.textContent = ""; // Limpiar errores anteriores

  const xAxisVar = xAxisSelect.value;
  const yAxisVar = yAxisSelect.value;

  let startVal = parseFloat(document.getElementById("startValue").value);
  let endVal = parseFloat(document.getElementById("endValue").value);
  const numPoints = parseInt(document.getElementById("numPoints").value);

  if (isNaN(startVal) || isNaN(endVal) || isNaN(numPoints) || numPoints <= 0) {
    errorMessage.textContent =
      "Por favor, ingrese valores numéricos válidos para el rango y el número de puntos.";
    return;
  }
  if (startVal >= endVal) {
    errorMessage.textContent =
      "El valor inicial debe ser menor que el valor final para el Eje X.";
    return;
  }

  // Aplicar multiplicadores de unidad a los valores de rango
  startVal *= getMultiplier(
    xAxisVar,
    document.getElementById("startUnit").value
  );
  endVal *= getMultiplier(xAxisVar, document.getElementById("endUnit").value);

  const data = [];
  const labels = [];

  // Obtener los valores constantes ingresados por el usuario
  const constants = {};
  const constantInputs = constantInputsDiv.querySelectorAll(
    'input[type="number"]'
  );
  let constantsError = false;
  constantInputs.forEach((input) => {
    const varName = input.id.replace("const_", "");
    let value = parseFloat(input.value);
    const unitSelectId = `unit_${input.id}`;
    const unit = document.getElementById(unitSelectId).value;

    if (isNaN(value)) {
      errorMessage.textContent = `Por favor, ingrese un valor numérico para ${getLabel(
        varName
      )}.`;
      constantsError = true;
      return; // Detener la iteración actual
    }
    value *= getMultiplier(varName, unit);
    constants[varName] = value;
  });

  if (constantsError) return; // Si hubo un error en las constantes, detener

  const step = (endVal - startVal) / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const xVal = startVal + i * step;
    labels.push(xVal.toFixed(2)); // Para las etiquetas del eje X

    let yVal;
    let V = constants["V"];
    let I = constants["I"];
    let R = constants["R"];
    let P = constants["P"];
    let t = constants["t"];

    // Asignar el valor del eje X a la variable correspondiente
    switch (xAxisVar) {
      case "V":
        V = xVal;
        break;
      case "I":
        I = xVal;
        break;
      case "R":
        R = xVal;
        break;
      case "P":
        P = xVal;
        break;
      case "t":
        t = xVal;
        break;
    }

    try {
      // Lógica de cálculo basada en los ejes y las constantes
      if (yAxisVar === "V") {
        if (xAxisVar === "I" && R !== undefined) yVal = I * R; //V = I * R
        else if (xAxisVar === "R" && I !== undefined) yVal = I * R; // V = R * I
        else if (xAxisVar === "P" && I !== undefined) yVal = P / I; // V = P / I
        else if (xAxisVar === "P" && R !== undefined)
          yVal = Math.sqrt(P * R); // V = sqrt(PxR)
        else {
          throw new Error("Combinación de variables inválida para V.");
        }
      } else if (yAxisVar === "I") {
        if (xAxisVar === "V" && R !== undefined) yVal = V / R;
        else if (xAxisVar === "R" && V !== undefined) yVal = V / R;
        else if (xAxisVar === "P" && V !== undefined) yVal = P / V;
        else if (xAxisVar === "P" && R !== undefined) yVal = Math.sqrt(P / R);
        else {
          throw new Error("Combinación de variables inválida para I.");
        }
      } else if (yAxisVar === "R") {
        if (xAxisVar === "V" && I !== undefined) yVal = V / I;
        else if (xAxisVar === "I" && V !== undefined) yVal = V / I;
        else if (xAxisVar === "P" && I !== undefined) yVal = P / (I * I);
        else if (xAxisVar === "P" && V !== undefined) yVal = (V * V) / P;
        else {
          throw new Error("Combinación de variables inválida para R.");
        }
      } else if (yAxisVar === "P") {
        if (V !== undefined && I !== undefined) yVal = V * I;
        else if (I !== undefined && R !== undefined) yVal = I * I * R;
        else if (V !== undefined && R !== undefined) yVal = (V * V) / R;
        else {
          throw new Error("Combinación de variables inválida para P.");
        }
      } else if (yAxisVar === "Q") {
        if (t === undefined)
          throw new Error("Tiempo (t) es requerido para calcular Calor (Q).");

        // Intentar calcular P primero
        let currentP;
        if (P !== undefined) {
          currentP = P;
        } else if (V !== undefined && I !== undefined) {
          currentP = V * I;
        } else if (I !== undefined && R !== undefined) {
          currentP = I * I * R;
        } else if (V !== undefined && R !== undefined) {
          currentP = (V * V) / R;
        } else {
          throw new Error(
            "Se necesitan V e I, o I y R, o V y R para calcular Potencia y luego Calor."
          );
        }
        yVal = currentP * t;
      }

      if (isNaN(yVal) || !isFinite(yVal)) {
        throw new Error(
          "División por cero o resultado inválido (ej. raíz cuadrada de negativo)."
        );
      }
      data.push(yVal);
    } catch (e) {
      errorMessage.textContent = `Error de cálculo: ${e.message} Por favor, verifique sus valores constantes.`;
      // Llenar el resto de los datos con NaN para evitar errores en el gráfico
      for (let j = i; j < numPoints; j++) data.push(NaN);
      break;
    }
  }

  if (myChart) {
    myChart.destroy(); // Destruye el gráfico anterior si existe
  }

  const ctx = document.getElementById("myChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `${getLabel(yAxisVar)} vs. ${getLabel(xAxisVar)}`,
          data: data,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Gráfico de ${getLabel(yAxisVar)} en función de ${getLabel(
            xAxisVar
          )}`,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: `${getLabel(xAxisVar)} (${xAxisSelect.value})`,
          },
        },
        y: {
          title: {
            display: true,
            text: `${getLabel(yAxisVar)} (${yAxisSelect.value})`,
          },
          beginAtZero: true, // Puede ser útil para muchos gráficos de Ohm
        },
      },
    },
  });
}

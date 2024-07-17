const xlsx = require('xlsx');
const prompt = require('prompt-sync');

// Función para leer las posiciones
function leerPosiciones(path_sf) {
    console.log(`Reading positions from: ${path_sf}`);
    const workbook = xlsx.readFile(path_sf);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const headers = data[0];
    const CODIGO_INSTRUMENTO_INDEX = headers.indexOf('CODIGO INSTRUMENTO');
    const POSICION_DISPONIBLE_INDEX = headers.indexOf('POSICION DISPONIBLE');

    const posiciones = {};
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const codigoInstrumento = row[CODIGO_INSTRUMENTO_INDEX].trim();
        const posicionDisponible = row[POSICION_DISPONIBLE_INDEX];
        posiciones[codigoInstrumento] = posicionDisponible;
    }

    return posiciones;
}

// Función para calcular operaciones diarias
function calcularOperacionesDiarias(path_od) {
    console.log(`Calculating daily operations from: ${path_od}`);
    const workbook = xlsx.readFile(path_od);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const headers = data[0];
    const TIPO_OPERACION_INDEX = headers.indexOf('Tipo Operación');
    const CANTIDAD_INDEX = headers.indexOf('Cantidad');

    const operacionesDiarias = {};
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const operacion = row[TIPO_OPERACION_INDEX];
        const cantidad = row[CANTIDAD_INDEX];

        if (operacion.includes('Venta')) {
            const nombreVenta = operacion.substring(6).toUpperCase();
            if (operacionesDiarias[nombreVenta]) {
                operacionesDiarias[nombreVenta] -= cantidad;
            } else {
                operacionesDiarias[nombreVenta] = -cantidad;
            }
        } else {
            const nombreCompra = operacion.substring(7).toUpperCase();
            if (operacionesDiarias[nombreCompra]) {
                operacionesDiarias[nombreCompra] += cantidad;
            } else {
                operacionesDiarias[nombreCompra] = cantidad;
            }
        }
    }

    return operacionesDiarias;
}

// Función para actualizar posiciones
function actualizarPosiciones(serviciosFinancieros, operacionesDiarias, userInput) {
    const resultado = { ...serviciosFinancieros };
    const corta = {};
    const simultanea = {};
    const garantia = {};

    for (const [key, value] of Object.entries(operacionesDiarias)) {
        if (resultado[key] !== undefined) {
            resultado[key] += value;
        } else {
            const tipo = userInput[key];
            if (tipo === 'simultanea') {
                simultanea[key] = (simultanea[key] || 0) + value;
            } else if (tipo === 'corta') {
                corta[key] = (corta[key] || 0) + value;
            } else if (tipo === 'garantia') {
                garantia[key] = (garantia[key] || 0) + value;
            }
        }
    }

    return { resultado, corta, simultanea, garantia };
}

// Función para comprobar las fechas
function comprobarFechas(path_sf, path_od) {
    console.log(`Checking dates between: ${path_sf} and ${path_od}`);
    const workbookSF = xlsx.readFile(path_sf);
    const sheetSF = workbookSF.Sheets[workbookSF.SheetNames[0]];
    const dataSF = xlsx.utils.sheet_to_json(sheetSF, { header: 1 });
    const fechaSF = dataSF[1][dataSF[0].indexOf('FECHA')];

    const workbookOD = xlsx.readFile(path_od);
    const sheetOD = workbookOD.Sheets[workbookOD.SheetNames[0]];
    const dataOD = xlsx.utils.sheet_to_json(sheetOD, { header: 1 });
    const fechaOD = dataOD[1][dataOD[0].indexOf('Fecha')];

    const dateSF = new Date(fechaSF).setHours(0, 0, 0, 0);
    const dateOD = new Date(fechaOD).setHours(0, 0, 0, 0);

    return (dateSF - dateOD) === 86400000; // 86400000 ms = 1 day
}

// Función principal
function main(path_sf, path_od, userInput) {
    if (comprobarFechas(path_sf, path_od)) {
        console.log('No corresponden las fechas de los archivos subidos');
        return JSON.stringify({ error: 'No corresponden las fechas de los archivos subidos' });
    }

    const serviciosFinancieros = leerPosiciones(path_sf);

    const operacionesDiarias = calcularOperacionesDiarias(path_od);

    const inputsPreguntas = Object.keys(operacionesDiarias).filter(key => !serviciosFinancieros[key] && !userInput[key]);

    if (inputsPreguntas.length > 0) {
        return JSON.stringify({ prompts: inputsPreguntas });
    }

    const { resultado, corta, simultanea, garantia } = actualizarPosiciones(serviciosFinancieros, operacionesDiarias, userInput);
    return JSON.stringify({
        resultado,
        corta, 
        simultanea, 
        garantia
    });
}

module.exports = main;

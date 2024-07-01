import pandas as pd

#Almacenar en un diccionario las posiciones. Ej: {'SMU': 123100, 'CENCOSUD': 312314, etc...}
def leer_posiciones(path_sf):
    sf_0406 = pd.read_excel(path_sf, engine='openpyxl')
    posiciones = sf_0406.set_index('CODIGO INSTRUMENTO')['POSICION DISPONIBLE'].to_dict()
    posiciones = {key.strip(): value for key, value in posiciones.items()}
    return posiciones

#Almacenar en un diccionario las suma total entre las compras y ventas de empresas, incluyendo todas las compras y ventas.
def calcular_operaciones_diarias(path_od):
    od_0306 = pd.read_excel(path_od, engine='xlrd')
    operaciones_diarias = {}
    for operacion, cantidad in zip(od_0306["Tipo Operación"], od_0306["Cantidad"]):
        if 'Venta' in operacion:
            nombre_venta = operacion[6:].upper()
            if nombre_venta in operaciones_diarias:
                operaciones_diarias[nombre_venta] -= cantidad
            else:
                operaciones_diarias[nombre_venta] = -cantidad
        else:
            nombre_compra = operacion[7:].upper()
            if nombre_compra in operaciones_diarias:
                operaciones_diarias[nombre_compra] += cantidad
            else:
                operaciones_diarias[nombre_compra] = cantidad
    return operaciones_diarias

#Hacer la suma entre los values del diccionario de servicios financieros y los values de operaciones diarias. 
#La suma entre S.F y O.D se almacena en un nuevo diccionario. 
def actualizar_posiciones(servicios_financieros, operaciones_diarias):
    resultado = servicios_financieros.copy()
    corta = {}
    simultanea = {}
    garantia = {}
    for key, value in operaciones_diarias.items():
        if key in resultado:
            resultado[key] += value
        else:
            tipo = input(f"{key} es simultanea, corta o garantia? ")
            if tipo == 'simultanea':
                if tipo in simultanea:
                    simultanea[key] += value
                else:
                    simultanea[key] = value
            elif tipo == 'corta':
                if tipo in corta:
                    corta[key] += value
                else:
                    corta[key] = value
            elif tipo == 'garantia':
                if tipo in garantia:
                    garantia[key] +=value
                else:
                    garantia[key] = value    
    return resultado, corta, simultanea, garantia

def comprobar_fechas(path_sf, path_od):
    od_0306 = pd.read_excel(path_od, engine='xlrd')
    sf_0406 = pd.read_excel(path_sf, engine='openpyxl')

    fecha_sf = sf_0406['FECHA'].iloc[0]
    fecha_od = od_0306['Fecha'].iloc[0]

    date_sf = pd.to_datetime(fecha_sf).normalize()
    date_od = pd.to_datetime(fecha_od).normalize()

    diferencia = date_sf - date_od
    if diferencia == 1:
        return True
    else: 
        return False

def main(path_sf, path_od):
    if comprobar_fechas(path_sf, path_od):
        print('Hola')
        return "No corresponden las fechas de los archivos subidos"
    else:    
        servicios_financieros = leer_posiciones(path_sf)
        print("POSICIONES SERVICIOS FINANCIEROS:")
        print(servicios_financieros)
        print('\n')

        operaciones_diarias = calcular_operaciones_diarias(path_od)
        print("NETO OPERACIONES DIARIAS:")
        print(operaciones_diarias)
        print("\n")

        resultado, corta, simultanea, garantia = actualizar_posiciones(servicios_financieros, operaciones_diarias)
        print('Resultado: ')
        print(resultado)
        print('\n')
        print("Corta:", corta)
        print("Simultanea:", simultanea)
        print("Garantia:", garantia)
        print('\n')



# Paths to the Excel files
path_sf = "./Excels/SERVICIOS FINANCIEROS 04:06.xlsx"
path_od = "./Excels/OPERACIONES DIARIAS 03:06.xls"

# Execute main function
main(path_sf, path_od)
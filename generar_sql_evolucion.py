import json
import random
from datetime import datetime, timedelta

nombres_list = ["Juan", "Maria", "Carlos", "Ana", "Luis", "Elena", "Pedro", "Sofia", "Jorge", "Lucia", "Andres", "Camila"]
apellidos_list = ["Perez", "Gomez", "Rodriguez", "Lopez", "Martinez", "Hernandez", "Diaz", "Torres"]

CLASIFICACIONES = ["Peso adecuado", "Sobrepeso", "Bajo peso", "Obesidad"]
PESOS_CLASIFICACION = [0.60, 0.20, 0.10, 0.10]

with open('mockData.json', 'r', encoding='utf-16') as f:
    datos = json.load(f)

estudiantes_sql = ["-- PASO 1: INSERTAR ESTUDIANTES"]
asistencias_sql = ["-- PASO 2: INSERTAR ASISTENCIAS (1 por día máximo)"]
valoraciones_sql = ["-- PASO 3: INSERTAR VALORACIONES (Con múltiples registros para evolución)"]

procesados = set()

for item in datos:
    sufijo = str(random.randint(100, 999))
    cod = f"1035{sufijo}"
    
    if cod in procesados: continue
    
    edad_base = random.randint(17, 30)
    
    # 1. Definir días de visita ÚNICOS (entre 2 y 5 días distintos en los últimos 30 días)
    num_dias_visita = random.randint(2, 5)
    dias_atras_seleccionados = sorted(random.sample(range(0, 31), num_dias_visita), reverse=True)
    
    fechas_visita = []
    for d in dias_atras_seleccionados:
        fecha = datetime.now() - timedelta(days=d, hours=random.randint(8, 16), minutes=random.randint(0, 59))
        fechas_visita.append(fecha)

    fecha_registro_inicial = fechas_visita[0].strftime('%Y-%m-%d %H:%M:%S+00')

    # Estudiante
    estudiantes_sql.append(
        f"INSERT INTO estudiantes (codigo_estudiantil, numero_documento, nombres, apellidos, carrera, facultad, estrato, huella_hash, estado_beneficio, fecha_registro, dias_beneficio) "
        f"VALUES ('{cod}', '{random.randint(1000000000, 9999999999)}', '{random.choice(nombres_list)}', '{random.choice(apellidos_list)}', 'Ingeniería de Sistemas', 'Facultad de Ingeniería', {random.randint(1,4)}, 'hash_{cod}', true, '{fecha_registro_inicial}', ARRAY['Lunes', 'Miércoles']::text[]) "
        f"ON CONFLICT (codigo_estudiantil) DO NOTHING;"
    )

    # 2. Asistencias (Garantizamos que sea una sola por fecha distinta)
    for fecha in fechas_visita:
        fecha_str = fecha.strftime('%Y-%m-%d %H:%M:%S+00')
        asistencias_sql.append(f"INSERT INTO asistencias (codigo_estudiante, fecha_hora) VALUES ('{cod}', '{fecha_str}');")

    # 3. Valoraciones Nutricionales (Múltiples registros en el tiempo para la evolución)
    # Creamos de 2 a 3 valoraciones en diferentes momentos del mes
    dias_valoracion = sorted(list(set([dias_atras_seleccionados[0], dias_atras_seleccionados[-1]])), reverse=True)
    if len(dias_atras_seleccionados) > 2 and len(dias_valoracion) < 3:
        dias_valoracion.insert(1, dias_atras_seleccionados[len(dias_atras_seleccionados)//2])

    for d in dias_valoracion:
        fecha_val = datetime.now() - timedelta(days=d, hours=7)
        fecha_val_str = fecha_val.strftime('%Y-%m-%d %H:%M:%S+00')
        
        clasificacion = random.choices(CLASIFICACIONES, weights=PESOS_CLASIFICACION)[0]
        peso = round(random.uniform(55.0, 85.0), 1)
        talla = 175
        imc = round(peso / ((talla/100)**2), 1)
        
        valoraciones_sql.append(
            f"INSERT INTO valoraciones_nutricionales (codigo_estudiante, fecha_valoracion, edad, sexo_biologico, peso_kg, talla_cm, imc, clasificacion_minsalud, actividad_fisica, preferencia_dietaria) "
            f"VALUES ('{cod}', '{fecha_val_str}', {edad_base}, 'M', {peso}, {talla}, {imc}, '{clasificacion}', 'Activo', 'Omnívoro');"
        )
    
    procesados.add(cod)

with open('import_evolucion.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(estudiantes_sql) + "\n\n" + "\n".join(asistencias_sql) + "\n\n" + "\n".join(valoraciones_sql))

print("¡Archivo 'import_evolucion.sql' generado correctamente!")
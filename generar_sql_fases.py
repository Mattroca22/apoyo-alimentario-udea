import json
import random
from datetime import datetime, timedelta

# Listas para nombres reales
nombres_list = ["Juan", "Maria", "Carlos", "Ana", "Luis", "Elena", "Pedro", "Sofia", "Jorge", "Lucia", "Andres", "Camila"]
apellidos_list = ["Perez", "Gomez", "Rodriguez", "Lopez", "Martinez", "Hernandez", "Diaz", "Torres"]

# Configuración de pesos para clasificación nutricional
CLASIFICACIONES = ["Peso adecuado", "Sobrepeso", "Bajo peso", "Obesidad"]
PESOS_CLASIFICACION = [0.60, 0.20, 0.10, 0.10] # 60% adecuado, resto distribuido

def get_fecha_aleatoria():
    # Genera fecha en los últimos 30 días
    dias_atras = random.randint(0, 30)
    fecha = datetime.now() - timedelta(days=dias_atras)
    # Formato SQL
    return fecha.strftime('%Y-%m-%d %H:%M:%S+00')

with open('mockData.json', 'r', encoding='utf-16') as f:
    datos = json.load(f)

estudiantes_sql = ["-- PASO 1: INSERTAR ESTUDIANTES"]
asistencias_sql = ["-- PASO 2: INSERTAR ASISTENCIAS"]
valoraciones_sql = ["-- PASO 3: INSERTAR VALORACIONES"]

procesados = set()

for item in datos:
    sufijo = str(random.randint(100, 999))
    cod = f"1035{sufijo}"
    
    if cod in procesados: continue
    
    # Generar datos
    edad = random.randint(17, 30)
    clasificacion = random.choices(CLASIFICACIONES, weights=PESOS_CLASIFICACION)[0]
    fecha_registro = get_fecha_aleatoria()
    
    # 1. Estudiantes
    estudiantes_sql.append(
        f"INSERT INTO estudiantes (codigo_estudiantil, numero_documento, nombres, apellidos, carrera, facultad, estrato, huella_hash, estado_beneficio, fecha_registro, dias_beneficio) "
        f"VALUES ('{cod}', '{random.randint(1000000000, 9999999999)}', '{random.choice(nombres_list)}', '{random.choice(apellidos_list)}', 'Ingeniería de Sistemas', 'Facultad de Ingeniería', {random.randint(1,4)}, 'hash_{cod}', true, '{fecha_registro}', ARRAY['Lunes', 'Miércoles']::text[]) "
        f"ON CONFLICT (codigo_estudiantil) DO NOTHING;"
    )

    # 2. Asistencias (Fechas aleatorias de hace 30 días)
    asistencias_sql.append(f"INSERT INTO asistencias (codigo_estudiante, fecha_hora) VALUES ('{cod}', '{get_fecha_aleatoria()}');")

    # 3. Valoraciones (Con la edad para tus quinquenios)
    valoraciones_sql.append(
        f"INSERT INTO valoraciones_nutricionales (codigo_estudiante, fecha_valoracion, edad, sexo_biologico, peso_kg, talla_cm, imc, clasificacion_minsalud, actividad_fisica, preferencia_dietaria) "
        f"VALUES ('{cod}', '{fecha_registro}', {edad}, 'M', 70.5, 175, 23.0, '{clasificacion}', 'Activo', 'Omnívoro');"
    )
    
    procesados.add(cod)

with open('import_realista.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(estudiantes_sql) + "\n\n" + "\n".join(asistencias_sql) + "\n\n" + "\n".join(valoraciones_sql))

print("¡Archivo 'import_realista.sql' listo con distribución de 30 días y edades para histogramas!")
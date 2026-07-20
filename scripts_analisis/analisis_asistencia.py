import os
from dotenv import load_dotenv
from supabase import create_client
import pandas as pd

# Cargar credenciales
load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Conectar a la API
supabase = create_client(url, key)

# Obtener los datos
response = supabase.table("asistencias").select("*, estudiantes(facultad)").execute()

# Convertir a DataFrame de Pandas
df = pd.DataFrame(response.data)

print("¡Conexión exitosa! Primeros registros:")
print(df.head())
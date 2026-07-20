function generarRegistros(cantidad) {
    const registros = [];
    const facultades = ['Ingeniería', 'Medicina', 'Ciencias Exactas', 'Artes', 'Derecho', 'Ciencias Económicas'];
    const estados = ['Peso adecuado', 'Sobrepeso', 'Bajo peso'];
    
    // Fecha de inicio: 20 de abril de 2026
    const fechaInicio = new Date('2026-04-20T00:00:00');
    const fechaFin = new Date('2026-07-20T23:59:59');

    let contador = 0;
    while (contador < cantidad) {
        // Generar fecha aleatoria
        const randomTime = fechaInicio.getTime() + Math.random() * (fechaFin.getTime() - fechaInicio.getTime());
        const fecha = new Date(randomTime);

        // Validar: Solo días de semana (1 a 5) y horas entre 11 y 15
        const dia = fecha.getDay(); // 0 es domingo, 6 es sábado
        const hora = fecha.getHours();

        if (dia !== 0 && dia !== 6 && hora >= 11 && hora < 15) {
            registros.push({
                codigo_estudiante: Math.floor(Math.random() * 9000) + 1000,
                fecha_hora: fecha.toISOString(),
                estudiantes: {
                    nombres: `Estudiante ${contador + 1}`,
                    apellidos: 'Test',
                    facultad: facultades[Math.floor(Math.random() * facultades.length)],
                    valoraciones_nutricionales: [
                        { clasificacion_minsalud: estados[Math.floor(Math.random() * estados.length)] }
                    ]
                }
            });
            contador++;
        }
    }
    return registros;
}

// Generar y mostrar los 150 registros
console.log(JSON.stringify(generarRegistros(150), null, 2));
/**
 * Validador de cédula ecuatoriana
 * Implementa el algoritmo oficial de validación del dígito verificador
 */

export class CedulaEcuatorianaValidator {
  /**
   * Valida si una cédula ecuatoriana es válida
   * @param cedula - Número de cédula a validar (10 dígitos)
   * @returns true si la cédula es válida, false en caso contrario
   */
  static isValid(cedula: string): boolean {
    // Limpiar espacios y caracteres no numéricos
    const cedulaLimpia = cedula.replace(/\D/g, '');
    
    // Verificar que tenga exactamente 10 dígitos
    if (cedulaLimpia.length !== 10) {
      return false;
    }

    // Verificar que todos sean números
    if (!/^\d{10}$/.test(cedulaLimpia)) {
      return false;
    }

    // Extraer los dígitos
    const digitos = cedulaLimpia.split('').map(Number);
    
    // Verificar que los dos primeros dígitos correspondan a una provincia válida (01-24)
    const codigoProvincia = parseInt(cedulaLimpia.substring(0, 2));
    if (codigoProvincia < 1 || codigoProvincia > 24) {
      return false;
    }

    // Verificar que el tercer dígito sea menor a 6 (para personas naturales)
    if (digitos[2] >= 6) {
      return false;
    }

    // Aplicar el algoritmo de validación del dígito verificador
    const digitoVerificador = digitos[9];
    let suma = 0;
    
    // Procesar los primeros 9 dígitos
    for (let i = 0; i < 9; i++) {
      let digito = digitos[i];
      
      // Multiplicar por 2 los dígitos en posiciones pares (0, 2, 4, 6, 8)
      if (i % 2 === 0) {
        digito *= 2;
        // Si el resultado es mayor a 9, restar 9
        if (digito > 9) {
          digito -= 9;
        }
      }
      
      suma += digito;
    }
    
    // Calcular el dígito verificador esperado
    const residuo = suma % 10;
    const digitoEsperado = residuo === 0 ? 0 : 10 - residuo;
    
    // Comparar con el dígito verificador real
    return digitoVerificador === digitoEsperado;
  }

  /**
   * Valida y formatea una cédula ecuatoriana
   * @param cedula - Número de cédula a validar y formatear
   * @returns Cédula formateada si es válida, null si es inválida
   */
  static validateAndFormat(cedula: string): string | null {
    if (!this.isValid(cedula)) {
      return null;
    }
    
    // Retornar cédula limpia (solo números)
    return cedula.replace(/\D/g, '');
  }

  /**
   * Obtiene información adicional de la cédula (provincia)
   * @param cedula - Cédula válida
   * @returns Información de la provincia o null si es inválida
   */
  static getProvinciaInfo(cedula: string): { codigo: number; nombre: string } | null {
    if (!this.isValid(cedula)) {
      return null;
    }

    const codigoProvincia = parseInt(cedula.substring(0, 2));
    const provincias: { [key: number]: string } = {
      1: 'Azuay',
      2: 'Bolívar',
      3: 'Cañar',
      4: 'Carchi',
      5: 'Cotopaxi',
      6: 'Chimborazo',
      7: 'El Oro',
      8: 'Esmeraldas',
      9: 'Guayas',
      10: 'Imbabura',
      11: 'Loja',
      12: 'Los Ríos',
      13: 'Manabí',
      14: 'Morona Santiago',
      15: 'Napo',
      16: 'Pastaza',
      17: 'Pichincha',
      18: 'Tungurahua',
      19: 'Zamora Chinchipe',
      20: 'Galápagos',
      21: 'Sucumbíos',
      22: 'Orellana',
      23: 'Santo Domingo de los Tsáchilas',
      24: 'Santa Elena'
    };

    return {
      codigo: codigoProvincia,
      nombre: provincias[codigoProvincia] || 'Provincia no identificada'
    };
  }
}

/**
 * Función helper para usar en validaciones
 * @param cedula - Cédula a validar
 * @returns true si es válida, false en caso contrario
 */
export const isValidCedulaEcuatoriana = (cedula: string): boolean => {
  return CedulaEcuatorianaValidator.isValid(cedula);
};

/**
 * Mensaje de error descriptivo para cédulas inválidas
 */
export const CEDULA_ERROR_MESSAGE = 'Debe ingresar una cédula ecuatoriana válida (10 dígitos)';

/**
 * Regex básico para cédula ecuatoriana (solo formato, no valida algoritmo)
 */
export const CEDULA_REGEX = /^[0-9]{10}$/;
